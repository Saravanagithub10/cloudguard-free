const API_BASE_URL = "http://localhost:5000/api";

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "CloudGuard API request failed.");
  }

  return data;
};

export const getHealthStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};

export const getResources = async () => {
  const response = await fetch(`${API_BASE_URL}/resources`);
  return handleResponse(response);
};

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