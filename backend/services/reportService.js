const alerts = require("../data/alertStore");
const incidents = require("../data/incidentStore");

const {
  getAzureResources,
} = require("./azureResourceService");

const {
  synchronizeAzureAlerts,
} = require("./liveAlertService");

const {
  buildActivityLogs,
  buildActivitySummary,
} = require("./activityService");

// ========================================
// GENERIC COUNTER
// ========================================

const countByValue = (
  items = [],
  key,
  allowedValues = []
) => {
  const counts = {};

  allowedValues.forEach((value) => {
    counts[value] = 0;
  });

  items.forEach((item) => {
    const value =
      item?.[key] || "Unknown";

    counts[value] =
      (counts[value] || 0) + 1;
  });

  return counts;
};

// ========================================
// SECURITY SCORE
// ========================================

const calculateSecurityScore = (
  scannedResources = []
) => {
  if (scannedResources.length === 0) {
    return 100;
  }

  const totalRiskPoints =
    scannedResources.reduce(
      (total, resource) =>
        total +
        (resource.riskPoints || 0),
      0
    );

  const maximumRiskPoints =
    scannedResources.length * 100;

  const score =
    100 -
    (totalRiskPoints /
      maximumRiskPoints) *
      100;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(score)
    )
  );
};

// ========================================
// BUILD LIVE SECURITY REPORT
// ========================================

const buildSecurityReport = async () => {
  // Get latest resources directly from Azure
  const azureResources =
    await getAzureResources();

  // Keep live alert store synchronized
  // with current Azure findings.
  await synchronizeAzureAlerts();

  // Only resources for which CloudGuard
  // currently has scanning rules.
  const scannedResources =
    azureResources.filter(
      (resource) =>
        resource.securityStatus !==
        "Not Scanned"
    );

  const notScannedResources =
    azureResources.filter(
      (resource) =>
        resource.securityStatus ===
        "Not Scanned"
    );

  const activities =
    buildActivityLogs();

  // ========================================
  // RESOURCE SUMMARY
  // ========================================

  const resourceSummary = {
    totalResources:
      azureResources.length,

    scannedResources:
      scannedResources.length,

    notScannedResources:
      notScannedResources.length,

    healthyResources:
      scannedResources.filter(
        (resource) =>
          resource.securityStatus ===
          "Healthy"
      ).length,

    atRiskResources:
      scannedResources.filter(
        (resource) =>
          resource.securityStatus ===
          "At Risk"
      ).length,

    criticalResources:
      scannedResources.filter(
        (resource) =>
          resource.riskLevel ===
          "Critical"
      ).length,

    highRiskResources:
      scannedResources.filter(
        (resource) =>
          resource.riskLevel ===
          "High"
      ).length,

    mediumRiskResources:
      scannedResources.filter(
        (resource) =>
          resource.riskLevel ===
          "Medium"
      ).length,

    lowRiskResources:
      scannedResources.filter(
        (resource) =>
          resource.riskLevel ===
          "Low"
      ).length,

    securityScore:
      calculateSecurityScore(
        scannedResources
      ),
  };

  // ========================================
  // ALERT SUMMARY
  // ========================================

  const alertSummary = {
    totalAlerts:
      alerts.length,

    activeAlerts:
      alerts.filter(
        (alert) =>
          alert.status === "Active"
      ).length,

    acknowledgedAlerts:
      alerts.filter(
        (alert) =>
          alert.status ===
          "Acknowledged"
      ).length,

    resolvedAlerts:
      alerts.filter(
        (alert) =>
          alert.status === "Resolved"
      ).length,

    criticalAlerts:
      alerts.filter(
        (alert) =>
          alert.severity ===
          "Critical"
      ).length,

    highAlerts:
      alerts.filter(
        (alert) =>
          alert.severity === "High"
      ).length,

    mediumAlerts:
      alerts.filter(
        (alert) =>
          alert.severity ===
          "Medium"
      ).length,

    lowAlerts:
      alerts.filter(
        (alert) =>
          alert.severity === "Low"
      ).length,
  };

  // ========================================
  // INCIDENT SUMMARY
  // ========================================

  const incidentSummary = {
    totalIncidents:
      incidents.length,

    openIncidents:
      incidents.filter(
        (incident) =>
          incident.status === "Open"
      ).length,

    inProgressIncidents:
      incidents.filter(
        (incident) =>
          incident.status ===
          "In Progress"
      ).length,

    resolvedIncidents:
      incidents.filter(
        (incident) =>
          incident.status ===
          "Resolved"
      ).length,

    closedIncidents:
      incidents.filter(
        (incident) =>
          incident.status ===
          "Closed"
      ).length,

    criticalIncidents:
      incidents.filter(
        (incident) =>
          incident.severity ===
          "Critical"
      ).length,
  };

  // ========================================
  // LIVE AZURE FINDINGS
  // ========================================

  const findings =
    scannedResources.flatMap(
      (resource) => {
        const resourceFindings =
          Array.isArray(
            resource.findings
          )
            ? resource.findings
            : [];

        return resourceFindings.map(
          (finding) => ({
            ...finding,

            // Compatibility with existing
            // reports / CSV frontend.
            title:
              finding.finding ||
              finding.title ||
              "Security Finding",

            finding:
              finding.finding ||
              finding.title ||
              "Security Finding",

            points:
              finding.riskPoints ??
              finding.points ??
              0,

            resourceId:
              resource.id,

            resourceName:
              resource.name,

            resourceType:
              resource.type,

            azureType:
              resource.azureType,

            resourceGroup:
              resource.resourceGroup,

            region:
              resource.region,

            source:
              resource.source ||
              "Azure Resource Graph",
          })
        );
      }
    );

  // ========================================
  // BREAKDOWNS
  // ========================================

  const severityBreakdown =
    countByValue(
      findings,
      "severity",
      [
        "Critical",
        "High",
        "Medium",
        "Low",
      ]
    );

  const alertSeverityBreakdown =
    countByValue(
      alerts,
      "severity",
      [
        "Critical",
        "High",
        "Medium",
        "Low",
      ]
    );

  const incidentStatusBreakdown =
    countByValue(
      incidents,
      "status",
      [
        "Open",
        "In Progress",
        "Resolved",
        "Closed",
      ]
    );

  const resourceTypeBreakdown =
    countByValue(
      azureResources,
      "type"
    );

  const securityStatusBreakdown =
    countByValue(
      azureResources,
      "securityStatus",
      [
        "Healthy",
        "At Risk",
        "Not Scanned",
      ]
    );

  // ========================================
  // TOP RISK RESOURCES
  // ========================================

  const topRiskResources =
    [...scannedResources]
      .sort(
        (first, second) =>
          (second.riskPoints || 0) -
          (first.riskPoints || 0)
      )
      .slice(0, 5)
      .map((resource) => ({
        id:
          resource.id,

        name:
          resource.name,

        type:
          resource.type,

        azureType:
          resource.azureType,

        resourceGroup:
          resource.resourceGroup,

        region:
          resource.region,

        riskLevel:
          resource.riskLevel,

        riskPoints:
          resource.riskPoints || 0,

        findingsCount:
          Array.isArray(
            resource.findings
          )
            ? resource.findings.length
            : 0,

        securityStatus:
          resource.securityStatus,

        source:
          resource.source ||
          "Azure Resource Graph",
      }));

  // ========================================
  // FINAL REPORT
  // ========================================

  return {
    generatedAt:
      new Date().toISOString(),

    source:
      "Azure Resource Graph",

    overview: {
      securityScore:
        resourceSummary.securityScore,

      totalResources:
        resourceSummary.totalResources,

      scannedResources:
        resourceSummary.scannedResources,

      notScannedResources:
        resourceSummary.notScannedResources,

      totalFindings:
        findings.length,

      totalAlerts:
        alertSummary.totalAlerts,

      totalIncidents:
        incidentSummary.totalIncidents,

      totalActivities:
        activities.length,
    },

    resourceSummary,

    alertSummary,

    incidentSummary,

    severityBreakdown,

    alertSeverityBreakdown,

    incidentStatusBreakdown,

    resourceTypeBreakdown,

    securityStatusBreakdown,

    activitySummary:
      buildActivitySummary(
        activities
      ),

    topRiskResources,

    findings,

    alerts,

    incidents,
  };
};

module.exports = {
  buildSecurityReport,
};