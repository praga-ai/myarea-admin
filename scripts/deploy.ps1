# Survey Admin Web App - Automated Deployment Script
# Deploys the React web app to Azure App Service with zero downtime

param (
    [Parameter(Mandatory = $false)]
    [string]$ResourceGroup = "survey-admin-rg",

    [Parameter(Mandatory = $false)]
    [string]$AppServiceName = "app-survey-admin-cs-dev",

    [Parameter(Mandatory = $false)]
    [string]$Location = "centralindia",

    [Parameter(Mandatory = $false)]
    [ValidateSet("build-only", "deploy-only", "build-and-deploy")]
    [string]$Mode = "build-and-deploy",

    [Parameter(Mandatory = $false)]
    [ValidateSet("staging", "production")]
    [string]$Slot = "production"
)

# Color output functions
function Write-Success {
    Write-Host $args -ForegroundColor Green
}

function Write-Error-Custom {
    Write-Host $args -ForegroundColor Red
}

function Write-Info {
    Write-Host $args -ForegroundColor Cyan
}

function Write-Warning-Custom {
    Write-Host $args -ForegroundColor Yellow
}

# Start deployment
Write-Info "========================================"
Write-Info "Survey Admin Web App - Deployment"
Write-Info "========================================"
Write-Info ""
Write-Info "Configuration:"
Write-Info "  Resource Group: $ResourceGroup"
Write-Info "  App Service: $AppServiceName"
Write-Info "  Deployment Slot: $Slot"
Write-Info "  Mode: $Mode"
Write-Info ""

# Step 1: Build React App
if ($Mode -in "build-only", "build-and-deploy") {
    Write-Info "Step 1: Building React application..."
    Write-Info "  Installing npm dependencies..."

    try {
        Push-Location -Path "$(Split-Path -Parent $PSScriptRoot)"

        # Check if node_modules exists
        if (!(Test-Path "./node_modules")) {
            Write-Info "  node_modules not found, installing dependencies..."
            npm install
            if ($LASTEXITCODE -ne 0) {
                Write-Error-Custom "Failed to install dependencies"
                Pop-Location
                exit 1
            }
        } else {
            Write-Success "  ✓ Dependencies already installed"
        }

        # Build production bundle
        Write-Info "  Building production bundle..."
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Failed to build application"
            Pop-Location
            exit 1
        }

        Write-Success "✓ Build completed successfully!"

        # Verify build output
        if (Test-Path "./build") {
            $buildSize = (Get-ChildItem -Path "./build" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Info "  Build size: $([Math]::Round($buildSize, 2)) MB"

            # List main files
            Write-Info "  Build files:"
            Get-ChildItem -Path "./build" -Depth 1 | ForEach-Object {
                Write-Info "    - $($_.Name)"
            }
        } else {
            Write-Error-Custom "Build folder not found!"
            Pop-Location
            exit 1
        }

        Pop-Location
    }
    catch {
        Write-Error-Custom "Error during build: $_"
        Pop-Location
        exit 1
    }

    Write-Info ""
}

# Step 2: Deploy to Azure
if ($Mode -in "deploy-only", "build-and-deploy") {
    Write-Info "Step 2: Deploying to Azure App Service..."

    try {
        # Check if logged in to Azure
        Write-Info "  Checking Azure CLI login..."
        $azureAccount = az account show 2>$null
        if (-not $azureAccount) {
            Write-Warning-Custom "  Not logged in to Azure. Opening login browser..."
            az login
            if ($LASTEXITCODE -ne 0) {
                Write-Error-Custom "Failed to login to Azure"
                exit 1
            }
        } else {
            Write-Success "  ✓ Already logged in to Azure"
        }

        # Get subscription info
        $subscription = az account show --query "name" -o tsv
        Write-Info "  Current subscription: $subscription"

        # Check if resource group exists
        Write-Info "  Checking resource group..."
        $rg = az group exists -n $ResourceGroup
        if ($rg -eq "false") {
            Write-Info "  Creating resource group: $ResourceGroup"
            az group create -n $ResourceGroup -l $Location
            if ($LASTEXITCODE -ne 0) {
                Write-Error-Custom "Failed to create resource group"
                exit 1
            }
            Write-Success "  ✓ Resource group created"
        } else {
            Write-Success "  ✓ Resource group exists"
        }

        # Check if App Service exists
        Write-Info "  Checking App Service..."
        $appService = az webapp list -g $ResourceGroup --query "[?name=='$AppServiceName'].id" -o tsv
        if (-not $appService) {
            Write-Info "  Creating App Service (this may take 2-3 minutes)..."

            # Deploy using Bicep
            $bicepPath = Join-Path (Split-Path -Parent $PSScriptRoot) "bicep/web-app.bicep"
            $paramsPath = Join-Path (Split-Path -Parent $PSScriptRoot) "bicep/web-app.parameters.json"

            if (!(Test-Path $bicepPath) -or !(Test-Path $paramsPath)) {
                Write-Error-Custom "Bicep files not found!"
                exit 1
            }

            az deployment group create `
                -g $ResourceGroup `
                -f $bicepPath `
                -p $paramsPath

            if ($LASTEXITCODE -ne 0) {
                Write-Error-Custom "Failed to create App Service"
                exit 1
            }
            Write-Success "  ✓ App Service created"
        } else {
            Write-Success "  ✓ App Service exists"
        }

        # Create deployment package
        Write-Info "  Creating deployment package..."
        $buildPath = Join-Path (Split-Path -Parent $PSScriptRoot) "build"
        $deployZip = Join-Path (Split-Path -Parent $PSScriptRoot) "survey-admin-web.zip"

        if (Test-Path $deployZip) {
            Remove-Item $deployZip -Force
        }

        if (Test-Path $buildPath) {
            Compress-Archive -Path "$buildPath/*" -DestinationPath $deployZip -Force
            Write-Success "  ✓ Deployment package created"

            # Get file size
            $zipSize = (Get-Item $deployZip).Length / 1MB
            Write-Info "    Package size: $([Math]::Round($zipSize, 2)) MB"
        } else {
            Write-Error-Custom "Build folder not found!"
            exit 1
        }

        # Deploy to App Service
        Write-Info "  Deploying to App Service (this may take 1-2 minutes)..."

        if ($Slot -eq "staging") {
            Write-Info "  Deploying to staging slot..."
            az webapp deployment source config-zip `
                -g $ResourceGroup `
                -n $AppServiceName `
                --slot staging `
                --src $deployZip
        } else {
            Write-Info "  Deploying to production..."
            az webapp deployment source config-zip `
                -g $ResourceGroup `
                -n $AppServiceName `
                --src $deployZip
        }

        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Failed to deploy to App Service"
            exit 1
        }

        Write-Success "  ✓ Deployment completed!"

        # Get App Service URL
        $appUrl = az webapp show -g $ResourceGroup -n $AppServiceName --query "defaultHostName" -o tsv
        $fullUrl = "https://$appUrl"

        if ($Slot -eq "staging") {
            $fullUrl = "https://$($AppServiceName)-staging.azurewebsites.net"
        }

        # Verify deployment with health check
        Write-Info "  Verifying deployment (this may take 10-15 seconds)..."
        $maxAttempts = 30
        $attempt = 0

        do {
            $attempt++
            try {
                $response = Invoke-WebRequest -Uri $fullUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    Write-Success "  ✓ App is responding"
                    break
                }
            } catch {
                if ($attempt -lt $maxAttempts) {
                    Write-Info "    Attempt $attempt/$maxAttempts - waiting for app to start..."
                    Start-Sleep -Seconds 2
                } else {
                    Write-Warning-Custom "  ⚠ Could not verify app response (might be loading)"
                }
            }
        } while ($attempt -lt $maxAttempts)

        # Display success summary
        Write-Success ""
        Write-Success "========================================"
        Write-Success "Deployment Successful!"
        Write-Success "========================================"
        Write-Success ""
        Write-Success "App Details:"
        Write-Success "  URL: $fullUrl"
        Write-Success "  Resource Group: $ResourceGroup"
        Write-Success "  App Service: $AppServiceName"
        Write-Success "  Slot: $Slot"
        Write-Success ""
        Write-Success "Demo Credentials:"
        Write-Success "  Admin:"
        Write-Success "    Email: admin@survey.com"
        Write-Success "    Password: Admin@123"
        Write-Success ""
        Write-Success "  Surveyor:"
        Write-Success "    Email: surveyor@survey.com"
        Write-Success "    Password: Surveyor@123"
        Write-Success ""
        Write-Success "Next Steps:"
        Write-Success "  1. Open: $fullUrl"
        Write-Success "  2. Login with demo credentials"
        Write-Success "  3. Test role-based features"
        Write-Success ""
        Write-Success "Documentation:"
        Write-Success "  - Deployment: docs/DEPLOYMENT.md"
        Write-Success "  - Troubleshooting: docs/TROUBLESHOOTING.md"
        Write-Success "  - API Reference: docs/API_REFERENCE.md"
        Write-Success "========================================"

        # Cleanup deployment package
        if (Test-Path $deployZip) {
            Remove-Item $deployZip -Force
            Write-Info ""
            Write-Info "Cleanup: Removed deployment package"
        }
    }
    catch {
        Write-Error-Custom "Error during deployment: $_"
        exit 1
    }
}

Write-Info ""
Write-Success "✓ Script execution completed!"
