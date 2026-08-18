const API_BASE_URL = "http://localhost:5000/api";

const handleResponse = async (response) => {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `CloudGuard API returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || `CloudGuard API request failed (${response.status}).`
    );
  }

  return data;
};

// =========================
// HEALTH
// =========================

export const getHealthStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};

// =========================
// AZURE RESOURCES
// =========================

export const getResources = async () => {
  const response = await fetch(`${API_BASE_URL}/azure/resources`);
  return handleResponse(response);
};

// =========================
// ALERTS
// =========================

export const getAlerts = async () => {
  const response = await fetch(`${API_BASE_URL}/alerts`);
  return handleResponse(response);
};

export const acknowledgeAlert = async (alertId) => {
  const response = await fetch(
    `${API_BASE_URL}/alerts/${encodeURIComponent(alertId)}/acknowledge`,
    {
      method: "PATCH",
    }
  );

  return handleResponse(response);
};

export const resolveAlert = async (alertId, resolutionNote) => {
  const response = await fetch(
    `${API_BASE_URL}/alerts/${encodeURIComponent(alertId)}/resolve`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resolutionNote,
      }),
    }
  );

  return handleResponse(response);
};

// =========================
// INCIDENTS
// =========================

export const getIncidents = async () => {
  const response = await fetch(`${API_BASE_URL}/incidents`);
  return handleResponse(response);
};

export const createIncident = async (incidentData) => {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incidentData),
  });

  return handleResponse(response);
};

export const updateIncidentStatus = async (
  incidentId,
  status,
  note = ""
) => {
  const response = await fetch(
    `${API_BASE_URL}/incidents/${encodeURIComponent(incidentId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        note,
      }),
    }
  );

  return handleResponse(response);
};

// =========================
// ACTIVITY LOGS
// =========================

export const getActivities = async () => {
  const response = await fetch(`${API_BASE_URL}/activity`);
  return handleResponse(response);
};

// =========================
// REPORTS
// =========================

export const getSecurityReport = async () => {
  const response = await fetch(`${API_BASE_URL}/reports`);
  return handleResponse(response);
};

export const downloadFindingsCsv = async () => {
  const response = await fetch(
    `${API_BASE_URL}/reports/findings.csv`
  );

  if (!response.ok) {
    throw new Error("Unable to download findings report.");
  }

  const csvBlob = await response.blob();
  const downloadUrl = URL.createObjectURL(csvBlob);

  const anchor = document.createElement("a");

  anchor.href = downloadUrl;
  anchor.download = "cloudguard-findings-report.csv";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(downloadUrl);
};