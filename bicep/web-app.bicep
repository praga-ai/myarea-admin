param location string = resourceGroup().location
param appName string = 'survey-admin'
param environment string = 'dev'
param uniqueSuffix string = 'cs'
param tier string = 'Standard'
param skuName string = 'S1'

// Naming variables
var appServicePlanName = 'asp-${appName}-${uniqueSuffix}-${environment}'
var appServiceName = 'app-${appName}-${uniqueSuffix}-${environment}'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: skuName
    tier: tier
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// App Service
resource appService 'Microsoft.Web/sites@2022-09-01' = {
  name: appServiceName
  location: location
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      minTlsVersion: '1.2'
      http20Enabled: true
      alwaysOn: true
      appCommandLine: ''
      defaultDocuments: [
        'index.html'
      ]
      appSettings: [
        {
          name: 'REACT_APP_API_BASE_URL'
          value: 'https://func-mobileapp-cs-in.azurewebsites.net/api'
        }
        {
          name: 'REACT_APP_APP_NAME'
          value: 'Survey Admin'
        }
        {
          name: 'REACT_APP_VERSION'
          value: '1.0.0'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
    }
    clientAffinityEnabled: false
  }
}

// Staging slot
resource stagingSlot 'Microsoft.Web/sites/slots@2022-09-01' = {
  parent: appService
  name: 'staging'
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      minTlsVersion: '1.2'
    }
  }
}

// Outputs
output appServiceName string = appService.name
output appServiceId string = appService.id
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output appServicePlanName string = appServicePlan.name
