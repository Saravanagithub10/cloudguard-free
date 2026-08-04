const alerts = require("../data/alertStore");

const buildAlertSummary = () => ({
  totalAlerts: alerts.length,

  activeAlerts: alerts.filter((alert) => alert.status === "Active").length,

  acknowledgedAlerts: alerts.filter(
    (alert) => alert.status === "Acknowledged"
  ).length,

  resolvedAlerts: alerts.filter((alert) => alert.status === "Resolved").length,

  criticalAlerts: alerts.filter(
    (alert) => alert.severity === "Critical"
  ).length,

  highAlerts: alerts.filter((alert) => alert.severity === "High").length,

  mediumAlerts: alerts.filter(
    (alert) => alert.severity === "Medium"
  ).length,

  lowAlerts: alerts.filter((alert) => alert.severity === "Low").length,
});

const getAlerts = (req, res) => {
  res.status(200).json({
    summary: buildAlertSummary(),
    alerts,
  });
};

const getAlertById = (req, res) => {
  const alert = alerts.find((item) => item.id === req.params.id);

  if (!alert) {
    return res.status(404).json({
      message: "Alert not found.",
    });
  }

  return res.status(200).json(alert);
};

const acknowledgeAlert = (req, res) => {
  const alert = alerts.find((item) => item.id === req.params.id);

  if (!alert) {
    return res.status(404).json({
      message: "Alert not found.",
    });
  }

  if (alert.status === "Resolved") {
    return res.status(400).json({
      message: "Resolved alerts cannot be acknowledged.",
    });
  }

  if (alert.status === "Acknowledged") {
    return res.status(400).json({
      message: "Alert is already acknowledged.",
    });
  }

  const timestamp = new Date().toISOString();

  alert.status = "Acknowledged";
  alert.acknowledgedAt = timestamp;

  alert.activity.push({
    action: "Acknowledged",
    message: "Alert acknowledged for investigation.",
    timestamp,
  });

  return res.status(200).json({
    message: "Alert acknowledged successfully.",
    alert,
    summary: buildAlertSummary(),
  });
};

const resolveAlert = (req, res) => {
  const alert = alerts.find((item) => item.id === req.params.id);

  if (!alert) {
    return res.status(404).json({
      message: "Alert not found.",
    });
  }

  if (alert.status === "Resolved") {
    return res.status(400).json({
      message: "Alert is already resolved.",
    });
  }
  if (alert.status !== "Acknowledged") {
  return res.status(400).json({
    message: "Alert must be acknowledged before it can be resolved.",
  });
}

  const resolutionNote =
  typeof req.body?.resolutionNote === "string"
    ? req.body.resolutionNote.trim()
    : "";

  if (!resolutionNote) {
    return res.status(400).json({
      message: "Resolution note is required.",
    });
  }

  const timestamp = new Date().toISOString();

  alert.status = "Resolved";
  alert.resolvedAt = timestamp;
  alert.resolutionNote = resolutionNote;

  alert.activity.push({
    action: "Resolved",
    message: resolutionNote,
    timestamp,
  });

  return res.status(200).json({
    message: "Alert resolved successfully.",
    alert,
    summary: buildAlertSummary(),
  });
};

module.exports = {
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  resolveAlert,
};