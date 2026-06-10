# Survey Admin Web App - Repository Structure

Complete guide to the independent web app repository.

---

## 📁 Directory Structure

```
survey-admin-web/                    # Independent Repository Root
│
├── src/                             # React Application Source Code
│   ├── components/                  # React Components
│   │   ├── Login.tsx               # Login page component
│   │   ├── Register.tsx            # User registration component
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── Users.tsx               # User management (Admin)
│   │   ├── MasterData.tsx          # Master data (Admin)
│   │   ├── ProtectedRoute.tsx      # Route protection component
│   │   ├── Unauthorized.tsx        # 403 error page
│   │   ├── NotFound.tsx            # 404 error page
│   │   └── *.css                   # Component stylesheets (8 files)
│   │
│   ├── context/                    # React Context (State Management)
│   │   └── AuthContext.tsx         # Global authentication context
│   │
│   ├── App.tsx                     # Main app component with routing
│   ├── App.css                     # Global app styles
│   ├── index.tsx                   # React entry point
│   └── index.css                   # Global styles
│
├── public/                          # Static Public Files
│   └── index.html                  # HTML template
│
├── docs/                            # Documentation Files
│   ├── ARCHITECTURE.md             # System architecture
│   ├── API_REFERENCE.md            # API endpoints reference
│   ├── DEPLOYMENT.md               # Deployment procedures
│   └── TROUBLESHOOTING.md          # Troubleshooting guide
│
├── bicep/                           # Azure Infrastructure as Code
│   ├── web-app.bicep               # App Service template
│   └── web-app.parameters.json     # Deployment parameters
│
├── scripts/                         # Deployment & Build Scripts
│   └── deploy.ps1                  # PowerShell deployment script
│
├── package.json                     # npm Dependencies & Scripts
├── tsconfig.json                    # TypeScript Configuration
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
│
├── README.md                        # Project overview
├── QUICK_START.md                   # Quick setup guide (5 minutes)
├── SETUP_SEPARATE_REPO.md           # Separate repo setup guide
└── REPOSITORY_STRUCTURE.md          # This file

---

## 📊 File Statistics

| Category | Count | Lines |
|----------|-------|-------|
| Components | 8 | 1,200 |
| Stylesheets | 5 | 800 |
| Context | 1 | 150 |
| Config Files | 5 | 350 |
| Infrastructure | 2 | 300 |
| Scripts | 1 | 100 |
| Documentation | 4 | 4,000+ |
| **TOTAL** | **26** | **~7,000** |

---

## 📄 File Descriptions

### Core Application Files

**src/App.tsx**
- Main React component
- Router configuration
- Route definitions
- Protected routes setup

**src/index.tsx**
- Application entry point
- React root rendering
- Context providers

**src/context/AuthContext.tsx**
- Global authentication state
- useAuth hook
- Login/logout functions
- Role checking logic

### Component Files

**src/components/Login.tsx**
- Login page UI
- Email/password inputs
- Form validation
- Error display

**src/components/Register.tsx**
- User registration page
- Registration form
- Role selection
- Validation

**src/components/Dashboard.tsx**
- Main dashboard page
- User profile display
- Survey statistics
- Admin control panel
- Survey data table

**src/components/Users.tsx**
- User management interface (Admin only)
- User list with statistics
- Role and status badges
- User information display

**src/components/MasterData.tsx**
- Master data overview (Admin only)
- Data statistics
- Questionnaire information
- Read-only display

**src/components/ProtectedRoute.tsx**
- Route protection logic
- Authentication check
- Role-based access control
- Redirect handling

**src/components/Unauthorized.tsx**
- 403 error page
- Access denied message
- Navigation back to dashboard

**src/components/NotFound.tsx**
- 404 error page
- Page not found message
- Navigation to home

### Styling Files

**src/App.css**
- Global application styles
- Utility classes
- Reset styles

**src/index.css**
- Base document styles
- Font configuration
- Layout utilities

**src/components/Auth.css**
- Login/Register page styles
- Form styling
- Gradient backgrounds

**src/components/Dashboard.css**
- Dashboard layout styles
- Statistics cards
- Table styling

**src/components/Users.css**
- User list table styles
- Badge styles
- Status indicators

**src/components/MasterData.css**
- Master data card styles
- Grid layout
- Info sections

**src/components/ErrorPages.css**
- Error page styling
- 403/404 page styles

### Configuration Files

**package.json**
- npm dependencies list
- Development dependencies
- Scripts (start, build, test)
- Project metadata

**tsconfig.json**
- TypeScript compiler options
- Path aliases
- Strict mode settings
- JSX configuration

**.env.example**
- Environment variable template
- API configuration
- App configuration

**.gitignore**
- Files to ignore in git
- Dependencies
- Build artifacts
- IDE files
- OS-specific files

### Infrastructure Files

**bicep/web-app.bicep**
- Azure App Service Plan
- Azure App Service
- Staging slot
- Diagnostics configuration
- Application settings

**bicep/web-app.parameters.json**
- Deployment parameters
- Region settings
- Resource naming
- SKU selection

### Script Files

**scripts/deploy.ps1**
- Automated deployment script
- Build automation
- Azure resource provisioning
- Deployment verification

### Documentation Files

**README.md**
- Project overview
- Quick start guide
- Features list
- Technology stack
- Deployment information

**QUICK_START.md**
- 5-minute setup guide
- Installation steps
- Testing instructions
- Demo credentials

**SETUP_SEPARATE_REPO.md**
- Separate repository setup
- Git workflow
- Deployment procedures
- Security guidelines

**docs/ARCHITECTURE.md**
- System architecture
- Component structure
- Data flow
- Authentication flow
- Security implementation

**docs/API_REFERENCE.md**
- API endpoint documentation
- Request/response examples
- Status codes
- Error handling
- Token details

**docs/DEPLOYMENT.md**
- Deployment options
- Step-by-step procedures
- Configuration guide
- Scaling information
- Troubleshooting

**docs/TROUBLESHOOTING.md**
- Common issues
- Solutions
- FAQ
- Support resources

---

## 🔄 Relationships

### File Dependencies

```
App.tsx
├── Login.tsx (imports)
├── Register.tsx (imports)
├── Dashboard.tsx (imports)
├── Users.tsx (imports)
├── MasterData.tsx (imports)
├── ProtectedRoute.tsx (imports)
└── AuthContext (imports)

AuthContext.tsx
└── User interface (imports)

Protected Routes
└── ProtectedRoute.tsx (imports)
    ├── Dashboard.tsx (imports)
    ├── Users.tsx (imports)
    └── MasterData.tsx (imports)

Components
└── AuthContext (imports from useAuth)
```

### Import Paths

```typescript
// Components
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';

// Context
import { useAuth } from './context/AuthContext';

// External
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
```

---

## 📦 Deployment Artifacts

### Build Output

```
build/                              # Created by: npm run build
├── index.html
├── static/
│   ├── js/
│   │   ├── main.[hash].js
│   │   └── [other chunks]
│   └── css/
│       ├── main.[hash].css
│       └── [other styles]
└── favicon.ico
```

### Size: ~150 KB (minified and gzipped)

---

## 🔐 Environment Variables

### Required Variables

```env
REACT_APP_API_BASE_URL=https://func-mobileapp-cs-in.azurewebsites.net/api
```

### Optional Variables

```env
REACT_APP_APP_NAME=Survey Admin
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
```

---

## 🎯 Key Directories

### Development

- **src/** - All source code
- **public/** - Static assets
- **docs/** - Documentation

### Build & Deploy

- **build/** - Production build output
- **bicep/** - Infrastructure templates
- **scripts/** - Automation scripts

### Configuration

- **.env** - Environment variables
- **package.json** - Dependencies
- **tsconfig.json** - TypeScript config

---

## 📚 Documentation Hierarchy

```
README.md (Overview)
├── QUICK_START.md (5-min setup)
├── SETUP_SEPARATE_REPO.md (Repo setup)
└── docs/
    ├── ARCHITECTURE.md (Design)
    ├── API_REFERENCE.md (APIs)
    ├── DEPLOYMENT.md (Deploy)
    └── TROUBLESHOOTING.md (Help)
```

---

## 🚀 Typical Development Workflow

```
1. Clone repository
   └── git clone https://github.com/your-org/survey-admin-web.git

2. Install dependencies
   └── npm install

3. Create .env file
   └── cp .env.example .env

4. Start development server
   └── npm start

5. Make changes to src/ files

6. Test in browser (localhost:3000)

7. Commit and push
   └── git add . && git commit -m "message"
   └── git push origin feature-branch

8. Deploy (if ready)
   └── .\scripts/deploy.ps1
```

---

## 🔗 External Dependencies

### Runtime

- **react** - UI library
- **react-dom** - DOM rendering
- **react-router-dom** - Routing
- **axios** - HTTP client (if added)

### Development

- **typescript** - Type checking
- **react-scripts** - Build tools
- **@types/react** - Type definitions

---

## 📦 Independent Repository

This repository is **completely independent** from:
- Mobile app repository (separate repo)
- Backend API repository (separate repo)
- Other infrastructure (separate repos)

### Integration Points

Only connects to:
- **Backend API** via `REACT_APP_API_BASE_URL`
- **Azure resources** during deployment

---

## 🔍 Quick Reference

### Start Development
```bash
npm install
npm start
```

### Build for Production
```bash
npm run build
```

### Deploy to Azure
```powershell
.\scripts/deploy.ps1
```

### View Documentation
- Quick Start: `QUICK_START.md`
- Full Details: `README.md`
- Architecture: `docs/ARCHITECTURE.md`
- Deployment: `docs/DEPLOYMENT.md`
- Help: `docs/TROUBLESHOOTING.md`

---

## ✅ Repository Checklist

Before using this repository:
- [ ] Clone from GitHub
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Run `npm start`
- [ ] Verify app loads at localhost:3000
- [ ] Test login with demo credentials
- [ ] Check documentation

---

## 📞 Support

For questions about:
- **Repository structure** - See this file
- **Setup** - See QUICK_START.md
- **Development** - See docs/ARCHITECTURE.md
- **Deployment** - See docs/DEPLOYMENT.md
- **Issues** - See docs/TROUBLESHOOTING.md

---

**This is an independent, production-ready repository!** 🎉

