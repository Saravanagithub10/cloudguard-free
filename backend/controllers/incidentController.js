const incidents = require("../data/incidentStore");
const alerts = require("../data/alertStore");

const {
  synchronizeAzureAlerts,
} = require("../services/liveAlertService");

// ========================================
// INCIDENT SUMMARY
// ========================================

const buildIncidentSummary = () => ({
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

  criticalIncidents: incidents.filter(
    (incident) => incident.severity === "Critical"
  ).length,

  highIncidents: incidents.filter(
    (incident) => incident.severity === "High"
  ).length,

  mediumIncidents: incidents.filter(
    (incident) => incident.severity === "Medium"
  ).length,

  lowIncidents: incidents.filter(
    (incident) => incident.severity === "Low"
  ).length,
});

// ========================================
// GENERATE INCIDENT ID
// ========================================

const generateIncidentId = () => {
  const numbers = incidents
    .map((incident) => {
      const match = String(incident.id || "").match(
        /^INC-(\d+)$/
      );

      return match
        ? Number(match[1])
        : 0;
    })
    .filter(Number.isFinite);

  const highestNumber =
    numbers.length > 0
      ? Math.max(...numbers)
      : 0;

  return `INC-${String(
    highestNumber + 1
  ).padStart(3, "0")}`;
};

// ========================================
// GET ALL INCIDENTS
// ========================================

const getIncidents = (req, res) => {
  return res.status(200).json({
    summary: buildIncidentSummary(),
    incidents,
  });
};

// ========================================
// GET INCIDENT BY ID
// ========================================

const getIncidentById = (req, res) => {
  const incident = incidents.find(
    (item) =>
      item.id === req.params.id
  );

  if (!incident) {
    return res.status(404).json({
      message: "Incident not found.",
    });
  }

  return res.status(200).json(
    incident
  );
};

// ========================================
// CREATE INCIDENT FROM LIVE AZURE ALERT
// ========================================

const createIncident = async (
  req,
  res
) => {
  try {
    const {
      alertId,
      title,
      description,
      assignedTo,
      priority,
    } = req.body || {};

    if (!alertId) {
      return res.status(400).json({
        message:
          "Related alert ID is required.",
      });
    }

    // Refresh alerts from current Azure findings.
    await synchronizeAzureAlerts();

    const alert = alerts.find(
      (item) =>
        item.id === alertId
    );

    if (!alert) {
      return res.status(404).json({
        message:
          "Related Azure security alert not found.",
      });
    }

    // Prevent duplicate incident creation.
    const existingIncident =
      incidents.find(
        (incident) =>
          incident.alertId ===
          alertId
      );

    if (existingIncident) {
      return res.status(409).json({
        message:
          "An incident already exists for this alert.",

        incident:
          existingIncident,
      });
    }

    const cleanTitle =
      typeof title === "string"
        ? title.trim()
        : "";

    const cleanDescription =
      typeof description ===
      "string"
        ? description.trim()
        : "";

    const cleanAssignedTo =
      typeof assignedTo ===
      "string"
        ? assignedTo.trim()
        : "";

    if (!cleanTitle) {
      return res.status(400).json({
        message:
          "Incident title is required.",
      });
    }

    if (!cleanDescription) {
      return res.status(400).json({
        message:
          "Incident description is required.",
      });
    }

    if (!cleanAssignedTo) {
      return res.status(400).json({
        message:
          "Assigned analyst is required.",
      });
    }

    const allowedPriorities = [
      "Critical",
      "High",
      "Medium",
      "Low",
    ];

    const selectedPriority =
      allowedPriorities.includes(
        priority
      )
        ? priority
        : alert.severity;

    const timestamp =
      new Date().toISOString();

    const incident = {
      id: generateIncidentId(),

      alertId: alert.id,

      title: cleanTitle,

      description:
        cleanDescription,

      severity:
        alert.severity,

      priority:
        selectedPriority,

      status: "Open",

      assignedTo:
        cleanAssignedTo,

      // Azure resource information
      resourceId:
        alert.resourceId,

      resourceName:
        alert.resourceName,

      resourceType:
        alert.resourceType,

      azureType:
        alert.azureType,

      resourceGroup:
        alert.resourceGroup,

      region:
        alert.region,

      // Security finding information
      ruleId:
        alert.ruleId,

      riskPoints:
        alert.riskPoints,

      recommendation:
        alert.recommendation,

      source:
        alert.source ||
        "Azure Resource Graph",

      createdAt:
        timestamp,

      updatedAt:
        timestamp,

      resolvedAt:
        null,

      closedAt:
        null,

      resolutionNote:
        "",

      activity: [
        {
          action: "Created",

          message:
            `Incident created from live Azure alert ${alert.id}.`,

          timestamp,
        },
      ],
    };

    incidents.push(incident);

    return res.status(201).json({
      message:
        "Incident created successfully from Azure security alert.",

      incident,

      summary:
        buildIncidentSummary(),
    });
  } catch (error) {
    console.error(
      "Unable to create incident:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create incident from Azure security alert.",

      error:
        error.message,
    });
  }
};

// ========================================
// UPDATE INCIDENT STATUS
// ========================================

const updateIncidentStatus = (
  req,
  res
) => {
  const incident = incidents.find(
    (item) =>
      item.id === req.params.id
  );

  if (!incident) {
    return res.status(404).json({
      message:
        "Incident not found.",
    });
  }

  const allowedStatuses = [
    "Open",
    "In Progress",
    "Resolved",
    "Closed",
  ];

  const { status, note } =
    req.body || {};

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    return res.status(400).json({
      message:
        "Invalid incident status.",
    });
  }

  if (
    incident.status === "Closed"
  ) {
    return res.status(400).json({
      message:
        "Closed incidents cannot be modified.",
    });
  }

  if (
    status === "Resolved" &&
    incident.status !==
      "In Progress"
  ) {
    return res.status(400).json({
      message:
        "Incident must be in progress before it can be resolved.",
    });
  }

  if (
    status === "Closed" &&
    incident.status !==
      "Resolved"
  ) {
    return res.status(400).json({
      message:
        "Incident must be resolved before it can be closed.",
    });
  }

  const cleanNote =
    typeof note === "string"
      ? note.trim()
      : "";

  if (
    (status === "Resolved" ||
      status === "Closed") &&
    !cleanNote
  ) {
    return res.status(400).json({
      message:
        "A status note is required.",
    });
  }

  const timestamp =
    new Date().toISOString();

  incident.status = status;
  incident.updatedAt = timestamp;

  if (
    status === "Resolved"
  ) {
    incident.resolvedAt =
      timestamp;

    incident.resolutionNote =
      cleanNote;
  }

  if (status === "Closed") {
    incident.closedAt =
      timestamp;
  }

  if (
    !Array.isArray(
      incident.activity
    )
  ) {
    incident.activity = [];
  }

  incident.activity.push({
    action: status,

    message:
      cleanNote ||
      `Incident status changed to ${status}.`,

    timestamp,
  });

  return res.status(200).json({
    message:
      `Incident updated to ${status}.`,

    incident,

    summary:
      buildIncidentSummary(),
  });
};

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
};