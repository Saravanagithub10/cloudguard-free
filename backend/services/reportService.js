const resources = require("../data/resources");
const alerts = require("../data/alertStore");
const incidents = require("../data/incidentStore");
const { scanResources } = require("./resourceScanner");
const {
  buildActivityLogs,
  buildActivitySummary,
} = require("./activityService");

const countByValue = (items, key, allowedValues = []) => {
  const counts = {};

  allowedValues.forEach((value) => {
    counts[value] = 0;
  });

  items.forEach((item) => {
    const value = item[key] || "Unknown";
    counts[value] = (counts[value] || 0) + 1;
  });

  return counts;
};

const calculateSecurityScore = (scannedResources) => {
  const totalRiskPoints = scannedResources.reduce(
    (total, resource) => total + resource.riskPoints,
    0
  );

  const maximumRiskPoints = scannedResources.length * 100;

  if (maximumRiskPoints === 0) {
    return 100;
  }

  return Math.max(
    0,
    Math.round(
      100 - (totalRiskPoints / maximumRiskPoints) * 100
    )
  );
};

const buildSecurityReport = () => {
  const scannedResources = scanResources(resources);
  const activities = buildActivityLogs();

  const resourceSummary = {
    totalResources: scannedResources.length,

    healthyResources: scannedResources.filter(
      (resource) => resource.securityStatus === "Healthy"
    ).length,

    atRiskResources: scannedResources.filter(
      (resource) => resource.securityStatus === "At Risk"
    ).length,

    criticalResources: scannedResources.filter(
      (resource) => resource.riskLevel === "Critical"
    ).length,

    securityScore: calculateSecurityScore(scannedResources),
  };

  const alertSummary = {
    totalAlerts: alerts.length,

    activeAlerts: alerts.filter(
      (alert) => alert.status === "Active"
    ).length,

    acknowledgedAlerts: alerts.filter(
      (alert) => alert.status === "Acknowledged"
    ).length,

    resolvedAlerts: alerts.filter(
      (alert) => alert.status === "Resolved"
    ).length,
  };

  const incidentSummary = {
    totalIncidents: incidents.length,

    openIncidents: incidents.filter(
      (incident) => incident.status === "Open"
    ).length,

    inProgressIncidents: incidents.filter(
      (incident) => incident.status === "In Progress"
    ).length,

    resolvedIncidents: incidents.filter(
      (incident) => incident.status === "Resolved"
    ).length,

    closedIncidents: incidents.filter(
      (incident) => incident.status === "Closed"
    ).length,
  };

  const findings = scannedResources.flatMap((resource) =>
    resource.findings.map((finding) => ({
      ...finding,
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      resourceGroup: resource.resourceGroup,
      region: resource.region,
    }))
  );

  const severityBreakdown = countByValue(findings, "severity", [
    "Critical",
    "High",
    "Medium",
    "Low",
  ]);

  const alertSeverityBreakdown = countByValue(alerts, "severity", [
    "Critical",
    "High",
    "Medium",
    "Low",
  ]);

  const incidentStatusBreakdown = countByValue(
    incidents,
    "status",
    ["Open", "In Progress", "Resolved", "Closed"]
  );

  const resourceTypeBreakdown = countByValue(
    scannedResources,
    "type"
  );

  const topRiskResources = [...scannedResources]
    .sort((first, second) => second.riskPoints - first.riskPoints)
    .slice(0, 5)
    .map((resource) => ({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      riskLevel: resource.riskLevel,
      riskPoints: resource.riskPoints,
      findingsCount: resource.findings.length,
    }));

  return {
    generatedAt: new Date().toISOString(),

    overview: {
      securityScore: resourceSummary.securityScore,
      totalResources: resourceSummary.totalResources,
      totalFindings: findings.length,
      totalAlerts: alertSummary.totalAlerts,
      totalIncidents: incidentSummary.totalIncidents,
      totalActivities: activities.length,
    },

    resourceSummary,
    alertSummary,
    incidentSummary,

    severityBreakdown,
    alertSeverityBreakdown,
    incidentStatusBreakdown,
    resourceTypeBreakdown,

    activitySummary: buildActivitySummary(activities),

    topRiskResources,
    findings,
    alerts,
    incidents,
  };
};

module.exports = {
  buildSecurityReport,
};