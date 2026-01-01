// Change this URL to your deployed backend later
export const API_BASE_URL = "http://localhost:5000";

// =============================
// AUTH ENDPOINTS
// =============================
export const AUTH = {
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
  me: `${API_BASE_URL}/auth/me`,  // optional
};

// =============================
// DONOR ENDPOINTS
// =============================
export const DONOR = {
  donationHistory: (donorId: string) =>
    `${API_BASE_URL}/donor/history/${donorId}`,

  urgentRequests: `${API_BASE_URL}/donor/requests`,

  addDonation: `${API_BASE_URL}/donor/add`,
};

// =============================
// HOSPITAL ENDPOINTS
// =============================
export const HOSPITAL = {
  createRequest: `${API_BASE_URL}/request/add`,
  getRequests: `${API_BASE_URL}/request/all`,
};

// =============================
// RECIPIENT ENDPOINTS
// =============================
export const RECIPIENT = {
  getRequests: (recipientId: string) =>
    `${API_BASE_URL}/recipient/requests/${recipientId}`,

  requestStatus: (recipientId: string, requestId: string) =>
    `${API_BASE_URL}/recipient/requests/${recipientId}/${requestId}`,
};

// =============================
// REQUEST (General) ENDPOINTS
// =============================
export const REQUEST = {
  addRequest: `${API_BASE_URL}/request/add`,
  getAllRequests: `${API_BASE_URL}/request/all`,
};
