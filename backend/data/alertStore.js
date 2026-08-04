const resources = require("./resources");
const { scanResources } = require("../services/resourceScanner");
const { createAlertsFromResources } = require("../services/alertService");

const scannedResources = scanResources(resources);

const alerts = createAlertsFromResources(scannedResources).map((alert) => ({
  ...alert,
  status: "Active",
  acknowledgedAt: null,
  resolvedAt: null,
  resolutionNote: "",
  activity: [
    {
      action: "Created",
      message: "Alert generated from a detected security finding.",
      timestamp: alert.createdAt,
    },
  ],
}));

module.exports = alerts;