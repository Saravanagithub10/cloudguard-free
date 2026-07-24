const securityRules = require("../rules/securityRules");

const getResourceRiskLevel = (riskPoints) => {
  if (riskPoints >= 60) return "Critical";
  if (riskPoints >= 35) return "High";
  if (riskPoints >= 15) return "Medium";
  return "Low";
};

const scanResource = (resource) => {
  const applicableRules = securityRules.filter(
    (rule) => rule.resourceType === resource.type
  );

  const findings = applicableRules
    .filter((rule) => rule.check(resource))
    .map((rule) => ({
      ruleId: rule.id,
      title: rule.title,
      severity: rule.severity,
      recommendation: rule.recommendation,
      points: rule.points,
    }));

  const riskPoints = findings.reduce(
    (total, finding) => total + finding.points,
    0
  );

  return {
    ...resource,
    findings,
    riskPoints,
    riskLevel: getResourceRiskLevel(riskPoints),
    securityStatus: findings.length === 0 ? "Healthy" : "At Risk",
  };
};

const scanResources = (resources) => resources.map(scanResource);

module.exports = {
  scanResources,
};