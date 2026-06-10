# Survey Admin Web App - Deploy Now Guide

**Quick execution guide to deploy the web app immediately.**

---

## ⚡ Fastest Path to Production

### Option 1: PowerShell Script (5-10 minutes)

```powershell
# Navigate to repo root
cd E:\repo\survey-admin-web

# Run deployment script
.\scripts/deploy.ps1
```

**What it does:**
✅ Installs dependencies
✅ Builds production bundle
✅ Creates Azure resource group
✅ Provisions App Service
✅ Deploys application
✅ Runs health checks
✅ Shows app URL

**Expected output:**
```
✓ Build completed successfully!
✓ Deployment completed!
========================================
Deployment Successful!
========================================
App URL: https://app-survey-admin-cs-dev.azurewebsites.net
========================================
```

---

## 📋 Prerequisites

Before deploying:

✅ **Azure CLI installed**
```bash
# Check if installed
az --version

# If not: https://docs.microsoft.com/cli/azure/install-azure-cli
```

✅ **Logged into Azure**
```bash
# Login to Azure
az login
```

✅ **Node.js 18+ installed**
```bash
# Check version
node --version
npm --version
```

✅ **Backend API deployed**
- API must be running at: `https://func-mobileapp-cs-in.azurewebsites.net/api`
- Test with: `curl https://func-mobileapp-cs-in.azurewebsites.net/api/health`

---

## 🚀 Step-by-Step Execution

### Step 1: Verify Prerequisites

```powershell
# Check Azure CLI
az --version

# Check if logged in
az account show

# Check Node.js
node --version
npm --version

# Check backend API
curl https://func-mobileapp-cs-in.azurewebsites.net/api/health
```

### Step 2: Navigate to Repository

```powershell
# Open PowerShell
# Navigate to repo
cd E:\repo\survey-admin-web

# Verify location
pwd
ls

# You should see: src/, public/, scripts/, etc.
```

### Step 3: Run Deployment

```powershell
# Full deployment (build + deploy)
.\scripts/deploy.ps1

# OR just build (no deploy)
.\scripts/deploy.ps1 -Mode build-only

# OR just deploy (assuming build exists)
.\scripts/deploy.ps1 -Mode deploy-only

# OR deploy to staging
.\scripts/deploy.ps1 -Slot staging
```

### Step 4: Wait for Completion

Expected times:
- Dependencies: 1-2 minutes
- Build: 1-2 minutes
- Deployment: 2-3 minutes
- Health checks: 30 seconds

**Total: ~5-10 minutes**

### Step 5: Access Application

Once deployment completes, you'll see:

```
App URL: https://app-survey-admin-cs-dev.azurewebsites.net
```

**Open in browser:**
1. Click the URL or copy it
2. Login with demo credentials:
   - Email: `admin@survey.com`
   - Password: `Admin@123`

---

## 🔍 During Deployment

### Check Build Progress

```powershell
# If script is running, you'll see:
npm install          # Installing packages
npm run build        # Creating bundle
                     # Compiling TypeScript
                     # Optimizing assets
```

### Check Deployment Progress

```powershell
# You'll see:
Creating resource group...
Creating App Service...
Deploying to Azure...
Running health checks...
```

### Monitor in Azure Portal

1. Go to Azure Portal
2. Search "App Services"
3. Find "app-survey-admin-cs-dev"
4. Check status (Running)
5. View deployment slot

---

## ✅ Verify Deployment

### After Script Completes

```powershell
# Check app is running
curl https://app-survey-admin-cs-dev.azurewebsites.net

# Expected: HTML response (not error)
```

### Test Login

1. Open: https://app-survey-admin-cs-dev.azurewebsites.net
2. Click "Login"
3. Enter credentials:
   - Email: `admin@survey.com`
   - Password: `Admin@123`
4. Click "Login" button
5. Should see Dashboard

### Test Roles

**As Admin:**
- ✅ Dashboard - see all surveys
- ✅ Users - view user list
- ✅ Master Data - view master data

**As Surveyor (if registered):**
- ✅ Dashboard - limited view
- ❌ Users - should get 403 error
- ❌ Master Data - should get 403 error

---

## 🐛 Troubleshooting

### "Azure CLI not found"

```powershell
# Install Azure CLI
# https://docs.microsoft.com/cli/azure/install-azure-cli

# After installation, restart PowerShell
```

### "Not logged in to Azure"

```powershell
# Login to Azure
az login

# Browser opens automatically
# Login with Azure account
# Return to PowerShell
```

### "npm install fails"

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -r node_modules
rm package-lock.json

# Reinstall
npm install
```

### "Build fails"

```powershell
# Check Node version (must be 18+)
node --version

# Update Node if needed

# Clear cache and rebuild
npm cache clean --force
npm install
npm run build
```

### "Deployment fails"

```powershell
# Check Azure subscription
az account show

# Check resource group exists
az group list --query "[].name"

# Check App Service exists
az webapp list --query "[].name"

# View deployment logs
az webapp log tail --resource-group survey-admin-rg --name app-survey-admin-cs-dev
```

### "App won't load"

```powershell
# Check app is running
az webapp show --resource-group survey-admin-rg --name app-survey-admin-cs-dev --query state

# Restart app
az webapp restart --resource-group survey-admin-rg --name app-survey-admin-cs-dev

# View logs
az webapp log tail --resource-group survey-admin-rg --name app-survey-admin-cs-dev
```

---

## 📊 Expected Results

### After Successful Deployment

```
✓ App URL: https://app-survey-admin-cs-dev.azurewebsites.net
✓ Login page loads
✓ Login with admin works
✓ Dashboard displays
✓ Can access Users page (Admin)
✓ Can access Master Data (Admin)
✓ Surveyors see 403 on admin pages
```

### Logs Show

```
Build completed successfully!
✓ Deployment completed!
✓ App is responding
```

---

## 🎯 After Deployment

### Configuration (Optional)

Update environment variables in Azure:

```powershell
# Set App Service environment variables
az webapp config appsettings set \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --settings \
    REACT_APP_API_BASE_URL="https://func-mobileapp-cs-in.azurewebsites.net/api" \
    REACT_APP_APP_NAME="Survey Admin" \
    REACT_APP_VERSION="1.0.0"
```

### Create Admin Account

1. Open app in browser
2. Click "Register"
3. Create new admin account with role "Admin"
4. Logout and login to verify

### Setup Monitoring

```powershell
# View live logs
az webapp log tail --resource-group survey-admin-rg --name app-survey-admin-cs-dev

# Enable application insights
# Azure Portal → App Service → Application Insights → Enable
```

### Backup Configuration

```powershell
# Create backup
az webapp deployment source config-zip \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --src survey-admin-web.zip
```

---

## 🔄 Redeploying

If you make changes and want to redeploy:

```powershell
# Navigate to repo
cd E:\repo\survey-admin-web

# Make your changes in src/

# Redeploy
.\scripts/deploy.ps1

# OR with specific slot
.\scripts/deploy.ps1 -Slot staging
```

---

## 📝 Manual Alternative (Without Script)

If script doesn't work:

```powershell
# Step 1: Build
npm install
npm run build

# Step 2: Create deployment package
Compress-Archive -Path build/* -DestinationPath web.zip

# Step 3: Deploy
az webapp deployment source config-zip `
  -g survey-admin-rg `
  -n app-survey-admin-cs-dev `
  --src web.zip
```

---

## 📞 Support

If deployment fails:

1. **Check logs:**
   ```powershell
   az webapp log tail --resource-group survey-admin-rg --name app-survey-admin-cs-dev
   ```

2. **Review troubleshooting:**
   - See TROUBLESHOOTING.md

3. **Check documentation:**
   - See DEPLOYMENT.md
   - See CI_CD_PIPELINE.md

4. **Manual verification:**
   - Check Azure Portal
   - Verify resource group exists
   - Verify App Service exists
   - Check app is running

---

## ✨ Success Checklist

After deployment:

- [ ] App URL accessible
- [ ] Login page loads
- [ ] Admin login works
- [ ] Dashboard displays
- [ ] Users page accessible (Admin)
- [ ] Master Data accessible (Admin)
- [ ] 403 error on restricted pages
- [ ] Logs show no errors
- [ ] Health check passed

---

## 🎉 Congratulations!

Your Survey Admin Web App is now **LIVE IN PRODUCTION!** 🚀

---

**Deployment Time: 5-10 minutes**
**Status: ✅ READY TO USE**

Open now: https://app-survey-admin-cs-dev.azurewebsites.net

