const createFinding = (
  ruleId,
  finding,
  severity,
  riskPoints,
  recommendation
) => ({
  ruleId,
  finding,
  severity,
  riskPoints,
  recommendation,
});

// STORAGE

const scanStorageAccount = (resource) => {
  const findings = [];
  const config = resource.configuration || {};

  if (config.publicNetworkAccess === "Enabled") {
    findings.push(
      createFinding(
        "AZ-ST-001",
        "Public network access enabled",
        "Medium",
        15,
        "Disable public network access when possible or restrict access using private endpoints."
      )
    );
  }

  if (config.networkDefaultAction === "Allow") {
    findings.push(
      createFinding(
        "AZ-ST-002",
        "Storage firewall allows access from all networks",
        "High",
        25,
        "Configure the network ACL default action as Deny."
      )
    );
  }

  if (config.allowBlobPublicAccess === true) {
    findings.push(
      createFinding(
        "AZ-ST-003",
        "Blob public access enabled",
        "Critical",
        35,
        "Disable anonymous blob public access."
      )
    );
  }

  if (config.supportsHttpsTrafficOnly === false) {
    findings.push(
      createFinding(
        "AZ-ST-004",
        "HTTPS-only traffic is disabled",
        "High",
        25,
        "Enable secure transfer required."
      )
    );
  }

  if (
    config.minimumTlsVersion !== "Unknown" &&
    config.minimumTlsVersion !== "TLS1_2"
  ) {
    findings.push(
      createFinding(
        "AZ-ST-005",
        "Minimum TLS version is below TLS 1.2",
        "High",
        25,
        "Configure minimum TLS version to TLS 1.2 or higher."
      )
    );
  }

  if (config.sharedKeyAccess === true) {
    findings.push(
      createFinding(
        "AZ-ST-006",
        "Shared Key authorization is enabled",
        "Medium",
        15,
        "Where supported, use Microsoft Entra ID authentication instead of Shared Key."
      )
    );
  }

  return findings;
};

// WEB APPS

const scanWebApp = (resource) => {
  const findings = [];
  const config = resource.configuration || {};

  if (config.httpsOnly === false) {
    findings.push(
      createFinding(
        "AZ-WEB-001",
        "HTTPS-only traffic is disabled",
        "High",
        25,
        "Enable HTTPS Only."
      )
    );
  }

  if (config.publicNetworkAccess === "Enabled") {
    findings.push(
      createFinding(
        "AZ-WEB-002",
        "Public network access enabled",
        "Medium",
        15,
        "Restrict inbound access when public exposure is not required."
      )
    );
  }

  if (config.managedIdentityEnabled === false) {
    findings.push(
      createFinding(
        "AZ-WEB-003",
        "Managed identity is not enabled",
        "Medium",
        15,
        "Enable managed identity where the application accesses Azure resources."
      )
    );
  }

  if (config.remoteDebuggingEnabled === true) {
    findings.push(
      createFinding(
        "AZ-WEB-004",
        "Remote debugging is enabled",
        "Medium",
        15,
        "Disable remote debugging when it is not required."
      )
    );
  }

  return findings;
};

// SQL SERVER

const scanSqlServer = (resource) => {
  const findings = [];
  const config = resource.configuration || {};

  if (config.publicNetworkAccess === "Enabled") {
    findings.push(
      createFinding(
        "AZ-SQL-001",
        "SQL Server public network access is enabled",
        "High",
        25,
        "Disable public network access where possible or restrict connectivity using firewall rules and private endpoints."
      )
    );
  }

  if (config.privateEndpointCount === 0) {
    findings.push(
      createFinding(
        "AZ-SQL-002",
        "No private endpoint configured",
        "Medium",
        15,
        "Consider using a private endpoint for private network connectivity."
      )
    );
  }

  if (config.managedIdentityEnabled === false) {
    findings.push(
      createFinding(
        "AZ-SQL-003",
        "Managed identity is not enabled",
        "Medium",
        15,
        "Enable a managed identity when SQL Server needs to access Azure services securely."
      )
    );
  }

  if (
    config.minimumTlsVersion !== "Unknown" &&
    config.minimumTlsVersion !== "1.2"
  ) {
    findings.push(
      createFinding(
        "AZ-SQL-004",
        "Minimum TLS version is below TLS 1.2",
        "High",
        25,
        "Configure the SQL logical server minimum TLS version to TLS 1.2."
      )
    );
  }

  return findings;
};

// SQL DATABASE

const scanSqlDatabase = (resource) => {
  const findings = [];
  const config = resource.configuration || {};

  // Don't treat system master DB like an application DB.
  if (resource.name?.toLowerCase() === "master") {
    return findings;
  }

  if (config.infrastructureEncryption === false) {
    findings.push(
      createFinding(
        "AZ-SQLDB-001",
        "Infrastructure encryption is not enabled",
        "Medium",
        15,
        "Evaluate enabling infrastructure encryption when stronger at-rest protection is required."
      )
    );
  }

  return findings;
};

// RISK

const calculateRiskPoints = (findings) =>
  findings.reduce(
    (total, finding) =>
      total + (finding.riskPoints || 0),
    0
  );

const determineRiskLevel = (riskPoints) => {
  if (riskPoints >= 70) return "Critical";
  if (riskPoints >= 40) return "High";
  if (riskPoints >= 20) return "Medium";
  return "Low";
};

// MAIN SCANNER

const scanResource = (resource) => {
  let findings = [];
  let hasScanner = false;

  const azureType =
    resource.azureType?.toLowerCase() || "";

  switch (azureType) {
    case "microsoft.storage/storageaccounts":
      findings = scanStorageAccount(resource);
      hasScanner = true;
      break;

    case "microsoft.web/sites":
      findings = scanWebApp(resource);
      hasScanner = true;
      break;

    case "microsoft.sql/servers":
      findings = scanSqlServer(resource);
      hasScanner = true;
      break;

    case "microsoft.sql/servers/databases":
      findings = scanSqlDatabase(resource);
      hasScanner = true;
      break;

    default:
      findings = [];
      hasScanner = false;
  }

  const riskPoints = calculateRiskPoints(findings);

  return {
    ...resource,

    findings,

    riskPoints,

    riskLevel: hasScanner
      ? determineRiskLevel(riskPoints)
      : "Unknown",

    securityStatus: hasScanner
      ? findings.length > 0
        ? "At Risk"
        : "Healthy"
      : "Not Scanned",
  };
};

const scanResources = (resources = []) => {
  if (!Array.isArray(resources)) {
    return [];
  }

  return resources.map(scanResource);
};

module.exports = {
  scanResource,
  scanResources,
};