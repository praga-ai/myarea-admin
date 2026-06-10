# Survey Admin Web App - Quick Start Guide

Get up and running in 5 minutes! 🚀

---

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn
- Git
- Azure Subscription (for deployment)

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-org/survey-admin-web.git
cd survey-admin-web
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

Takes 2-3 minutes depending on internet speed.

---

## 3️⃣ Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values (optional for dev)
# Default values work for local development
```

---

## 4️⃣ Start Development Server

```bash
npm start
```

App opens at `http://localhost:3000`

---

## 5️⃣ Login & Test

### Demo Credentials

**Admin Account:**
- Email: `admin@survey.com`
- Password: `Admin@123`
- Access: Dashboard, Users, Master Data

**Surveyor Account:**
- Email: `surveyor@survey.com`
- Password: `Surveyor@123`
- Access: Dashboard only

### Test Role-Based Access

1. Login as Admin
2. Access all pages: Dashboard, Users, Master Data ✅
3. Logout
4. Login as Surveyor
5. Try accessing /users → Shows 403 ✅
6. Try accessing /master-data → Shows 403 ✅

---

## 🧪 Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test Login.test.tsx
```

---

## 📦 Build for Production

```bash
# Create optimized production build
npm run build

# Output is in ./build folder
# Size: ~150KB (minified)
```

---

## 🚀 Deploy to Azure

### Option 1: Using PowerShell Script (Easiest)

```powershell
.\scripts/deploy.ps1
```

Automatically builds and deploys to Azure.

### Option 2: Manual Deployment

```bash
# Build
npm run build

# Create deployment package
# Upload ./build folder to Azure App Service
```

### Option 3: GitHub Actions

Push to main branch and GitHub Actions automatically deploys.

---

## 🔐 Required Backend

This app requires the Survey API to be running.

**Backend API Endpoint:**
```
https://func-mobileapp-cs-in.azurewebsites.net/api
```

**Required Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - List users (Admin)
- `GET /api/surveys` - Get surveys

---

## 📝 Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `REACT_APP_API_BASE_URL` | Yes | `https://func-...` | Backend API URL |
| `REACT_APP_APP_NAME` | No | Survey Admin | App title |
| `REACT_APP_VERSION` | No | 1.0.0 | App version |
| `REACT_APP_DEBUG` | No | false | Debug mode |

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Use different port
PORT=3001 npm start
```

### API Connection Error
1. Check `.env` - API URL should be correct
2. Verify API is running
3. Check browser console (F12) for errors

### Login Fails
1. Ensure backend database is set up
2. Run `02_CreateUserTables.sql` script
3. Check user exists in database

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Documentation

- **[README.md](./README.md)** - Project overview
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System design
- **[API_REFERENCE.md](./docs/API_REFERENCE.md)** - API endpoints
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide

---

## 🎯 Next Steps

1. **Explore the code** - Start in `src/components/`
2. **Read API docs** - See `docs/API_REFERENCE.md`
3. **Setup backend** - Follow backend repo setup
4. **Deploy to Azure** - Use deployment guide
5. **Customize** - Modify for your needs

---

## 💡 Tips

- Use React DevTools browser extension for debugging
- Check console (F12) for errors
- Use `console.log()` for debugging
- Hot reload enabled - changes update automatically

---

## 📞 Need Help?

- Check [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- Create GitHub Issue
- Email: support@yourdomain.com

---

**Ready to build? Let's go! 🚀**

