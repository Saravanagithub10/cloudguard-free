const incidents = require("../data/incidentStore");
const alerts = require("../data/alertStore");

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
});

const getIncidents = (req, res) => {
  return res.status(200).json({
    summary: buildIncidentSummary(),
    incidents,
  });
};

const getIncidentById = (req, res) => {
  const incident = incidents.find(
    (item) => item.id === req.params.id
  );

  if (!incident) {
    return res.status(404).json({
      message: "Incident not found.",
    });
  }

  return res.status(200).json(incident);
};

const createIncident = (req, res) => {
  const {
    alertId,
    title,
    description,
    assignedTo,
    priority,
  } = req.body || {};

  const alert = alerts.find((item) => item.id === alertId);

  if (!alert) {
    return res.status(404).json({
      message: "Related alert not found.",
    });
  }

  const existingIncident = incidents.find(
    (incident) => incident.alertId === alertId
  );

  if (existingIncident) {
    return res.status(409).json({
      message: "An incident already exists for this alert.",
    });
  }

  const cleanTitle =
    typeof title === "string" ? title.trim() : "";

  const cleanDescription =
    typeof description === "string"
      ? description.trim()
      : "";

  const cleanAssignedTo =
    typeof assignedTo === "string"
      ? assignedTo.trim()
      : "";

  if (!cleanTitle) {
    return res.status(400).json({
      message: "Incident title is required.",
    });
  }

  if (!cleanDescription) {
    return res.status(400).json({
      message: "Incident description is required.",
    });
  }

  if (!cleanAssignedTo) {
    return res.status(400).json({
      message: "Assigned analyst is required.",
    });
  }

  const timestamp = new Date().toISOString();

  const incident = {
    id: `INC-${String(incidents.length + 1).padStart(3, "0")}`,
    alertId: alert.id,
    title: cleanTitle,
    description: cleanDescription,
    severity: alert.severity,
    priority: priority || alert.severity,
    status: "Open",
    assignedTo: cleanAssignedTo,

    resourceId: alert.resourceId,
    resourceName: alert.resourceName,
    resourceType: alert.resourceType,
    resourceGroup: alert.resourceGroup,

    recommendation: alert.recommendation,

    createdAt: timestamp,
    updatedAt: timestamp,
    resolvedAt: null,
    closedAt: null,
    resolutionNote: "",

    activity: [
      {
        action: "Created",
        message: `Incident created from alert ${alert.id}.`,
        timestamp,
      },
    ],
  };

  incidents.push(incident);

  return res.status(201).json({
    message: "Incident created successfully.",
    incident,
    summary: buildIncidentSummary(),
  });
};

const updateIncidentStatus = (req, res) => {
  const incident = incidents.find(
    (item) => item.id === req.params.id
  );

  if (!incident) {
    return res.status(404).json({
      message: "Incident not found.",
    });
  }

  const allowedStatuses = [
    "Open",
    "In Progress",
    "Resolved",
    "Closed",
  ];

  const { status, note } = req.body || {};

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid incident status.",
    });
  }

  if (
    status === "Resolved" &&
    incident.status !== "In Progress"
  ) {
    return res.status(400).json({
      message:
        "Incident must be in progress before it can be resolved.",
    });
  }

  if (
    status === "Closed" &&
    incident.status !== "Resolved"
  ) {
    return res.status(400).json({
      message:
        "Incident must be resolved before it can be closed.",
    });
  }

  const cleanNote =
    typeof note === "string" ? note.trim() : "";

  if (
    (status === "Resolved" || status === "Closed") &&
    !cleanNote
  ) {
    return res.status(400).json({
      message: "A status note is required.",
    });
  }

  const timestamp = new Date().toISOString();

  incident.status = status;
  incident.updatedAt = timestamp;

  if (status === "Resolved") {
    incident.resolvedAt = timestamp;
    incident.resolutionNote = cleanNote;
  }

  if (status === "Closed") {
    incident.closedAt = timestamp;
  }

  incident.activity.push({
    action: status,
    message:
      cleanNote ||
      `Incident status changed to ${status}.`,
    timestamp,
  });

  return res.status(200).json({
    message: `Incident updated to ${status}.`,
    incident,
    summary: buildIncidentSummary(),
  });
};

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncidentStatus,
};