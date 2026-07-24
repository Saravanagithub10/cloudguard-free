const securityRules = [
  {
    id: "RULE-001",
    title: "Public IP enabled",
    resourceType: "Virtual Machine",
    severity: "High",
    points: 25,
    check: (resource) => resource.configuration.publicIpEnabled === true,
    recommendation: "Remove the public IP or restrict access using an NSG.",
  },
  {
    id: "RULE-002",
    title: "SSH port exposed",
    resourceType: "Virtual Machine",
    severity: "Critical",
    points: 35,
    check: (resource) => resource.configuration.sshPortOpen === true,
    recommendation: "Restrict SSH access to trusted IP addresses.",
  },
  {
    id: "RULE-003",
    title: "Disk encryption disabled",
    resourceType: "Virtual Machine",
    severity: "High",
    points: 25,
    check: (resource) =>
      resource.configuration.diskEncryptionEnabled === false,
    recommendation: "Enable disk encryption for the virtual machine.",
  },
  {
    id: "RULE-004",
    title: "Storage public access enabled",
    resourceType: "Storage Account",
    severity: "Critical",
    points: 35,
    check: (resource) =>
      resource.configuration.publicAccessEnabled === true,
    recommendation: "Disable anonymous public access.",
  },
  {
    id: "RULE-005",
    title: "Storage soft delete disabled",
    resourceType: "Storage Account",
    severity: "Medium",
    points: 15,
    check: (resource) =>
      resource.configuration.softDeleteEnabled === false,
    recommendation: "Enable soft delete to protect against accidental deletion.",
  },
  {
    id: "RULE-006",
    title: "NSG not attached",
    resourceType: "Virtual Network",
    severity: "High",
    points: 25,
    check: (resource) =>
      resource.configuration.networkSecurityGroupAttached === false,
    recommendation: "Attach a Network Security Group.",
  },
  {
    id: "RULE-007",
    title: "Flow logs disabled",
    resourceType: "Virtual Network",
    severity: "Medium",
    points: 15,
    check: (resource) =>
      resource.configuration.flowLogsEnabled === false,
    recommendation: "Enable network flow logging.",
  },
  {
    id: "RULE-008",
    title: "Authentication disabled",
    resourceType: "Function App",
    severity: "High",
    points: 25,
    check: (resource) =>
      resource.configuration.authenticationEnabled === false,
    recommendation: "Enable authentication for the Function App.",
  },
  {
    id: "RULE-009",
    title: "Managed identity disabled",
    resourceType: "Function App",
    severity: "Medium",
    points: 15,
    check: (resource) =>
      resource.configuration.managedIdentityEnabled === false,
    recommendation: "Enable managed identity.",
  },
];

module.exports = securityRules;