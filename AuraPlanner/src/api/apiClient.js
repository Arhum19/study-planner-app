const API_BASE_URL = "http://localhost:5000/api";

class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "APIError";
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new APIError(error.error || "Request failed", response.status);
  }
  return response.json();
}

export const apiClient = {
  async checkStatus() {
    const response = await fetch(`${API_BASE_URL}/status`);
    return handleResponse(response);
  },

  async generatePlan(planData) {
    const response = await fetch(`${API_BASE_URL}/generate-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    });
    return handleResponse(response);
  },

  async getPlan() {
    const response = await fetch(`${API_BASE_URL}/plan`);
    return handleResponse(response);
  },

  async savePlan(plan) {
    const response = await fetch(`${API_BASE_URL}/save-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plan),
    });
    return handleResponse(response);
  },
};

export default apiClient;
