@echo off
REM Deployment script for React SPA on Azure App Service
REM This script handles both CI/CD and manual deployments

setlocal
set DEPLOYMENT_SOURCE=%CD%
set DEPLOYMENT_TARGET=%DEPLOYMENT_SOURCE%\..\wwwroot

REM Check if build folder exists
if not exist "%DEPLOYMENT_SOURCE%\build" (
  echo Installing dependencies...
  call npm install

  echo Building React app...
  call npm run build
) else (
  echo Build folder already exists, skipping build
)

REM Copy build files to wwwroot
echo Deploying to wwwroot...
if not exist "%DEPLOYMENT_TARGET%" mkdir "%DEPLOYMENT_TARGET%"

REM Copy all files from build folder
xcopy "%DEPLOYMENT_SOURCE%\build\*" "%DEPLOYMENT_TARGET%\" /Y /S /I

echo Deployment complete!
exit /b 0
