const alerts = require("../data/alertStore");
const incidents = require("../data/incidentStore");

const buildActivityLogs = () => {
  const alertActivities = alerts.flatMap((alert) =>
    (Array.isArray(alert.activity) ? alert.activity : []).map(
      (activity, index) => ({
        id: `ACT-ALERT-${alert.id}-${index + 1}`,
        entityType: "Alert",
        entityId: alert.id,
        action: activity.action,
        message: activity.message,
        timestamp: activity.timestamp,

        severity: alert.severity,
        status: alert.status,

        resourceId: alert.resourceId,
        resourceName: alert.resourceName,
        resourceType: alert.resourceType,
        resourceGroup: alert.resourceGroup,
      })
    )
  );

  const incidentActivities = incidents.flatMap((incident) =>
    (Array.isArray(incident.activity) ? incident.activity : []).map(
      (activity, index) => ({
        id: `ACT-INCIDENT-${incident.id}-${index + 1}`,
        entityType: "Incident",
        entityId: incident.id,
        action: activity.action,
        message: activity.message,
        timestamp: activity.timestamp,

        severity: incident.severity,
        status: incident.status,

        resourceId: incident.resourceId,
        resourceName: incident.resourceName,
        resourceType: incident.resourceType,
        resourceGroup: incident.resourceGroup,

        assignedTo: incident.assignedTo,
      })
    )
  );

  return [...alertActivities, ...incidentActivities].sort(
    (firstActivity, secondActivity) =>
      new Date(secondActivity.timestamp) -
      new Date(firstActivity.timestamp)
  );
};

const buildActivitySummary = (activities) => ({
  totalActivities: activities.length,

  alertActivities: activities.filter(
    (activity) => activity.entityType === "Alert"
  ).length,

  incidentActivities: activities.filter(
    (activity) => activity.entityType === "Incident"
  ).length,

  createdActivities: activities.filter(
    (activity) => activity.action === "Created"
  ).length,

  resolvedActivities: activities.filter(
    (activity) => activity.action === "Resolved"
  ).length,

  closedActivities: activities.filter(
    (activity) => activity.action === "Closed"
  ).length,
});

module.exports = {
  buildActivityLogs,
  buildActivitySummary,
};