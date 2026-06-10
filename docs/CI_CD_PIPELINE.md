# Survey Admin Web App - CI/CD Pipeline

Complete guide to setting up and managing the automated CI/CD pipeline.

---

## 📋 Overview

This project includes **two CI/CD pipeline options**:

1. **GitHub Actions** (Recommended) - Cloud-native, free, integrated with GitHub
2. **Azure DevOps** (Enterprise) - More features, better integration with Azure

---

## 🚀 GitHub Actions Pipeline

### Features

✅ Automatic build on push/PR
✅ Automatic testing
✅ Automatic deployment to staging (develop branch)
✅ Automatic deployment to production (main branch)
✅ Slack notifications
✅ Code coverage tracking
✅ Zero-downtime deployment

### Pipeline Stages

```
┌─────────────────────────────────────────┐
│  1. Build & Test (All branches)         │
│     - npm install                       │
│     - npm run build                     │
│     - npm test                          │
│     - Upload coverage                   │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌─────────────┐   ┌──────────────┐
│  Develop    │   │  Main Branch │
│  Branch     │   │  (Prod)      │
└────────┬────┘   └────────┬─────┘
         │                 │
         ↓                 ↓
    ┌─────────────────────────┐
    │ 2. Deploy to Staging    │
    │ (Develop only)          │
    │ - Deploy to slot        │
    │ - Run smoke tests       │
    └─────────────────────────┘
         ↓
    ┌──────────────────────────┐
    │ 3. Deploy to Production  │
    │ (Main only)              │
    │ - Deploy via swap        │
    │ - Run smoke tests        │
    │ - Create release         │
    └──────────────────────────┘
         ↓
    ┌──────────────────────────┐
    │ 4. Send Notifications    │
    │ - Slack message          │
    └──────────────────────────┘
```

### Setup GitHub Actions

#### Step 1: Create GitHub Secrets

In GitHub repository → Settings → Secrets → New repository secret

**Required Secrets:**

```
Name: AZURE_CREDENTIALS
Value: <paste azure credentials JSON>

Name: SLACK_WEBHOOK (optional)
Value: <slack webhook URL>
```

#### Step 2: Get Azure Credentials

```bash
# Login to Azure
az login

# Create service principal
az ad sp create-for-rbac --name "survey-admin-web-ci" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/survey-admin-rg \
  --json-auth

# Copy the entire JSON output
# Paste as AZURE_CREDENTIALS secret
```

#### Step 3: Configure Pipeline

Pipeline file is already created: `.github/workflows/ci-cd.yml`

No changes needed - it's ready to use!

### Trigger Pipeline

Push code to trigger pipeline:

```bash
# Push to develop - triggers staging deployment
git push origin develop

# Push to main - triggers production deployment
git push origin main

# Create PR - triggers build only (no deployment)
git push origin feature-branch
```

### Monitor Pipeline

View in GitHub:
1. Go to repository
2. Click "Actions" tab
3. Select workflow run
4. View detailed logs

---

## 🏢 Azure DevOps Pipeline

### Features

✅ Enterprise-grade CI/CD
✅ Approval gates for production
✅ Deployment history
✅ Integration with Azure DevOps
✅ Custom variables and secrets

### Pipeline Configuration

Pipeline file: `azure-pipelines.yml`

### Setup Azure DevOps

#### Step 1: Create DevOps Project

1. Go to Azure DevOps
2. Create new project
3. Set visibility (Private/Public)

#### Step 2: Create Pipeline

1. Go to Pipelines
2. Create New
3. Select "GitHub" source
4. Select this repository
5. Select "Existing Azure Pipelines YAML"
6. Select `azure-pipelines.yml`

#### Step 3: Configure Service Connection

1. Project Settings → Service Connections
2. Create new "Azure Resource Manager"
3. Select service principal authentication
4. Configure for subscription
5. Name it "Azure-Subscription"

#### Step 4: Set Pipeline Variables

Go to Pipeline → Edit → Variables

```
SlackWebhook = <slack webhook URL>
```

#### Step 5: Run Pipeline

Click "Run" to trigger pipeline

---

## 🔐 Secrets Management

### GitHub Secrets

Secrets are encrypted and not visible in logs.

**Available Secrets:**
- `AZURE_CREDENTIALS` - Azure service principal
- `SLACK_WEBHOOK` - Slack notification webhook
- `GITHUB_TOKEN` - Auto-generated GitHub token

### Azure DevOps Secrets

Stored in Variable Groups:

1. Pipelines → Library
2. Create variable group
3. Add variables
4. Mark as secret (lock icon)

---

## 🧪 Testing

### Automated Tests

Tests run automatically in pipeline:

```bash
npm test -- --coverage --watchAll=false
```

### Coverage Reports

Code coverage uploaded to Codecov:
- View in GitHub Actions
- Check coverage badge in README

### Manual Testing

After deployment:

```bash
# Test staging
curl https://app-survey-admin-cs-dev-staging.azurewebsites.net/

# Test production
curl https://app-survey-admin-cs-dev.azurewebsites.net/
```

---

## 📦 Deployment Process

### Staging Deployment (From Develop)

```
Push to develop
    ↓
Build & Test
    ↓
Deploy to staging slot
    ↓
Run smoke tests
    ↓
Wait for manual approval (optional)
    ↓
Complete
```

### Production Deployment (From Main)

```
Push to main
    ↓
Build & Test
    ↓
Deploy to production
    ↓
Run smoke tests
    ↓
Create GitHub release
    ↓
Send Slack notification
    ↓
Complete
```

### Zero-Downtime Deployment

Strategy:

1. **Slot Swapping** (Staging → Production)
   - Deploy new version to staging slot
   - Test in staging
   - Swap slots (atomic operation)
   - Old version becomes staging

2. **Advantages**:
   - No downtime
   - Quick rollback (swap back)
   - Easy testing in production environment

---

## 🔄 Branching Strategy

### Main Branches

```
main (production)
  ↓ Releases
develop (staging)
  ↓ Features
feature/feature-name
feature/another-feature
```

### Workflow

1. **Create feature branch from develop**
```bash
git checkout -b feature/my-feature develop
```

2. **Make changes and commit**
```bash
git add .
git commit -m "Add my feature"
```

3. **Push feature branch**
```bash
git push origin feature/my-feature
```

4. **Create Pull Request**
   - From: `feature/my-feature`
   - To: `develop`

5. **Code Review**
   - Team reviews code
   - Pipeline runs tests automatically
   - Approve if tests pass

6. **Merge to Develop**
   - Triggers staging deployment
   - Automatically tests in staging

7. **Release to Production**
   - Create PR from develop to main
   - Final approval
   - Merge to main
   - Automatically deploys to production

---

## 📊 Pipeline Monitoring

### View Build Logs

**GitHub Actions:**
1. Actions tab
2. Select workflow
3. Click job
4. View logs

**Azure DevOps:**
1. Pipelines tab
2. Select pipeline run
3. Click job
4. View logs

### Common Issues

**Build Fails:**
```
Check:
✓ Dependencies installed
✓ TypeScript compiles
✓ Tests pass
✓ No linting errors
```

**Deployment Fails:**
```
Check:
✓ Azure credentials valid
✓ Service connection working
✓ Resource group exists
✓ App Service exists
```

### Health Checks

Pipeline includes health checks:

```bash
# Verify app is running
curl https://app-url/

# Check status code (should be 200)
# Retry 30 times with 2-second delays
```

---

## 🔔 Notifications

### Slack Notifications

Pipeline sends Slack messages:

**Setup Slack Webhook:**

1. Go to Slack workspace
2. Apps → App Directory
3. Search "Incoming Webhooks"
4. Click "Add to Slack"
5. Select channel
6. Copy webhook URL
7. Add to GitHub Secrets or DevOps Variables

**Message Format:**

```
✅ Survey Admin Web App - Deployment Success
Repository: survey-admin-web
Branch: main
Commit: abc123def456
Author: john.doe
```

### Email Notifications

GitHub Actions default notifications:
- Failed builds
- Failed deployments

Configure in repository settings:
- Settings → Notifications

---

## 📈 Performance

### Build Time

Typical build time: **3-5 minutes**

- npm install: 1 min
- Build: 1 min
- Tests: 1-2 min
- Artifacts: <1 min

### Deployment Time

Typical deployment time: **2-3 minutes**

- Download artifacts: <1 min
- Deploy to App Service: 1-2 min
- Health checks: <1 min

### Total Pipeline Time

**From push to production: 5-10 minutes**

---

## 🚀 Deployment Slots

### Staging Slot

Used for testing before production:

```
URL: app-survey-admin-cs-dev-staging.azurewebsites.net
Environment: Staging
Auto-deploy: Yes (from develop branch)
Testing: Before production
```

### Production Slot

Live production environment:

```
URL: app-survey-admin-cs-dev.azurewebsites.net
Environment: Production
Auto-deploy: Yes (from main branch)
Traffic: 100%
```

### Swap Strategy

```
Step 1: Deploy new version to staging
Step 2: Test in staging
Step 3: Swap staging ↔ production
Step 4: Old version is now staging (rollback)
```

Benefits:
- No downtime
- Easy rollback
- Test before going live

---

## 🔐 Security

### Protected Branches

Recommended settings:

**Main Branch:**
```
✓ Require pull request reviews
✓ Require status checks to pass
✓ Require branches to be up to date
✓ Require code owner reviews
✓ Dismiss stale PR approvals
✓ Require conversation resolution
```

**Develop Branch:**
```
✓ Require pull request reviews
✓ Require status checks to pass
✓ Require branches to be up to date
```

### Secrets Security

- Secrets encrypted in transit and at rest
- Secrets not logged or displayed
- Access logs maintained
- Rotate secrets regularly

### RBAC

Control who can:
- Approve deployments
- Merge to main
- Create releases
- Override pipeline

---

## 📋 Pipeline Checklist

### Before First Run

- [ ] Azure subscription active
- [ ] Service principal created
- [ ] GitHub secrets configured
- [ ] Azure DevOps (if using)
- [ ] Slack webhook (optional)

### Regular Maintenance

- [ ] Review pipeline logs weekly
- [ ] Check for failed builds
- [ ] Update dependencies monthly
- [ ] Review security logs quarterly
- [ ] Test rollback procedure

### When Deploying

- [ ] Pull latest changes
- [ ] Run local tests
- [ ] Create feature branch
- [ ] Push to GitHub
- [ ] Wait for pipeline
- [ ] Review in staging
- [ ] Merge to main
- [ ] Verify in production

---

## 🆘 Troubleshooting

### Build Fails

**Issue:** npm install fails
```
Solution:
1. Check Node version (should be 18+)
2. Clear npm cache: npm cache clean --force
3. Delete node_modules and lock file
4. Reinstall: npm install
```

**Issue:** TypeScript errors
```
Solution:
1. Run locally: npx tsc --noEmit
2. Fix compilation errors
3. Commit and push
```

### Deployment Fails

**Issue:** Azure credentials invalid
```
Solution:
1. Regenerate service principal
2. Update GitHub secret
3. Re-run pipeline
```

**Issue:** App Service not found
```
Solution:
1. Check resource group exists
2. Check app service exists
3. Verify credentials have access
4. Check region is correct
```

### Health Check Fails

**Issue:** App not responding
```
Solution:
1. Check app service is running
2. Check application startup
3. View app logs
4. Restart app service
```

---

## 📚 Documentation

- **Setup:** See this file
- **Deployment:** docs/DEPLOYMENT.md
- **Troubleshooting:** docs/TROUBLESHOOTING.md
- **Architecture:** docs/ARCHITECTURE.md

---

## 🎯 Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code with pipeline files
3. ✅ Configure GitHub secrets
4. ✅ Push to develop branch
5. ✅ Watch pipeline run
6. ✅ Test staging deployment
7. ✅ Create release PR
8. ✅ Merge to main
9. ✅ Verify production deployment

---

**Your CI/CD pipeline is ready to automate deployment!** 🚀

