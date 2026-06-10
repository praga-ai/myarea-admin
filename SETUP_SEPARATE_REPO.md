# Survey Admin Web App - Setting Up Separate Repository

This guide explains how to set up the Survey Admin Web App as an independent repository.

---

## 📁 Repository Structure

```
survey-admin-web/                  # Independent repo
├── src/
│   ├── components/
│   ├── context/
│   ├── App.tsx
│   └── index.tsx
├── public/
│   └── index.html
├── bicep/                         # Azure IaC
│   ├── web-app.bicep
│   └── web-app.parameters.json
├── scripts/
│   └── deploy.ps1
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── QUICK_START.md
└── LICENSE
```

---

## 🚀 Initial Setup

### Step 1: Create GitHub Repository

```bash
# Create new repo on GitHub
# Name: survey-admin-web
# Description: Web administration portal for survey application
# Public/Private: Your choice
```

### Step 2: Clone Locally

```bash
git clone https://github.com/your-org/survey-admin-web.git
cd survey-admin-web
```

### Step 3: Copy Files

Copy all files from `E:\repo\app\web\` to the new repository:

```bash
# From your local machine
cp -r E:\repo\app\web\* .

# Or manually:
# - Copy src/ directory
# - Copy public/ directory
# - Copy package.json
# - Copy tsconfig.json
# - etc.
```

### Step 4: Setup .env

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Verify Setup

```bash
npm start
```

Should open at `http://localhost:3000`

---

## 📝 Independent Configuration

The web app now operates independently with:

### Configuration Files
- `.env.example` - Template for environment variables
- `package.json` - Independent dependencies
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore rules

### Documentation
- `README.md` - Project overview
- `QUICK_START.md` - Quick setup guide
- `docs/ARCHITECTURE.md` - System design
- `docs/DEPLOYMENT.md` - Deployment guide

### Deployment
- `scripts/deploy.ps1` - Automated deployment script
- `bicep/web-app.bicep` - Azure infrastructure template

---

## 🔗 Connecting to Backend API

The web app connects to a separate backend API.

### Configuration in .env

```env
REACT_APP_API_BASE_URL=https://func-mobileapp-cs-in.azurewebsites.net/api
```

### Backend Requirements

The backend must provide these endpoints:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-token
GET    /api/auth/users
GET    /api/surveys
GET    /api/questionnaires
```

### Backend Repository

Backend code is in separate repo:
```
repo-app (Mobile App + Backend)
├── api/            # Backend API
├── mobile/         # Mobile App
└── ...
```

---

## 🌐 Deployment

### Azure App Service

Deploy to Azure App Service independently:

```powershell
# Run deployment script
.\scripts/deploy.ps1
```

Or manually:

```bash
npm run build
az webapp deployment source config-zip \
  -g survey-admin-rg \
  -n app-survey-admin-cs-dev \
  --src build/
```

### Environment

- **Region**: Central India (same as backend for latency)
- **Runtime**: Node.js 18 LTS
- **Plan**: Standard S1
- **Cost**: ~$70/month

---

## 🔄 Git Workflow

### Branch Strategy

```
main (production)
  ↓
develop (development)
  ↓
feature/feature-name (feature branches)
```

### Making Changes

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# Test locally
npm test

# Commit
git add .
git commit -m "Add my feature"

# Push
git push origin feature/my-feature

# Create Pull Request on GitHub
```

### Merging

1. Create Pull Request
2. Code review
3. Merge to develop
4. Deploy to staging
5. Merge to main
6. Deploy to production

---

## 📦 Dependencies

### Core Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "typescript": "^5.3.3",
  "axios": "^1.6.2"
}
```

### Dev Dependencies

```json
{
  "react-scripts": "5.0.1",
  "@types/react": "^18.2.37",
  "@types/react-dom": "^18.2.15"
}
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update to latest major version
npm install package-name@latest
```

---

## 🔐 Security

### Secrets Management

Never commit:
- `.env` file with secrets
- API keys or tokens
- Database credentials

### GitHub Secrets

For CI/CD, use GitHub Secrets:

```bash
# Set secrets
gh secret set AZURE_CREDENTIALS
gh secret set API_KEY
```

---

## 📊 Project Settings

### GitHub Settings

1. **Branch Protection**
   - Require pull request reviews
   - Require status checks
   - Dismiss stale reviews

2. **Collaborators**
   - Add team members
   - Set permissions

3. **Webhooks**
   - CI/CD integration
   - Notifications

---

## 🚀 CI/CD Pipeline

### GitHub Actions

Automatically build and test on push:

```yaml
name: CI/CD
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
```

---

## 📈 Monitoring

### Deployed App

Once deployed:

```
URL: https://app-survey-admin-cs-dev.azurewebsites.net
Logs: Azure Portal → App Service → Log stream
Metrics: Azure Portal → App Service → Metrics
```

### Local Development

```bash
# View console logs
npm start

# Debug mode
REACT_APP_DEBUG=true npm start
```

---

## 🎯 Next Steps

1. ✅ Clone repository
2. ✅ Install dependencies
3. ✅ Copy files from main repo
4. ✅ Setup .env
5. ✅ Run `npm start`
6. ✅ Test login with demo credentials
7. ✅ Deploy to Azure
8. ✅ Setup GitHub Actions (optional)
9. ✅ Configure branch protection

---

## 📞 Support

For issues specific to:

- **Web App**: Create issue in `survey-admin-web` repo
- **Backend API**: Create issue in `repo-app` repo
- **Infrastructure**: Check Bicep templates

---

## ✅ Verification Checklist

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] .env configured
- [ ] App starts locally
- [ ] Login works
- [ ] API connects successfully
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Deployed to Azure
- [ ] Production working

---

**Your independent web app repository is ready!** 🎉

