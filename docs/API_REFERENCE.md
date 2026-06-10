# Survey Admin Web App - API Reference

Complete API documentation for the backend endpoints used by the web app.

---

## Base URL

```
https://func-mobileapp-cs-in.azurewebsites.net/api
```

---

## Authentication Endpoints

### 1. Register User

Create a new user account.

**Endpoint**
```
POST /api/auth/register
```

**Request Body**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123",
  "roleId": 2
}
```

**Response (Success)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "userId": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "roleName": "Surveyor",
    "isActive": true,
    "lastLoginDate": "0001-01-01T00:00:00"
  }
}
```

**Response (Error)**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Status Codes**
- `200` - Success
- `400` - Validation error
- `409` - Email already exists

**Validation**
- Email: Valid format, not empty
- Password: Minimum 8 characters
- Passwords must match
- RoleId: Must exist in database

---

### 2. Login User

Authenticate user and get JWT token.

**Endpoint**
```
POST /api/auth/login
```

**Request Body**
```json
{
  "email": "admin@survey.com",
  "password": "Admin@123"
}
```

**Response (Success)**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBzdXJ2ZXkuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNjg2MzI5OTk5LCJleHAiOjE2ODY0MTYzOTl9.xxxxxxxxxxxx",
  "user": {
    "userId": 1,
    "email": "admin@survey.com",
    "fullName": "System Administrator",
    "roleName": "Admin",
    "isActive": true,
    "lastLoginDate": "2026-06-10T10:30:00Z"
  }
}
```

**Response (Error)**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Status Codes**
- `200` - Success
- `401` - Invalid credentials
- `400` - Missing email or password

**Token Usage**
Include token in subsequent requests:
```
Authorization: Bearer <token>
```

---

### 3. Verify Token

Validate a JWT token and get user info.

**Endpoint**
```
POST /api/auth/verify-token
```

**Request Body**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Valid)**
```json
{
  "valid": true,
  "user": {
    "userId": 1,
    "email": "admin@survey.com",
    "fullName": "System Administrator",
    "roleName": "Admin",
    "isActive": true,
    "lastLoginDate": "2026-06-10T10:30:00Z"
  }
}
```

**Response (Invalid)**
```json
{
  "error": "Invalid or expired token"
}
```

**Status Codes**
- `200` - Valid token
- `401` - Invalid or expired token

---

### 4. Get All Users

Get list of all users (Admin only).

**Endpoint**
```
GET /api/auth/users
```

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (Success)**
```json
{
  "users": [
    {
      "userId": 1,
      "email": "admin@survey.com",
      "fullName": "System Administrator",
      "roleName": "Admin",
      "isActive": true,
      "lastLoginDate": "2026-06-10T10:30:00Z"
    },
    {
      "userId": 2,
      "email": "surveyor@survey.com",
      "fullName": "Survey Collector",
      "roleName": "Surveyor",
      "isActive": true,
      "lastLoginDate": "2026-06-09T15:45:00Z"
    }
  ],
  "total": 2
}
```

**Response (Unauthorized)**
```json
{
  "error": "Authorization token required"
}
```

**Response (Forbidden)**
```json
{
  "error": "Only administrators can access this endpoint"
}
```

**Status Codes**
- `200` - Success
- `401` - Missing or invalid token
- `403` - Insufficient permissions

**Requirements**
- User must be Admin role
- Token must be valid

---

## Survey Endpoints

### Get All Surveys

Get list of all surveys.

**Endpoint**
```
GET /api/surveys
```

**Headers**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response**
```json
[
  {
    "surveyId": 1,
    "wardId": 1,
    "partId": 2,
    "areaId": 3,
    "streetId": 4,
    "surveyData": "{\"1\":\"response1\",\"2\":\"response2\"}",
    "createdDate": "2026-06-10T09:00:00Z"
  }
]
```

**Status Codes**
- `200` - Success
- `401` - Unauthorized

---

## Questionnaire Endpoints

### Get All Questionnaires

Get list of all questionnaires with options.

**Endpoint**
```
GET /api/questionnaires
```

**Response**
```json
[
  {
    "questionnaireId": 1,
    "questionText": "How satisfied are you?",
    "questionType": "Radio",
    "displayOrder": 1,
    "options": [
      {
        "optionId": 1,
        "optionText": "Very Satisfied",
        "optionValue": "very_satisfied"
      },
      {
        "optionId": 2,
        "optionText": "Satisfied",
        "optionValue": "satisfied"
      },
      {
        "optionId": 3,
        "optionText": "Neutral",
        "optionValue": "neutral"
      },
      {
        "optionId": 4,
        "optionText": "Dissatisfied",
        "optionValue": "dissatisfied"
      }
    ]
  }
]
```

**Status Codes**
- `200` - Success
- `400` - Error

---

## Error Responses

### Common Error Formats

**Validation Error**
```json
{
  "error": "Invalid request body"
}
```

**Unauthorized**
```json
{
  "error": "Authorization token required"
}
```

**Forbidden**
```json
{
  "error": "Only administrators can access this endpoint"
}
```

**Not Found**
```json
{
  "error": "User not found"
}
```

**Server Error**
```json
{
  "error": "Internal server error"
}
```

---

## Token Details

### JWT Token Structure

```
Header.Payload.Signature
```

**Header**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**
```json
{
  "sub": "1",
  "email": "admin@survey.com",
  "role": "Admin",
  "iat": 1686329999,
  "exp": 1686416399
}
```

### Token Expiration

- **Duration**: 24 hours from login
- **Timezone**: UTC
- **Format**: Unix timestamp

### Token Storage

- **Location**: Browser localStorage
- **Key**: `authToken`
- **Security**: HTTPS only
- **Persistence**: Across browser sessions

---

## Role-Based Access

### Admin Role (RoleId = 1)

**Access**
- All endpoints
- User list (/api/auth/users)
- Master data endpoints
- Survey data

### Surveyor Role (RoleId = 2)

**Access**
- Dashboard data
- Submit surveys
- View questionnaires
- Limited user info

**Restricted**
- Cannot access /api/auth/users (403 Forbidden)
- Cannot manage other users
- Cannot manage master data

---

## Rate Limiting

No rate limiting currently implemented.

Planned for future versions:
- 100 requests per minute per IP
- 1000 requests per day per user

---

## CORS Configuration

**Allowed Origins**
```
*
```

**Allowed Methods**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers**
```
Content-Type, Authorization
```

---

## Example Usage

### Using Fetch API

```javascript
// Login
const response = await fetch(
  'https://func-mobileapp-cs-in.azurewebsites.net/api/auth/login',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@survey.com',
      password: 'Admin@123'
    })
  }
);

const data = await response.json();
const token = data.token;

// Get users with token
const usersResponse = await fetch(
  'https://func-mobileapp-cs-in.azurewebsites.net/api/auth/users',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const users = await usersResponse.json();
```

### Using Axios

```javascript
const api = axios.create({
  baseURL: 'https://func-mobileapp-cs-in.azurewebsites.net/api'
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'admin@survey.com',
  password: 'Admin@123'
});

// Set default header
api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

// Get users
const { data: users } = await api.get('/auth/users');
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - No valid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Email already registered |
| 500 | Server Error - Internal error |

---

## Support

For API issues:
- Check TROUBLESHOOTING.md
- Review backend logs
- Contact backend team

