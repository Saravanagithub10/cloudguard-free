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
        properties.encryption?.services?.blob?.enabled ??
        "Unknown",

      fileEncryptionEnabled:
        properties.encryption?.services?.file?.enabled ??
        "Unknown",

      privateEndpointCount: Array.isArray(
        properties.privateEndpointConnections
      )
        ? properties.privateEndpointConnections.length
        : 0,
    };
  }

  // APP SERVICE / FUNCTION APP
  if (azureType === "microsoft.web/sites") {
    return {
      kind:
        resource.kind ??
        properties.kind ??
        "Unknown",

      httpsOnly:
        properties.httpsOnly ?? "Unknown",

      publicNetworkAccess:
        properties.publicNetworkAccess ?? "Unknown",

      managedIdentityEnabled:
        Boolean(
          resource.identity &&
            resource.identity.type &&
            resource.identity.type !== "None"
        ),

      managedIdentityType:
        resource.identity?.type ?? "None",

      clientCertificateEnabled:
        properties.clientCertEnabled ?? "Unknown",

      minimumTlsVersion:
        properties.siteConfig?.minTlsVersion ?? "Unknown",

      http20Enabled:
        properties.siteConfig?.http20Enabled ?? "Unknown",

      remoteDebuggingEnabled:
        properties.siteConfig?.remoteDebuggingEnabled ??
        "Unknown",

      privateEndpointCount: Array.isArray(
        properties.privateEndpointConnections
      )
        ? properties.privateEndpointConnections.length
        : 0,

      runtime:
        properties.siteConfig?.linuxFxVersion ||
        properties.siteConfig?.windowsFxVersion ||
        "Unknown",

      sku:
        properties.sku ?? "Unknown",
    };
  }

  // SQL SERVER
  if (azureType === "microsoft.sql/servers") {
    return {
      publicNetworkAccess:
        properties.publicNetworkAccess ?? "Unknown",

      minimumTlsVersion:
        properties.minimalTlsVersion ?? "Unknown",

      managedIdentityEnabled:
        Boolean(
          resource.identity &&
            resource.identity.type &&
            resource.identity.type !== "None"
        ),

      managedIdentityType:
        resource.identity?.type ?? "None",

      privateEndpointCount: Array.isArray(
        properties.privateEndpointConnections
      )
        ? properties.privateEndpointConnections.length
        : 0,

      restrictOutboundNetworkAccess:
        properties.restrictOutboundNetworkAccess ?? "Unknown",

      state:
        properties.state ?? "Unknown",

      version:
        properties.version ?? "Unknown",
    };
  }

  // SQL DATABASE
  if (azureType === "microsoft.sql/servers/databases") {
    return {
      status:
        properties.status ?? "Unknown",

      infrastructureEncryption:
        properties.isInfraEncryptionEnabled ?? "Unknown",

      ledgerEnabled:
        properties.isLedgerOn ?? "Unknown",

      zoneRedundant:
        properties.zoneRedundant ?? "Unknown",

      backupStorageRedundancy:
        properties.currentBackupStorageRedundancy ??
        properties.requestedBackupStorageRedundancy ??
        "Unknown",

      sku:
        properties.currentSku?.name ?? "Unknown",

      tier:
        properties.currentSku?.tier ?? "Unknown",

      autoPauseDelay:
        properties.autoPauseDelay ?? "Unknown",

      freeLimitEnabled:
        properties.useFreeLimit ?? false,
    };
  }

  return {};
};

const normalizeAzureResource = (resource) => {
  const properties = resource.properties || {};

  return {
    id: resource.id,

    name: resource.name || "Unnamed Resource",

    type: normalizeType(resource.type),

    azureType:
      resource.type?.toLowerCase() || "unknown",

    resourceGroup:
      resource.resourceGroup || "Unknown Resource Group",

    region:
      resource.location || "Unknown",

    status:
      properties.provisioningState ||
      properties.availabilityState ||
      properties.status ||
      properties.statusOfPrimary ||
      "Available",

    tags:
      resource.tags &&
      typeof resource.tags === "object"
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