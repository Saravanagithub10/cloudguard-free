const resources = require("./resources");
const { scanResources } = require("../services/resourceScanner");
const { createAlertsFromResources } = require("../services/alertService");

const scannedResources = scanResources(resources);

const alerts = [];

module.exports = alerts;

