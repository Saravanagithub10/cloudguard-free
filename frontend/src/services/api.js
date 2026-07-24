const API_BASE_URL = "http://localhost:5000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error("CloudGuard API request failed");
  }

  return response.json();
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