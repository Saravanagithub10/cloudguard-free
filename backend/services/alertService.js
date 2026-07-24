const createAlertsFromResources = (resources) => {
  return resources.flatMap((resource) =>
    resource.findings.map((finding) => ({
      id: `ALT-${resource.id}-${finding.ruleId}`,
      title: finding.title,
      severity: finding.severity,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      resourceGroup: resource.resourceGroup,
      status: "Active",
      recommendation: finding.recommendation,
      riskPoints: finding.points,
      createdAt: new Date().toISOString(),
    }))
  );
};

module.exports = {
  createAlertsFromResources,
};