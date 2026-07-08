import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s — executions can take time
});

// ── Request: attach auth token ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: normalize errors so callers always get a useful message ─────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response at all)
    if (!error.response) {
      error.userMessage =
        "Cannot reach the server. Make sure the backend is running on port 5000.";
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 401 — token expired or missing
    if (status === 401) {
      // Only clear session if we're not on the login page already
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      error.userMessage = data?.message || "Session expired. Please log in again.";
      return Promise.reject(error);
    }

    // All other HTTP errors — surface the backend message
    error.userMessage =
      data?.message ||
      data?.error ||
      `Server error (${status})`;

    return Promise.reject(error);
  }
);

export default api;