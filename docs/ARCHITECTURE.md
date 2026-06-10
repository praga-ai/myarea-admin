# Survey Admin Web App - Architecture

---

## System Overview

```
┌─────────────────────────────────────────────────┐
│      Survey Admin Web App (This Repo)           │
│      React 18 + TypeScript                      │
├─────────────────────────────────────────────────┤
│  - Login & Registration                         │
│  - Dashboard                                    │
│  - User Management (Admin)                      │
│  - Master Data (Admin)                          │
│  - Protected Routes                             │
└────────────────────┬────────────────────────────┘
                     │ HTTPS
                     │ REST API
                     ↓
┌─────────────────────────────────────────────────┐
│      Backend API (Separate Repo)                │
│      Azure Functions + C# .NET                  │
├─────────────────────────────────────────────────┤
│  - POST   /api/auth/register                    │
│  - POST   /api/auth/login                       │
│  - POST   /api/auth/verify-token                │
│  - GET    /api/auth/users                       │
│  - GET    /api/surveys                          │
│  - GET    /api/questionnaires                   │
└────────────────────┬────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────┐
│      Azure SQL Database                         │
│      (Central India)                            │
├─────────────────────────────────────────────────┤
│  - Users table                                  │
│  - Role table                                   │
│  - Survey data                                  │
│  - Questionnaires                               │
└─────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Components

```
App
├── Login
├── Register
├── ProtectedRoute
│   ├── Dashboard
│   ├── Users (Admin only)
│   └── MasterData (Admin only)
├── Unauthorized
└── NotFound
```

### State Management

**AuthContext**
- `user`: Current logged-in user
- `token`: JWT authentication token
- `isAuthenticated`: Boolean auth status
- `login()`: Login function
- `register()`: Registration function
- `logout()`: Logout function
- `hasRole()`: Role check function

### Data Flow

```
Component
    ↓
useAuth() Hook
    ↓
AuthContext
    ↓
localStorage (for persistence)
```

---

## Authentication Flow

### Login Sequence

```
User Input
    ↓
Login Component
    ↓
AuthContext.login()
    ↓
POST /api/auth/login
    ↓
Backend validates credentials
    ↓
Backend generates JWT token
    ↓
Frontend receives token + user
    ↓
Store in localStorage
    ↓
Store in Context state
    ↓
Redirect to Dashboard
```

### Token Usage

```
Every API Call
    ↓
Include in header: Authorization: Bearer <token>
    ↓
Backend validates token
    ↓
Backend checks role
    ↓
Return data or 403 error
```

---

## Component Architecture

### Login Component
```
LoginComponent
├── useState (email, password, error, loading)
├── useAuth (from context)
├── useNavigate (from router)
├── Form submission handler
└── Error display
```

### Dashboard Component
```
DashboardComponent
├── useAuth (get user info)
├── useState (surveys, loading, error)
├── useEffect (load surveys)
├── Header (user info, logout)
├── Stats section
├── Admin panel (conditional)
└── Surveys list
```

### Protected Route Component
```
ProtectedRoute
├── Get auth from context
├── Check authentication
├── Check required role
├── Redirect if unauthorized
└── Render children
```

---

## State Management

### Global State (AuthContext)

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email, password) => Promise<void>;
  logout: () => void;
  register: (email, fullName, password, confirmPassword, roleId) => Promise<void>;
  hasRole: (roleName: string) => boolean;
}
```

### Local State

Components manage their own local state:
- Loading states
- Form inputs
- Error messages
- List data

---

## Security Architecture

### Frontend Security

1. **Protected Routes**
   - Check `isAuthenticated`
   - Check user role
   - Redirect if unauthorized

2. **Token Management**
   - Store in localStorage
   - Include in API headers
   - Auto-logout on expiration

3. **Input Validation**
   - Email format validation
   - Password strength check
   - Form field validation

4. **Error Handling**
   - Display user-friendly errors
   - Log errors for debugging
   - Don't expose backend details

### Backend Security

See backend repo for:
- Password hashing (PBKDF2)
- JWT token generation
- Role-based access control
- SQL injection prevention
- Audit logging

---

## Routing Architecture

### Route Structure

```
/
├── /login (public)
├── /register (public)
├── /dashboard (protected, all authenticated users)
├── /users (protected, Admin only)
├── /master-data (protected, Admin only)
├── /unauthorized (public, error page)
└── /* (404 Not Found)
```

### Route Protection

```typescript
<ProtectedRoute requiredRole="Admin">
  <Users />
</ProtectedRoute>
```

If not authenticated → Redirect to /login
If not authorized → Redirect to /unauthorized

---

## API Integration

### Authentication Endpoints

```
POST /api/auth/register
├── Body: { email, fullName, password, confirmPassword, roleId }
└── Returns: { success, message, user }

POST /api/auth/login
├── Body: { email, password }
└── Returns: { success, message, token, user }

POST /api/auth/verify-token
├── Body: { token }
└── Returns: { valid, user }

GET /api/auth/users
├── Headers: { Authorization: Bearer <token> }
└── Returns: { users, total }
```

### Data Endpoints

```
GET /api/surveys
├── Headers: { Authorization: Bearer <token> }
└── Returns: Survey[]

GET /api/questionnaires
├── Headers: { Authorization: Bearer <token> }
└── Returns: Questionnaire[]
```

---

## Deployment Architecture

### Development

```
npm start
    ↓
React Dev Server (localhost:3000)
    ↓
Hot reload on file changes
```

### Production

```
npm run build
    ↓
Create optimized build (./build/)
    ↓
Deploy to Azure App Service
    ↓
Served via HTTPS
```

---

## Styling Architecture

### CSS Structure

Each component has:
- Component file (`.tsx`)
- Stylesheet (`.css`)

### Design System

- **Colors**: Gradient backgrounds, blue/purple theme
- **Spacing**: Consistent padding/margins
- **Typography**: Clear hierarchy
- **Responsive**: Mobile-first design

### Utilities

```css
.btn-primary      /* Primary button style */
.badge            /* Badge indicator */
.error-message    /* Error display */
.loading          /* Loading state */
```

---

## Performance Optimization

### Code Splitting

React Router automatically splits components.

### Bundle Size

- Main app: ~150 KB (minified)
- Tree-shaking removes unused code
- CSS optimized and minified

### Caching

- Browser caches: CSS, JS, images
- Service worker: App shell caching (optional)

### API Optimization

- Minimal API calls
- Data cached in state
- Pagination for large lists

---

## Error Handling

### Frontend Errors

1. **Network Errors**
   - Display user-friendly message
   - Offer retry option
   - Log for debugging

2. **Validation Errors**
   - Show inline error messages
   - Highlight invalid fields
   - Prevent submission

3. **Authorization Errors**
   - Redirect to unauthorized page
   - Clear stored credentials
   - Log for audit

---

## Testing Strategy

### Unit Tests (React Components)

```typescript
describe('Login', () => {
  it('displays error on invalid credentials', () => {
    // Test implementation
  });
  
  it('stores token on successful login', () => {
    // Test implementation
  });
});
```

### Integration Tests

Test component + API interactions

### E2E Tests

Test complete user workflows

---

## Database Integration

The app uses a shared backend database:

### Tables Used

- **Users**: Login, profile, role
- **Role**: Admin, Surveyor definitions
- **Survey**: Survey data, location
- **Questionnaire**: Survey questions
- **QuestionnaireOption**: Question options

---

## Monitoring & Logging

### Browser Console

- Log errors for debugging
- Monitor performance
- Check network requests

### Azure Application Insights

- Application performance monitoring
- Error tracking
- User analytics
- Custom metrics

---

## Scalability

### Horizontal Scaling

```
Load Balancer
    ↓
├─ App Instance 1
├─ App Instance 2
└─ App Instance N
```

### Vertical Scaling

App Service Plan upgrade (S1 → S2 → P1, etc.)

### Database Scaling

SQL Database auto-scale enabled

---

## Disaster Recovery

### Backup Strategy

- Daily database backups
- App Service backups
- 35-day retention

### Recovery Procedure

1. Restore database from backup
2. Redeploy app
3. Verify functionality
4. Monitor for issues

---

## Security Best Practices

✅ HTTPS enforced
✅ CORS configured
✅ Token expiration set
✅ Password hashing enabled
✅ Input validation
✅ Error messages don't expose system details
✅ Audit logging enabled

---

## Summary

The Survey Admin Web App uses:
- **React**: For UI and component management
- **TypeScript**: For type safety
- **Context API**: For global state
- **React Router**: For navigation
- **Azure Functions**: For backend API
- **JWT**: For authentication
- **Azure App Service**: For deployment

Architecture is modular, scalable, and maintainable.

