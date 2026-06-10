# Survey Admin Web App - Troubleshooting Guide

Solutions for common issues and problems.

---

## Development Issues

### Port 3000 Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**

Option 1: Use different port
```bash
PORT=3001 npm start
```

Option 2: Kill process using port 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

Option 3: Restart computer

---

### npm install Fails

**Problem**: `ERR! code ERESOLVE` or dependency conflicts

**Solutions**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, use legacy peer deps
npm install --legacy-peer-deps
```

---

### Build Fails

**Problem**: `npm run build` fails with errors

**Solutions**

1. **Check TypeScript errors**
```bash
# Compile TypeScript
npx tsc --noEmit
```

2. **Check console for specific error**
```bash
npm run build 2>&1 | head -50
```

3. **Clear build artifacts**
```bash
rm -rf build
npm run build
```

4. **Update dependencies**
```bash
npm update
npm run build
```

---

### Hot Reload Not Working

**Problem**: Changes don't reflect in browser

**Solutions**

1. Hard refresh browser
```
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

2. Clear browser cache
- Dev Tools → Application → Storage → Clear all

3. Restart dev server
```bash
npm start
```

---

## Deployment Issues

### Deployment Script Fails

**Problem**: `deploy.ps1` script fails

**Solutions**

1. **Check PowerShell execution policy**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

2. **Verify Azure CLI logged in**
```bash
az login
```

3. **Run with detailed output**
```powershell
.\scripts/deploy.ps1 -Verbose
```

4. **Check Azure permissions**
```bash
az role assignment list --assignee <your-email>
```

---

### Build Size Too Large

**Problem**: Production build > 500KB

**Solutions**

1. **Analyze bundle**
```bash
npm run build -- --analyze
```

2. **Remove unused dependencies**
```bash
npm ls
npm uninstall unused-package
```

3. **Enable tree-shaking** (should be default)
```json
{
  "sideEffects": false
}
```

4. **Use dynamic imports**
```typescript
const Dashboard = lazy(() => import('./components/Dashboard'));
```

---

### App Service Deployment Fails

**Problem**: `az webapp deployment source config-zip` fails

**Solutions**

1. **Check resource exists**
```bash
az webapp show \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev
```

2. **Verify zip file**
```bash
# Check file size and contents
ls -lh web.zip
unzip -l web.zip | head
```

3. **Try smaller deployment**
```bash
# Deploy only build folder
cd build
zip -r ../app.zip *
az webapp deployment source config-zip \
  --src ../app.zip
```

4. **Check app service plan**
```bash
az appservice plan show \
  --resource-group survey-admin-rg \
  --name asp-survey-admin-cs-dev
```

---

## Runtime Issues

### Blank Page After Deployment

**Problem**: App loads but shows blank page

**Solutions**

1. **Check console errors** (F12)
   - Look for error messages
   - Check network tab for failed requests

2. **Verify app is running**
```bash
az webapp show \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --query state
```

3. **Check app logs**
```bash
az webapp log tail \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev
```

4. **Verify environment variables**
```bash
az webapp config appsettings list \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev
```

5. **Restart app service**
```bash
az webapp restart \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev
```

---

### 404 Not Found

**Problem**: Getting 404 errors

**Solutions**

1. **Verify file exists**
2. **Check routing configuration**
3. **Restart app service**
4. **Clear browser cache**

---

### API Connection Failed

**Problem**: "API not responding" or network error

**Solutions**

1. **Verify API URL in .env**
```env
REACT_APP_API_BASE_URL=https://func-mobileapp-cs-in.azurewebsites.net/api
```

2. **Check API is running**
```bash
curl https://func-mobileapp-cs-in.azurewebsites.net/api/health
```

3. **Check CORS settings**
   - Backend must allow requests from your domain
   - Contact backend team if CORS error

4. **Check network connectivity**
   - Browser DevTools → Network tab
   - Look for failed requests
   - Check response status and headers

5. **Check firewall/proxy**
   - Corporate firewall might block API
   - Try from different network

---

## Authentication Issues

### Login Fails

**Problem**: Can't login with valid credentials

**Solutions**

1. **Verify user exists in database**
   - Contact database admin
   - Check user table

2. **Check database connection**
   - Verify backend has database access
   - Check connection string

3. **Verify password is correct**
   - Try admin credentials: admin@survey.com / Admin@123
   - Request password reset

4. **Check token generation**
   - Look at browser console
   - Check network tab for login response

---

### "Invalid Token" Error

**Problem**: Token expired or invalid

**Solutions**

1. **Login again**
   - Token expires after 24 hours
   - Need to login again

2. **Clear localStorage**
```javascript
// In browser console
localStorage.clear()
```

3. **Logout and login again**
```
Click Logout button → Login again
```

4. **Check token format**
```javascript
// In browser console
console.log(localStorage.getItem('authToken'))
```

---

### Access Denied (403 Error)

**Problem**: "You don't have permission" message

**Solutions**

1. **Verify user role**
   - Admin can access all pages
   - Surveyor can only access dashboard

2. **Login as correct role**
   - Try admin account if admin page needed
   - Try surveyor account otherwise

3. **Check backend role configuration**
   - Verify user has correct RoleId
   - Contact backend team

---

## Performance Issues

### App Runs Slowly

**Problem**: App is sluggish or unresponsive

**Solutions**

1. **Check network speed**
   - DevTools → Network tab
   - Look for slow requests

2. **Monitor performance**
```javascript
// In console
performance.mark('start')
// ... do something
performance.mark('end')
performance.measure('measure', 'start', 'end')
```

3. **Check for memory leaks**
   - DevTools → Memory tab
   - Look for growing memory usage

4. **Upgrade App Service Plan**
   - Standard S1 might be underpowered
   - Upgrade to S2 or higher

---

### Page Load Slow

**Problem**: Page takes long time to load

**Solutions**

1. **Check network tab**
   - Look for slow requests
   - Identify bottleneck

2. **Optimize images**
   - Use WebP format
   - Compress images

3. **Enable compression**
```bash
az webapp config set \
  --resource-group survey-admin-rg \
  --name app-survey-admin-cs-dev \
  --web-socket-enabled true
```

4. **Check CDN**
   - Consider Azure CDN for static files
   - Improve global performance

---

## Database Issues

### Database Connection Error

**Problem**: "Cannot connect to database"

**Solutions**

1. **Verify connection string**
   - Check backend configuration
   - Verify credentials

2. **Check database is running**
   - Azure Portal → SQL Database
   - Check status

3. **Check firewall rules**
   - Database might block connections
   - Contact database admin

4. **Verify backend can access database**
   - Check backend logs
   - Contact backend team

---

### Data Not Showing

**Problem**: Lists empty or data missing

**Solutions**

1. **Verify database has data**
   - Check database directly
   - Run SQL query to verify data

2. **Check API endpoint**
   - Verify endpoint returns data
   - Check response format

3. **Verify user permissions**
   - Some data might be restricted by role
   - Check role-based restrictions

4. **Check filters**
   - Verify no active filters
   - Clear search/filters

---

## Browser Issues

### Browser Console Errors

**Problem**: Red errors in console (F12)

**Solutions**

1. **Read error message carefully**
   - Most errors are self-explanatory

2. **Common errors:**

```
Uncaught ReferenceError: X is not defined
→ Missing import or undefined variable

Failed to fetch
→ API not responding, check network

CORS error
→ Backend must allow your domain

Invalid token
→ Token expired, need to login again
```

3. **Search error online**
   - Copy error message
   - Search in Google
   - Check React documentation

---

### Browser Storage Issues

**Problem**: localStorage not persisting

**Solutions**

1. **Check browser settings**
   - Might have disabled storage
   - Check privacy settings

2. **Check incognito mode**
   - Incognito doesn't persist storage
   - Use normal browser window

3. **Clear storage and reload**
```javascript
localStorage.clear()
location.reload()
```

---

## Azure Issues

### Azure CLI Not Found

**Problem**: `az command not found`

**Solutions**

```bash
# Install Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Windows: choco install azure-cli
# Mac: brew install azure-cli
# Linux: apt-get install azure-cli

# Verify installation
az --version
```

---

### Cannot Connect to Subscription

**Problem**: "Please run 'az login' to set up account"

**Solutions**

```bash
az login
```

Opens browser for authentication.

---

### Insufficient Permissions

**Problem**: "You do not have permission to perform this action"

**Solutions**

1. **Check role assignment**
```bash
az role assignment list \
  --assignee <your-email>
```

2. **Request access**
   - Contact Azure admin
   - Ask for Contributor role
   - Wait for access to be granted

---

## General Troubleshooting Steps

### Step 1: Check Logs

Always check logs first:
```bash
# Browser console
F12 → Console tab

# App logs
az webapp log tail --name app-survey-admin-cs-dev

# Application Insights
Azure Portal → Application Insights → Logs
```

### Step 2: Verify Configuration

```bash
# Check environment variables
az webapp config appsettings list --name app-survey-admin-cs-dev

# Check app is running
az webapp show --name app-survey-admin-cs-dev --query state
```

### Step 3: Try Basic Solutions

- Clear cache
- Restart app/browser
- Logout and login again
- Reload page

### Step 4: Restart Services

```bash
# Restart app service
az webapp restart --name app-survey-admin-cs-dev

# Redeploy if needed
.\scripts/deploy.ps1
```

### Step 5: Get Help

- Check documentation
- Search error message
- Create GitHub issue
- Contact support team

---

## Getting Help

### Documentation

- **README.md** - Project overview
- **QUICK_START.md** - Setup guide
- **ARCHITECTURE.md** - System design
- **API_REFERENCE.md** - API documentation
- **DEPLOYMENT.md** - Deployment guide

### Support Channels

- **GitHub Issues** - Bug reports and questions
- **GitHub Discussions** - General questions
- **Email** - support@yourdomain.com
- **Teams/Slack** - Internal support

### Information to Include

When reporting an issue, include:
1. Error message (complete)
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment (Windows/Mac/Linux)
5. Browser and version
6. Console errors (if applicable)
7. Logs output

---

## Frequently Asked Questions

### Q: How do I reset my password?

A: Contact your administrator. Password reset feature not yet implemented.

### Q: Can I use the app offline?

A: No, currently requires internet connection. Offline support planned for v2.

### Q: How long does login token last?

A: 24 hours. You'll need to login again after 24 hours of inactivity.

### Q: Can I export survey data?

A: Not yet. Data export feature planned for v1.1.

### Q: How do I change my role?

A: You can't self-assign roles. Contact administrator to change role.

---

## Feedback

Have suggestions for improving troubleshooting?
- Create GitHub issue
- Send email to support
- Message on Slack/Teams

