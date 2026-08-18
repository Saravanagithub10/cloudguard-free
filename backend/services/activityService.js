const alerts = require("../data/alertStore");
const incidents = require("../data/incidentStore");

// ========================================
// BUILD ALERT ACTIVITIES
// ========================================

const buildAlertActivities = () => {
  return alerts.flatMap((alert) => {
    const activities = Array.isArray(alert.activity)
      ? alert.activity
      : [];

    return activities.map((activity, index) => ({
      id: `ACT-ALERT-${alert.id}-${index + 1}`,

      entityType: "Alert",
      entityId: alert.id,

      action:
        activity.action || "Unknown",

      message:
        activity.message || "No activity message available.",

      timestamp:
        activity.timestamp || alert.createdAt || null,

      severity:
        alert.severity || "Unknown",

      status:
        alert.status || "Unknown",

      // Azure resource information
      resourceId:
        alert.resourceId || null,

      resourceName:
        alert.resourceName || "Unknown Resource",

      resourceType:
        alert.resourceType || "Unknown",

      azureType:
        alert.azureType || "Unknown",

      resourceGroup:
        alert.resourceGroup || "Unknown",

      region:
        alert.region || "Unknown",

      // Security finding information
      ruleId:
        alert.ruleId || null,

      riskPoints:
        alert.riskPoints ?? 0,

      source:
        alert.source || "Azure Resource Graph",
    }));
  });
};

// ========================================
// BUILD INCIDENT ACTIVITIES
// ========================================

const buildIncidentActivities = () => {
  return incidents.flatMap((incident) => {
    const activities = Array.isArray(incident.activity)
      ? incident.activity
      : [];

    return activities.map((activity, index) => ({
      id: `ACT-INCIDENT-${incident.id}-${index + 1}`,

      entityType: "Incident",
      entityId: incident.id,

      action:
        activity.action || "Unknown",

      message:
        activity.message || "No activity message available.",

      timestamp:
        activity.timestamp || incident.createdAt || null,

      severity:
        incident.severity || "Unknown",

      status:
        incident.status || "Unknown",

      // Azure resource information
      resourceId:
        incident.resourceId || null,

      resourceName:
        incident.resourceName || "Unknown Resource",

      resourceType:
        incident.resourceType || "Unknown",

      azureType:
        incident.azureType || "Unknown",

      resourceGroup:
        incident.resourceGroup || "Unknown",

      region:
        incident.region || "Unknown",

      // Security finding information
      ruleId:
        incident.ruleId || null,

      riskPoints:
        incident.riskPoints ?? 0,

      source:
        incident.source || "Azure Resource Graph",

      // Incident ownership
      assignedTo:
        incident.assignedTo || "Unassigned",
    }));
  });
};

// ========================================
// BUILD COMPLETE ACTIVITY LOG
// ========================================

const buildActivityLogs = () => {
  const alertActivities = buildAlertActivities();
  const incidentActivities = buildIncidentActivities();

  return [
    ...alertActivities,
    ...incidentActivities,
  ].sort((firstActivity, secondActivity) => {
    const firstTimestamp = firstActivity.timestamp
      ? new Date(firstActivity.timestamp).getTime()
      : 0;

    const secondTimestamp = secondActivity.timestamp
      ? new Date(secondActivity.timestamp).getTime()
      : 0;

    return secondTimestamp - firstTimestamp;
  });
};

// ========================================
// BUILD ACTIVITY SUMMARY
// ========================================

const buildActivitySummary = (activities = []) => ({
  totalActivities:
    activities.length,

  alertActivities:
    activities.filter(
      (activity) =>
        activity.entityType === "Alert"
    ).length,

  incidentActivities:
    activities.filter(
      (activity) =>
        activity.entityType === "Incident"
    ).length,

  createdActivities:
    activities.filter(
      (activity) =>
        activity.action === "Created"
    ).length,

  acknowledgedActivities:
    activities.filter(
      (activity) =>
        activity.action === "Acknowledged"
    ).length,

  inProgressActivities:
    activities.filter(
      (activity) =>
        activity.action === "In Progress"
    ).length,

  resolvedActivities:
    activities.filter(
      (activity) =>
        activity.action === "Resolved"
    ).length,

  closedActivities:
    activities.filter(
      (activity) =>
        activity.action === "Closed"
    ).length,

  criticalActivities:
    activities.filter(
      (activity) =>
        activity.severity === "Critical"
    ).length,

  highActivities:
    activities.filter(
      (activity) =>
        activity.severity === "High"
    ).length,

  mediumActivities:
    activities.filter(
      (activity) =>
        activity.severity === "Medium"
    ).length,

  lowActivities:
    activities.filter(
      (activity) =>
        activity.severity === "Low"
    ).length,
});

module.exports = {
  buildActivityLogs,
  buildActivitySummary,
}; 