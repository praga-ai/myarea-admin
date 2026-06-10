# Survey Admin Web App - Deployment Guide

Complete guide for deploying the web app to Azure App Service.

---

## Prerequisites

- Azure Subscription
- Azure CLI installed and configured
- Node.js 18+ installed
- npm or yarn
- Git (for source control)

---

## Deployment Options

## Option 1: PowerShell Automation Script (Recommended)

Fully automated deployment with one command.

### Setup

```powershell
# Navigate to repository root
cd survey-admin-web

# Run deployment script
.\scripts/deploy.ps1
```

### Script Features

✅ Automatic npm install
✅ Production build creation
✅ Resource group creation
✅ App Service provisioning (if needed)
✅ Automated deployment to Azure
✅ Zero-downtime deployment
✅ Success verification
✅ Error handling

### Output

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

## Option 2: Azure CLI Manual Deployment

Step-by-step deployment using Azure CLI.

### Step 1: Login to Azure

```bash
az login
```

Opens browser for authentication.

### Step 2: Set Subscription

```bash
az account set --subscription "subscription-id"
```

### Step 3: Create Resource Group

```bash
az group create \
  --name survey-admin-rg \
  --location centralindia
```

### Step 4: Deploy Infrastructure

```bash
az deployment group create \
  --resource-group survey-admin-rg \
  --template-file bicep/web-app.bicep \
  --parameters bicep/web-app.parameters.json
```

### Step 5: Build React App

```bash
npm install
npm run build
```

Creates `./build` folder.

### Step 6: Create Deployment Package

```bash
# On Windows
Compress-Archive -Path build/* -DestinationPath web.zip -Force

# On Mac/Linux
cd build && zip -r ../web.zip . && cd ..
```

### Step 7: Deploy to App Service

```bash
az webapp deployment source config-zip \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --src web.zip
```

### Step 8: Verify Deployment

```bash
az webapp show \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --query "defaultHostName"
```

Output: `app-survey-admin-cs-dev.azurewebsites.net`

---

## Option 3: GitHub Actions CI/CD

Automatic deployment on push to main branch.

### Setup GitHub Secrets

```bash
# Get Azure publish profile
az webapp deployment list-publishing-profiles \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --xml

# Copy output and add as GitHub Secret:
# - Go to: Settings → Secrets → New repository secret
# - Name: AZURE_PUBLISH_PROFILE
# - Value: <paste publish profile>
```

### Create Workflow File

`.github/workflows/deploy.yml`

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run tests
        run: npm test -- --coverage

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: app-survey-admin-cs-dev
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: ./build
```

### Trigger Deployment

```bash
git push origin main
```

GitHub Actions automatically builds and deploys.

---

## Option 4: Azure DevOps Pipelines

Enterprise-grade CI/CD with Azure DevOps.

### Create Pipeline

1. Go to Azure DevOps
2. New Pipeline
3. Connect GitHub repo
4. Select `.github/workflows/deploy.yml`

### Deployment Stages

```yaml
stages:
  - stage: Build
    jobs:
      - job: BuildJob
        steps:
          - task: NodeTool@0
          - task: npm@1
          - task: npm@1
            inputs:
              command: 'custom'
              customCommand: 'run build'

  - stage: Deploy
    jobs:
      - deployment: DeployApp
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
```

---

## Environment Configuration

### Setting Environment Variables

#### Option A: Portal

1. Azure Portal → App Service
2. Settings → Configuration
3. Add Application Settings:

```
REACT_APP_API_BASE_URL: https://func-mobileapp-cs-in.azurewebsites.net/api
REACT_APP_APP_NAME: Survey Admin
REACT_APP_VERSION: 1.0.0
```

#### Option B: Azure CLI

```bash
az webapp config appsettings set \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --settings \
    REACT_APP_API_BASE_URL=https://func-mobileapp-cs-in.azurewebsites.net/api \
    REACT_APP_APP_NAME="Survey Admin" \
    REACT_APP_VERSION=1.0.0
```

#### Option C: Bicep Template

Update `bicep/web-app.parameters.json` with settings.

---

## SSL/TLS Configuration

### Enable HTTPS

```bash
az webapp update \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --https-only true
```

### Custom Domain

```bash
# Add custom domain
az webapp config hostname add \
  --resource-group survey-admin-rg \
  --webapp-name app-survey-admin-cs-dev \
  --hostname survey-admin.yourdomain.com

# Add SSL certificate (requires domain setup)
```

---

## Scaling

### Vertical Scaling (Upgrade Plan)

```bash
# Upgrade App Service Plan
az appservice plan update \
  --resource-group survey-admin-rg \
  --name asp-survey-admin-cs-dev \
  --sku P1V2
```

Pricing tiers: B1 < B2 < B3 < S1 < S2 < S3 < P1V2 < P2V2 < P3V2

### Horizontal Scaling

```bash
# Scale out instances
az appservice plan update \
  --resource-group survey-admin-rg \
  --name asp-survey-admin-cs-dev \
  --number-of-workers 3
```

---

## Monitoring & Logs

### View Live Logs

```bash
az webapp log tail \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev
```

### Stream Logs

```powershell
# Open in browser
start https://app-survey-admin-cs-dev.scm.azurewebsites.net/api/logstream
```

### Application Insights

1. Portal → App Service → Application Insights
2. View metrics, errors, performance
3. Set up alerts

---

## Health Check

### Verify Deployment

```bash
# Get app URL
$url = az webapp show \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --query "defaultHostName" \
  -o tsv

# Test endpoint
curl https://$url/
```

### Check Status

```bash
az webapp show \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --query "state"
```

States: Running, Stopped, Deleted, etc.

---

## Rollback

### Revert to Previous Version

```bash
# List deployment slots
az webapp deployment slot list \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev

# Swap slots to rollback
az webapp deployment slot swap \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --slot staging
```

---

## Restart

### Restart App Service

```bash
az webapp restart \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev
```

---

## Backup & Restore

### Create Backup

```bash
az webapp config backup create \
  --resource-group survey-admin-rg \
  --webapp-name app-survey-admin-cs-dev \
  --backup-name backup-20260610
```

### Restore from Backup

```bash
az webapp config backup restore \
  --resource-group survey-admin-rg \
  --webapp-name app-survey-admin-cs-dev \
  --backup-id backup-20260610
```

---

## Cost Optimization

### Cost Reduction Tips

1. **Use Standard S1** instead of Premium for dev/test
2. **Enable auto-shutdown** for non-production
3. **Use reserved instances** for production
4. **Monitor and clean up** unused resources

### Estimated Monthly Cost

```
Standard S1 App Service Plan    $70.00
SQL Database (shared with API)  ~$25.00
(Other costs in separate repo)
─────────────────────────────────────
Total (App Service only)        $95.00
```

---

## Troubleshooting

### Deployment Fails

**Issue**: Build fails
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue**: Authentication error
```bash
# Login again
az login

# Set correct subscription
az account set --subscription "subscription-id"
```

### App Won't Load

**Issue**: Blank page
1. Check app is running: `az webapp show --name ... --query state`
2. Check logs: `az webapp log tail --name ...`
3. Verify .env variables are set

**Issue**: API not responding
1. Check API endpoint URL in .env
2. Verify backend API is deployed
3. Check CORS settings

---

## Post-Deployment Tasks

### Configuration

- [ ] Update DNS (custom domain)
- [ ] Configure SSL certificate
- [ ] Set environment variables
- [ ] Configure monitoring/alerts
- [ ] Enable auto-scaling (if needed)

### Security

- [ ] Review CORS settings
- [ ] Verify HTTPS enforced
- [ ] Check authentication working
- [ ] Review app settings (no secrets exposed)

### Monitoring

- [ ] Check Application Insights
- [ ] Set up alerts
- [ ] Review logs
- [ ] Monitor performance metrics

### Documentation

- [ ] Update deployment procedures
- [ ] Document DNS changes
- [ ] Create runbook for support team
- [ ] Document custom configurations

---

## Deployment Checklist

- [ ] Code committed to main branch
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Build successful locally
- [ ] Azure subscription active
- [ ] Required permissions granted
- [ ] Backup created (if production)
- [ ] Deployment completed
- [ ] App loads successfully
- [ ] Login works
- [ ] API connectivity verified
- [ ] Monitoring configured
- [ ] Documentation updated

---

## Support

For deployment issues:
- Check Azure Activity Log
- Review Application Insights
- Check app logs
- Review Bicep template
- Contact Azure Support

