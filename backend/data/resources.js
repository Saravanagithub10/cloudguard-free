const resources = [
  {
    id: "res-001",
    name: "vm-cloudguard-demo",
    type: "Virtual Machine",
    resourceGroup: "rg-cloudguard-demo",
    region: "Central India",
    status: "Running",
    configuration: {
      publicIpEnabled: true,
      sshPortOpen: true,
      diskEncryptionEnabled: false,
      monitoringEnabled: false,
      tags: {
        environment: "demo",
      },
    },
  },
  {
    id: "res-002",
    name: "stcloudguardlogs",
    type: "Storage Account",
    resourceGroup: "rg-cloudguard-demo",
    region: "Central India",
    status: "Available",
    configuration: {
      publicAccessEnabled: true,
      secureTransferRequired: true,
      encryptionEnabled: true,
      softDeleteEnabled: false,
      tags: {},
    },
  },
  {
    id: "res-003",
    name: "vnet-cloudguard-demo",
    type: "Virtual Network",
    resourceGroup: "rg-cloudguard-demo",
    region: "Central India",
    status: "Available",
    configuration: {
      networkSecurityGroupAttached: false,
      flowLogsEnabled: false,
      privateSubnetConfigured: true,
      tags: {
        environment: "demo",
        owner: "cloudguard",
      },
    },
  },
  {
    id: "res-004",
    name: "func-cloudguard-api",
    type: "Function App",
    resourceGroup: "rg-cloudguard-demo",
    region: "Central India",
    status: "Running",
    configuration: {
      httpsOnlyEnabled: true,
      authenticationEnabled: false,
      minimumTlsVersion: "1.2",
      managedIdentityEnabled: false,
      tags: {
        environment: "demo",
      },
    },
  },
];

module.exports = resources;