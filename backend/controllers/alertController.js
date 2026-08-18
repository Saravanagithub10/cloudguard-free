const alerts = require("../data/alertStore");

const {
  synchronizeAzureAlerts,
} = require("../services/liveAlertService");

const buildAlertSummary = () => ({
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
        alert.status === "Acknowledged"
    ).length,

  resolvedAlerts:
    alerts.filter(
      (alert) =>
        alert.status === "Resolved"
    ).length,

  criticalAlerts:
    alerts.filter(
      (alert) =>
        alert.severity === "Critical"
    ).length,

  highAlerts:
    alerts.filter(
      (alert) =>
        alert.severity === "High"
    ).length,

  mediumAlerts:
    alerts.filter(
      (alert) =>
        alert.severity === "Medium"
    ).length,

  lowAlerts:
    alerts.filter(
      (alert) =>
        alert.severity === "Low"
    ).length,
});

// ================================
// GET ALL LIVE AZURE ALERTS
// ================================

const getAlerts = async (req, res) => {
  try {
    await synchronizeAzureAlerts();

    return res.status(200).json({
      source:
        "Azure Resource Graph",

      summary:
        buildAlertSummary(),

      alerts,
    });
  } catch (error) {
    console.error(
      "Unable to synchronize Azure alerts:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve live Azure security alerts.",

      error:
        error.message,
    });
  }
};

// ================================
// GET ALERT BY ID
// ================================

const getAlertById = async (
  req,
  res
) => {
  try {
    await synchronizeAzureAlerts();

    const alert = alerts.find(
      (item) =>
        item.id === req.params.id
    );

    if (!alert) {
      return res.status(404).json({
        message:
          "Alert not found.",
      });
    }

    return res.status(200).json(
      alert
    );
  } catch (error) {
    console.error(
      "Unable to retrieve Azure alert:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve the Azure alert.",

      error:
        error.message,
    });
  }
};

// ================================
// ACKNOWLEDGE ALERT
// ================================

const acknowledgeAlert = async (
  req,
  res
) => {
  try {
    await synchronizeAzureAlerts();

    const alert = alerts.find(
      (item) =>
        item.id === req.params.id
    );

    if (!alert) {
      return res.status(404).json({
        message:
          "Alert not found.",
      });
    }

    if (
      alert.status === "Resolved"
    ) {
      return res.status(400).json({
        message:
          "Resolved alerts cannot be acknowledged.",
      });
    }

    if (
      alert.status ===
      "Acknowledged"
    ) {
      return res.status(400).json({
        message:
          "Alert is already acknowledged.",
      });
    }

    const timestamp =
      new Date().toISOString();

    alert.status =
      "Acknowledged";

    alert.acknowledgedAt =
      timestamp;

    if (
      !Array.isArray(
        alert.activity
      )
    ) {
      alert.activity = [];
    }

    alert.activity.push({
      action:
        "Acknowledged",

      message:
        "Alert acknowledged for investigation.",

      timestamp,
    });

    return res.status(200).json({
      message:
        "Alert acknowledged successfully.",

      alert,

      summary:
        buildAlertSummary(),
    });
  } catch (error) {
    console.error(
      "Unable to acknowledge Azure alert:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to acknowledge the Azure alert.",

      error:
        error.message,
    });
  }
};

// ================================
// RESOLVE ALERT
// ================================

const resolveAlert = async (
  req,
  res
) => {
  try {
    await synchronizeAzureAlerts();

    const alert = alerts.find(
      (item) =>
        item.id === req.params.id
    );

    if (!alert) {
      return res.status(404).json({
        message:
          "Alert not found.",
      });
    }

    if (
      alert.status === "Resolved"
    ) {
      return res.status(400).json({
        message:
          "Alert is already resolved.",
      });
    }

    if (
      alert.status !==
      "Acknowledged"
    ) {
      return res.status(400).json({
        message:
          "Alert must be acknowledged before it can be resolved.",
      });
    }

    const resolutionNote =
      typeof req.body
        ?.resolutionNote ===
      "string"
        ? req.body.resolutionNote.trim()
        : "";

    if (!resolutionNote) {
      return res.status(400).json({
        message:
          "Resolution note is required.",
      });
    }

    const timestamp =
      new Date().toISOString();

    alert.status =
      "Resolved";

    alert.resolvedAt =
      timestamp;

    alert.resolutionNote =
      resolutionNote;

    if (
      !Array.isArray(
        alert.activity
      )
    ) {
      alert.activity = [];
    }

    alert.activity.push({
      action:
        "Resolved",

      message:
        resolutionNote,

      timestamp,
    });

    return res.status(200).json({
      message:
        "Alert resolved successfully.",

      alert,

      summary:
        buildAlertSummary(),
    });
  } catch (error) {
    console.error(
      "Unable to resolve Azure alert:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to resolve the Azure alert.",

      error:
        error.message,
    });
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  resolveAlert,
};