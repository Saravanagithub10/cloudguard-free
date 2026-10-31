
const normalizeType = (azureType) => {
  const type = azureType?.toLowerCase() || "";

  const typeMap = {
    "microsoft.web/sites": "Function App / Web App",
    "microsoft.web/staticsites": "Static Web App",
    "microsoft.storage/storageaccounts": "Storage Account",
    "microsoft.sql/servers": "SQL Server",
    "microsoft.sql/servers/databases": "SQL Database",
    "microsoft.network/virtualnetworks": "Virtual Network",
    "microsoft.network/networksecuritygroups": "Network Security Group",
    "microsoft.network/publicipaddresses": "Public IP Address",
    "microsoft.network/networkwatchers": "Network Watcher",
    "microsoft.insights/components": "Application Insights",
    "microsoft.insights/actiongroups": "Action Group",
    "microsoft.operationalinsights/workspaces":
      "Log Analytics Workspace",
    "microsoft.managedidentity/userassignedidentities":
      "Managed Identity",
    "microsoft.web/serverfarms": "App Service Plan",
    "microsoft.operationsmanagement/solutions":
      "Operations Management Solution",
    "microsoft.web/connections": "API Connection",
    "microsoft.logic/workflows": "Logic App Workflow",
  };

  return typeMap[type] || azureType || "Unknown Resource";
};

const getConfiguration = (resource) => {
  const azureType = resource.type?.toLowerCase() || "";
  const properties = resource.properties || {};

  // STORAGE ACCOUNT
  if (azureType === "microsoft.storage/storageaccounts") {
    return {
      publicNetworkAccess:
        properties.publicNetworkAccess ?? "Unknown",
      allowBlobPublicAccess:
        properties.allowBlobPublicAccess ?? "Unknown",
      supportsHttpsTrafficOnly:
        properties.supportsHttpsTrafficOnly ?? "Unknown",
      minimumTlsVersion:
        properties.minimumTlsVersion ?? "Unknown",
      networkDefaultAction:
        properties.networkAcls?.defaultAction ?? "Unknown",
      sharedKeyAccess:
        properties.allowSharedKeyAccess ?? "Unknown",
      infrastructureEncryption:
        properties.encryption?.requireInfrastructureEncryption ??
        "Unknown",
      blobEncryptionEnabled:
        properties.encryption?.services?.blob?.enabled ?? "Unknown",
      fileEncryptionEnabled:
        properties.encryption?.services?.file?.enabled ?? "Unknown",
      privateEndpointCount: Array.isArray(
        properties.privateEndpointConnections
      )
        ? properties.privateEndpointConnections.length
        : null,
    };
  }

  // STATIC WEB APP
  if (azureType === "microsoft.web/staticsites") {
    return {
      publicNetworkAccess:
        properties.publicNetworkAccess ?? "Unknown",
      stagingEnvironmentPolicy:
        properties.stagingEnvironmentPolicy ?? "Unknown",
      allowConfigFileUpdates:
        properties.allowConfigFileUpdates ?? "Unknown",
      deploymentAuthPolicy:
        properties.deploymentAuthPolicy ?? "Unknown",
      enterpriseGradeCdnStatus:
        properties.enterpriseGradeCdnStatus ?? "Unknown",
      privateEndpointCount: Array.isArray(
        properties.privateEndpointConnections
      )
        ? properties.privateEndpointConnections.length
        : null,
      customDomainCount: Array.isArray(properties.customDomains)
        ? properties.customDomains.length
        : null,
      provider: properties.provider ?? "Unknown",
      branch: properties.branch ?? "Unknown",
      repositoryUrl: properties.repositoryUrl ?? "Unknown",
      defaultHostname: properties.defaultHostname ?? "Unknown",
      buildProperties: {
        appLocation:
          properties.buildProperties?.appLocation ?? "Unknown",
        apiLocation:
          properties.buildProperties?.apiLocation ?? "Unknown",
        outputLocation:
          properties.buildProperties?.outputLocation ?? "Unknown",
      },
    };
  }

  // APP SERVICE / FUNCTION APP
  if (azureType === "microsoft.web/sites") {
    return {
      kind: resource.kind ?? properties.kind ?? "Unknown",
      httpsOnly: properties.httpsOnly ?? "Unknown",
      publicNetworkAccess:
        properties.publicNetworkAccess ?? "Unknown",
      managedIdentityEnabled: resource.identity?.type
        ? resource.identity.type !== "None"
        : false,
      managedIdentityType: resource.identity?.type ?? "None",
      clientCertificateEnabled:
        properties.clientCertEnabled ?? "Unknown",
      minimumTlsVersion:
        properties.siteConfig?.minTlsVersion ?? "Unknown",
      http20Enabled:
        properties.siteConfig?.http20Enabled ?? "Unknown",
      remoteDebuggingEnabled:
        properties.siteConfig?.remoteDebuggingEnabled ?? "Unknown",
      privateEndpointCount: Array.isArray(
        properties.privateEndpointConnections
      )
        ? properties.privateEndpointConnections.length
        : null,
      runtime:
        properties.siteConfig?.linuxFxVersion ||
        properties.siteConfig?.windowsFxVersion ||
        "Unknown",
      sku: properties.sku ?? "Unknown",
    };
  }

  // APP SERVICE PLAN
  if (azureType === "microsoft.web/serverfarms") {
    return {
      status: properties.status ?? "Unknown",
      provisioningState: properties.provisioningState ?? "Unknown",
      reserved: properties.reserved ?? "Unknown",
      hyperV: properties.hyperV ?? "Unknown",
      perSiteScaling: properties.perSiteScaling ?? "Unknown",
      maximumElasticWorkerCount:
        properties.maximumElasticWorkerCount ?? "Unknown",
      targetWorkerCount: properties.targetWorkerCount ?? "Unknown",
      targetWorkerSizeId: properties.targetWorkerSizeId ?? "Unknown",
      zoneRedundant: properties.zoneRedundant ?? "Unknown",
      hostingEnvironmentProfile:
        properties.hostingEnvironmentProfile ?? null,
      sku: resource.sku ?? properties.sku ?? null,
    };
  }

  // SQL SERVER
  if (azureType === "microsoft.sql/servers") {
    return {
      publicNetworkAccess:
        properties.publicNetworkAccess ?? "Unknown",
      minimumTlsVersion:
        properties.minimalTlsVersion ?? "Unknown",
      managedIdentityEnabled: resource.identity?.type
        ? resource.identity.type !== "None"
        : false,
      managedIdentityType: resource.identity?.type ?? "None",
      privateEndpointCount: Array.isArray(
        properties.privateEndpointConnections
      )
        ? properties.privateEndpointConnections.length
        : null,
      restrictOutboundNetworkAccess:
        properties.restrictOutboundNetworkAccess ?? "Unknown",
      state: properties.state ?? "Unknown",
      version: properties.version ?? "Unknown",
    };
  }
    // USER-ASSIGNED MANAGED IDENTITY
  if (
    azureType ===
    "microsoft.managedidentity/userassignedidentities"
  ) {
    return {
      clientId: properties.clientId ?? "Unknown",
      principalId: properties.principalId ?? "Unknown",
      tenantId: properties.tenantId ?? "Unknown",
      isolationScope: properties.isolationScope ?? "Unknown",
    };
  }

  // SQL DATABASE
  if (azureType === "microsoft.sql/servers/databases") {
    return {
      status: properties.status ?? "Unknown",
      infrastructureEncryption:
        properties.isInfraEncryptionEnabled ?? "Unknown",
      ledgerEnabled: properties.isLedgerOn ?? "Unknown",
      zoneRedundant: properties.zoneRedundant ?? "Unknown",
      backupStorageRedundancy:
        properties.currentBackupStorageRedundancy ??
        properties.requestedBackupStorageRedundancy ??
        "Unknown",
      sku: properties.currentSku?.name ?? "Unknown",
      tier: properties.currentSku?.tier ?? "Unknown",
      autoPauseDelay: properties.autoPauseDelay ?? "Unknown",
      freeLimitEnabled: properties.useFreeLimit ?? "Unknown",
    };
  }

  // Other resource types: configuration not yet normalized.
  return {};
};

const normalizeAzureResource = (resource) => {
  const properties = resource.properties || {};

  return {
    id: resource.id,
    name: resource.name || "Unnamed Resource",
    type: normalizeType(resource.type),
    azureType: resource.type?.toLowerCase() || "unknown",
    resourceGroup: resource.resourceGroup || "Unknown Resource Group",
    region: resource.location || "Unknown",
    status:
      properties.provisioningState ||
      properties.availabilityState ||
      properties.status ||
      properties.statusOfPrimary ||
      "Available",
    tags:
      resource.tags && typeof resource.tags === "object"
        ? resource.tags
        : {},
    source: "Azure Resource Graph",
    configuration: getConfiguration(resource),
    findings: [],
    riskPoints: 0,
    riskLevel: "Low",
    securityStatus: "Pending Scan",
  };
};

const normalizeAzureResources = (resources = []) => {
  if (!Array.isArray(resources)) {
    return [];
  }

  return resources.map(normalizeAzureResource);
};

module.exports = {
  normalizeAzureResource,
  normalizeAzureResources,
};
