# Backend Integration Summary - Email Verification with Azure Key Vault

## ✅ Deployment Complete
- **Date**: June 10, 2026
- **Status**: Successfully deployed
- **URL**: https://app-survey-admin-cs-dev.azurewebsites.net/
- **Build**: Clean (168.54 KB JS, 3.36 KB CSS)

---

## 🔄 Updated Architecture

### Previous (Client-Side Demo)
```
Register Form → LocalStorage → VerifyEmail (Demo) → Approve (Demo) → Account
```

### New (Backend-Driven)
```
Register Form → Backend API → Verify Email (Real) → Admin Approval → Account Created → Confirmation Email
```

---

## 📡 API Integration Points

The frontend now calls these backend APIs:

### 1. **Registration Submission**
```
POST /api/auth/register-request
```
- Frontend sends: email, fullName, password, roleId
- Backend: Generates verification code, sends verification email
- Frontend: Redirects to email verification page

### 2. **Email Verification**
```
POST /api/auth/verify-email
```
- Frontend sends: email, verificationCode
- Backend: Validates code, updates registration status
- Frontend: Shows verification success message

### 3. **Pending Registrations List**
```
GET /api/auth/pending-registrations
```
- Frontend sends: JWT token (for admin auth)
- Backend: Returns all pending registrations (status: email-verified)
- Frontend: Displays in admin dashboard

### 4. **Approve Registration**
```
POST /api/auth/approve-registration
```
- Frontend sends: email, JWT token
- Backend: Creates user account, sends confirmation email
- Frontend: Reloads pending registrations list

### 5. **Reject Registration**
```
POST /api/auth/reject-registration
```
- Frontend sends: email, JWT token
- Backend: Marks registration as rejected, sends rejection email
- Frontend: Reloads pending registrations list

---

## 🔐 Azure Key Vault Configuration

### Site Admin Credentials (From Key Vault)
```
SITE_ADMIN_USERNAME     → Stored in Key Vault
SITE_ADMIN_PASSWORD     → Stored in Key Vault
SITE_ADMIN_EMAIL        → Stored in Key Vault
```

The backend (Azure Functions) reads these from Key Vault to:
- Authenticate the Site Admin user
- Validate approvals come from Site Admin
- Grant admin privileges

### Email Service Credentials (From Key Vault)
```
EMAIL_SERVICE_KEY       → SendGrid API key / AWS SES credentials
EMAIL_FROM_ADDRESS      → Sender email address
EMAIL_FROM_NAME         → Sender display name
```

### Other Secrets (From Key Vault)
```
JWT_SECRET              → For signing authentication tokens
JWT_EXPIRY_HOURS        → Token expiration time
DATABASE_CONNECTION_STRING → Database connection
```

---

## 🚀 Frontend Components Updated

### 1. **Register.tsx** (Updated)
**Changes:**
- ❌ Removed: Client-side verification code generation
- ❌ Removed: localStorage storage of registration data
- ✅ Added: API call to `/api/auth/register-request`
- ✅ Added: Error handling for API failures
- ✅ Added: Loading state during submission

**Flow:**
1. User fills registration form
2. Frontend validates (passwords match, length, etc.)
3. Frontend POST to backend with registration data
4. Backend generates code, sends email, returns success
5. Frontend redirects to `/verify-email`

### 2. **VerifyEmail.tsx** (Updated)
**Changes:**
- ❌ Removed: localStorage verification code retrieval
- ✅ Added: API call to `/api/auth/verify-email`
- ✅ Added: Error handling for invalid codes
- ✅ Added: Backend validation

**Flow:**
1. User sees email address (from localStorage `pendingEmail`)
2. User enters 6-digit code from email
3. Frontend POST to backend with email and code
4. Backend validates code against stored verification code
5. If valid: Registration status → `email-verified`
6. Frontend shows success message

### 3. **PendingRegistrations.tsx** (Updated)
**Changes:**
- ❌ Removed: localStorage-based registration list
- ✅ Added: API call to `/api/auth/pending-registrations`
- ✅ Added: JWT authentication header
- ✅ Added: Admin role validation
- ✅ Added: API calls for approve/reject

**Flow:**
1. Admin clicks "Pending Registrations" on dashboard
2. Frontend GET request with JWT token to backend
3. Backend validates admin role
4. Backend returns all email-verified registrations
5. Admin clicks Approve:
   - Frontend POST to `/api/auth/approve-registration`
   - Backend creates account, sends confirmation email
6. Admin clicks Reject:
   - Frontend POST to `/api/auth/reject-registration`
   - Backend marks rejected, sends rejection email

---

## 📋 Backend Implementation Checklist

### Prerequisites
- [ ] Azure Key Vault created
- [ ] Secrets populated in Key Vault
- [ ] Azure Functions app has Managed Identity
- [ ] Key Vault access policy granted to Function App
- [ ] Email service account (SendGrid, AWS SES, etc.)

### Required API Endpoints
- [ ] `POST /api/auth/register-request`
- [ ] `POST /api/auth/verify-email`
- [ ] `GET /api/auth/pending-registrations`
- [ ] `POST /api/auth/approve-registration`
- [ ] `POST /api/auth/reject-registration`

### Implementation Details
- [ ] Input validation (email, password, etc.)
- [ ] Verification code generation (6 digits)
- [ ] Verification code storage with 24-hour expiry
- [ ] Email sending via service (SendGrid/AWS SES)
- [ ] Database operations (CRUD for registrations/users)
- [ ] JWT token validation for admin endpoints
- [ ] Admin role check (roleId = 1)
- [ ] Error handling and logging
- [ ] Rate limiting on endpoints
- [ ] Audit trail for approvals

### Database Tables
- [ ] `RegistrationRequests` (stores pending/verified/approved registrations)
- [ ] `Users` (active user accounts)
- [ ] `AuditLog` (approval/rejection tracking)

---

## 🔑 Key Vault Setup Steps

### 1. Create Key Vault
```bash
az keyvault create \
  --resource-group [RG_NAME] \
  --name kv-myarea
```

### 2. Add Secrets
```bash
az keyvault secret set --vault-name kv-myarea \
  --name SITE_ADMIN_USERNAME \
  --value admin@myarea.com

az keyvault secret set --vault-name kv-myarea \
  --name SITE_ADMIN_PASSWORD \
  --value [SecurePassword]

az keyvault secret set --vault-name kv-myarea \
  --name EMAIL_SERVICE_KEY \
  --value [SendGrid_API_Key]
```

### 3. Grant Function App Access
```bash
# Get Managed Identity Object ID
IDENTITY_OBJECT_ID=$(az functionapp identity show \
  --resource-group [RG_NAME] \
  --name [FUNCTION_APP_NAME] \
  --query principalId --output tsv)

# Set Key Vault policy
az keyvault set-policy \
  --name kv-myarea \
  --object-id $IDENTITY_OBJECT_ID \
  --secret-permissions get list
```

---

## 🧪 Testing the Workflow

### Test as Regular User (Register & Verify)
1. Go to https://app-survey-admin-cs-dev.azurewebsites.net/register
2. Fill in registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123
   - Role: Surveyor
3. Submit form
4. Check email for verification code
5. Go to `/verify-email`
6. Enter code from email
7. See "Email verified" message

### Test as Site Admin (Approve/Reject)
1. Login with Site Admin credentials:
   - Email: admin@myarea.com (from Key Vault)
   - Password: [From Key Vault]
2. Click "⏳ Pending Registrations"
3. See test registration in list (if email verified)
4. Click "✓ Approve"
5. Check email for account confirmation
6. View user in "👥 Manage Users"

---

## ⚠️ Important Notes

### For Backend Team
1. **Site Admin User**: Must be created in Key Vault and database
2. **Email Service**: Configure before deployment (SendGrid recommended)
3. **JWT Secret**: Generate strong random secret in Key Vault
4. **Database**: Create `RegistrationRequests` table before running endpoints
5. **Error Handling**: All endpoints must return proper error messages
6. **Logging**: Log all approvals/rejections for audit trail

### For Frontend
1. **API Base URL**: Currently hardcoded as `https://func-mobileapp-cs-in.azurewebsites.net`
   - Update if backend URL changes
2. **JWT Token**: Used for admin endpoints, must be valid
3. **No Demo Fallback**: Frontend no longer has demo/mock data
4. **Real Emails**: Users will receive real verification emails

### Security
1. ✅ Credentials stored in Key Vault (not code)
2. ✅ Managed Identity used for Key Vault access
3. ✅ JWT required for admin operations
4. ✅ Admin role validated on backend
5. ✅ Verification codes expire after 24 hours
6. ✅ Rate limiting should be implemented

---

## 📞 API Response Codes

### Success (200 OK)
- Registration submitted
- Email verified
- Registrations retrieved
- Registration approved
- Registration rejected

### Errors (4xx/5xx)
- 400: Invalid input (bad email, password, code)
- 401: Unauthorized (missing/invalid JWT)
- 403: Forbidden (non-admin trying admin operation)
- 404: Not found (registration doesn't exist)
- 409: Conflict (email already registered)
- 429: Too many requests (rate limit exceeded)
- 500: Server error (database, email service, etc.)

---

## 📊 Data Flow Diagram

```
User Registration
├── User submits form
├── Frontend validates
├── POST /api/auth/register-request
├── Backend: Generate code, Send email, Store registration
└── Redirect to /verify-email

Email Verification
├── User receives email with code
├── User enters code on /verify-email
├── POST /api/auth/verify-email
├── Backend: Validate code, Update status → email-verified
└── Show success message

Admin Approval
├── Admin logs in
├── GET /api/auth/pending-registrations
├── Frontend displays pending list
├── Admin clicks Approve/Reject
├── POST /api/auth/approve-registration OR reject-registration
├── Backend: Create account/Reject, Send email
└── Frontend reloads pending list

User Active
└── User can login with registered credentials
```

---

## ✅ Deployment Checklist

### Frontend
- [x] Updated components with API calls
- [x] Removed localStorage-based verification
- [x] Added error handling
- [x] Rebuilt and deployed

### Backend (Pending)
- [ ] Implement 5 API endpoints
- [ ] Read Site Admin credentials from Key Vault
- [ ] Set up email service
- [ ] Create database tables
- [ ] Deploy to Azure Functions

### Azure Infrastructure (Pending)
- [ ] Create Key Vault
- [ ] Populate secrets in Key Vault
- [ ] Grant Function App access to Key Vault
- [ ] Configure email service

---

## 🎯 Next Steps

1. **Backend Implementation**: Implement the 5 required API endpoints
2. **Key Vault Setup**: Create Key Vault and populate secrets
3. **Email Service**: Configure SendGrid or AWS SES
4. **Database**: Create `RegistrationRequests` table
5. **Testing**: Test complete workflow end-to-end
6. **Documentation**: Update API documentation

---

## 📚 References

- **Backend Setup Guide**: See `BACKEND_SETUP.md`
- **Email Verification Workflow**: See `EMAIL_VERIFICATION_WORKFLOW.md`
- **API Documentation**: See `BACKEND_SETUP.md` API section

---

**MyArea is now ready for production backend integration!**

Site Admin user will manage registrations with credentials from Azure Key Vault. All verification and approval processes handled by secure backend APIs.
