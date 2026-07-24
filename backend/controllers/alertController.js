const resources = require("../data/resources");
const { scanResources } = require("../services/resourceScanner");
const { createAlertsFromResources } = require("../services/alertService");

const getAlerts = (req, res) => {
  const scannedResources = scanResources(resources);
  const alerts = createAlertsFromResources(scannedResources);

  const summary = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((alert) => alert.status === "Active").length,
    criticalAlerts: alerts.filter(
      (alert) => alert.severity === "Critical"
    ).length,
    highAlerts: alerts.filter((alert) => alert.severity === "High").length,
    mediumAlerts: alerts.filter(
      (alert) => alert.severity === "Medium"
    ).length,
    lowAlerts: alerts.filter((alert) => alert.severity === "Low").length,
  };

  res.status(200).json({
    summary,
    alerts,
  });
};

module.exports = {
  getAlerts,
};