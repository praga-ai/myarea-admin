# Backend Setup - Email Verification & Admin Approval with Azure Key Vault

## Overview

The MyArea registration workflow now uses backend APIs for:
- Email verification with code generation and sending
- Admin approval workflow
- User account creation
- Confirmation/rejection email sending

## Required Backend APIs

The frontend expects the following APIs to be implemented in your Azure Functions backend:

### 1. Registration Request
**Endpoint**: `POST /api/auth/register-request`

**Request Body**:
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "roleId": 2
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Registration request submitted. Check your email for verification code.",
  "registrationId": "reg_12345"
}
```

**Responsibilities**:
- ✓ Validate email format and password requirements
- ✓ Generate 6-digit verification code
- ✓ Store registration request with status: `pending-verification`
- ✓ Send verification email via email service (SendGrid, AWS SES, etc.)
- ✓ Return success response

---

### 2. Email Verification
**Endpoint**: `POST /api/auth/verify-email`

**Request Body**:
```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Email verified successfully. Awaiting admin approval.",
  "registrationId": "reg_12345"
}
```

**Responsibilities**:
- ✓ Validate verification code matches stored code
- ✓ Check code hasn't expired (suggest 24-hour expiry)
- ✓ Update registration status: `email-verified`
- ✓ Return success response

---

### 3. Pending Registrations List (Admin Only)
**Endpoint**: `GET /api/auth/pending-registrations`

**Headers**:
```
Authorization: Bearer [JWT_TOKEN]
```

**Response (Success - 200)**:
```json
{
  "registrations": [
    {
      "email": "user@example.com",
      "fullName": "John Doe",
      "roleId": 2,
      "roleName": "Surveyor",
      "createdAt": "2026-06-10T10:30:00Z",
      "emailVerified": true,
      "verifiedAt": "2026-06-10T10:35:00Z"
    }
  ]
}
```

**Responsibilities**:
- ✓ Verify user is Admin (check JWT token)
- ✓ Fetch all registrations with status: `email-verified` (pending approval)
- ✓ Return list with email verification status

---

### 4. Approve Registration (Admin Only)
**Endpoint**: `POST /api/auth/approve-registration`

**Headers**:
```
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Registration approved. Account created and confirmation email sent.",
  "user": {
    "userId": 12345,
    "email": "user@example.com",
    "fullName": "John Doe",
    "roleName": "Surveyor",
    "isActive": true
  }
}
```

**Responsibilities**:
- ✓ Verify user is Admin
- ✓ Update registration status: `approved`
- ✓ Create user account in database
- ✓ Set account status: `active`
- ✓ Send confirmation email with account details
- ✓ Return created user object

---

### 5. Reject Registration (Admin Only)
**Endpoint**: `POST /api/auth/reject-registration`

**Headers**:
```
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Registration rejected. Rejection email sent to user.",
  "email": "user@example.com"
}
```

**Responsibilities**:
- ✓ Verify user is Admin
- ✓ Update registration status: `rejected`
- ✓ Send rejection email
- ✓ Return confirmation

---

## Azure Key Vault Setup

### 1. Create Key Vault Secrets

Create the following secrets in your Azure Key Vault (name: `kv-[project-name]`):

```
SITE_ADMIN_USERNAME        → admin@myarea.com
SITE_ADMIN_PASSWORD        → [SecurePassword123]
SITE_ADMIN_EMAIL          → admin@myarea.com

EMAIL_SERVICE_KEY         → [SendGrid API Key OR AWS SES credentials]
EMAIL_SERVICE_TYPE        → sendgrid (or ses, mailgun, etc.)
EMAIL_FROM_ADDRESS        → noreply@myarea.com
EMAIL_FROM_NAME           → MyArea Admin

JWT_SECRET                → [Long random secret for signing tokens]
JWT_EXPIRY_HOURS          → 24

DATABASE_CONNECTION_STRING → [Your database connection]
```

### 2. Grant Azure Functions Access to Key Vault

**Step 1**: Create a Managed Identity for your Function App
```bash
az functionapp identity assign --resource-group [RG_NAME] --name [FUNCTION_APP_NAME]
```

**Step 2**: Set Key Vault Access Policy
```bash
az keyvault set-policy \
  --name [KEY_VAULT_NAME] \
  --object-id [MANAGED_IDENTITY_OBJECT_ID] \
  --secret-permissions get list
```

### 3. Read Secrets in Azure Functions

```csharp
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

// In your Azure Function
var kvUri = new Uri($"https://[KEY_VAULT_NAME].vault.azure.net");
var client = new SecretClient(kvUri, new DefaultAzureCredential());

SecretClient secretClient = new SecretClient(kvUri, new DefaultAzureCredential());
KeyVaultSecret secret = await secretClient.GetSecretAsync("SITE_ADMIN_USERNAME");
string siteAdminUsername = secret.Value;
```

### 4. Update Your Function App Configuration

Add Application Settings in Azure Portal or CLI:

```bash
az functionapp config appsettings set \
  --name [FUNCTION_APP_NAME] \
  --resource-group [RG_NAME] \
  --settings \
    KEY_VAULT_URL="https://[KEY_VAULT_NAME].vault.azure.net" \
    ENABLE_EMAIL_VERIFICATION="true"
```

---

## Email Service Configuration

### SendGrid (Recommended)

1. Create SendGrid account and get API key
2. Store as `EMAIL_SERVICE_KEY` in Key Vault
3. Example implementation:

```csharp
using SendGrid;
using SendGrid.Helpers.Mail;

public async Task SendVerificationEmail(string toEmail, string code)
{
    var apiKey = await GetKeyVaultSecret("EMAIL_SERVICE_KEY");
    var client = new SendGridClient(apiKey);
    
    var from = new EmailAddress("noreply@myarea.com", "MyArea");
    var subject = "Email Verification - MyArea";
    var to = new EmailAddress(toEmail);
    var plainTextContent = $"Your verification code is: {code}";
    var htmlContent = $@"
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>{code}</h1>
        <p>This code will expire in 24 hours.</p>
    ";
    
    var msg = new SendGridMessage();
    msg.SetFrom(from);
    msg.AddTo(to);
    msg.SetSubject(subject);
    msg.AddContent(MimeType.Text, plainTextContent);
    msg.AddContent(MimeType.Html, htmlContent);
    
    var response = await client.SendEmailAsync(msg);
}
```

---

## Database Schema (Reference)

### RegistrationRequests Table

```sql
CREATE TABLE RegistrationRequests (
    RegistrationId INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FullName NVARCHAR(255) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    Status NVARCHAR(50) DEFAULT 'pending-verification', -- pending-verification, email-verified, approved, rejected
    VerificationCode NVARCHAR(10),
    VerificationCodeExpiry DATETIME,
    EmailVerifiedAt DATETIME NULL,
    ApprovedAt DATETIME NULL,
    ApprovedBy INT NULL,
    RejectedAt DATETIME NULL,
    RejectionReason NVARCHAR(500) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE INDEX idx_email ON RegistrationRequests(Email);
CREATE INDEX idx_status ON RegistrationRequests(Status);
```

---

## Security Best Practices

✅ **DO:**
- Store all sensitive data in Key Vault
- Use Managed Identities for authentication
- Hash passwords with PBKDF2-SHA256 (minimum 10,000 iterations)
- Set verification code expiry to 24 hours
- Validate all inputs on backend
- Use HTTPS only
- Implement rate limiting on registration endpoints
- Log approval/rejection actions for audit

❌ **DON'T:**
- Hard-code credentials in code
- Store passwords in plain text
- Share Key Vault access widely
- Allow unlimited verification attempts
- Expose error details to frontend

---

## Testing Endpoints

### 1. Test Registration Request
```bash
curl -X POST https://[FUNCTION_APP].azurewebsites.net/api/auth/register-request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123",
    "roleId": 2
  }'
```

### 2. Test Email Verification
```bash
curl -X POST https://[FUNCTION_APP].azurewebsites.net/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "verificationCode": "123456"
  }'
```

### 3. Test Get Pending Registrations (Admin)
```bash
curl -X GET https://[FUNCTION_APP].azurewebsites.net/api/auth/pending-registrations \
  -H "Authorization: Bearer [JWT_TOKEN]"
```

### 4. Test Approve Registration (Admin)
```bash
curl -X POST https://[FUNCTION_APP].azurewebsites.net/api/auth/approve-registration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## Frontend Integration

The frontend (`MyArea`) now:
- Sends registration data to backend
- Waits for verification code in email
- Calls backend to verify email
- Calls backend to fetch pending registrations
- Calls backend to approve/reject registrations
- No longer stores sensitive data locally

### API Endpoints Used by Frontend:
```
POST /api/auth/register-request
POST /api/auth/verify-email
GET /api/auth/pending-registrations
POST /api/auth/approve-registration
POST /api/auth/reject-registration
```

---

## Deployment Checklist

- [ ] Azure Key Vault created and populated with secrets
- [ ] Azure Function App Managed Identity created
- [ ] Key Vault access policy granted to Function App
- [ ] Function App environment variables configured
- [ ] Email service (SendGrid, AWS SES, etc.) configured
- [ ] Database tables created
- [ ] All 5 API endpoints implemented
- [ ] JWT authentication verified
- [ ] Admin role check implemented
- [ ] Email sending tested
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Audit logging enabled
- [ ] Frontend deployed

---

## Support

For questions or issues:
1. Check Azure Key Vault access permissions
2. Verify Function App Managed Identity settings
3. Test email service credentials
4. Check Function App logs for errors
5. Verify database connectivity
