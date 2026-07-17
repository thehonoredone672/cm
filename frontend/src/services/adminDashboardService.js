import api from "../api/axios";

export const getPlatformStatistics = async () => {
  const response = await api.get("/admin-dashboard/stats");
  return response.data.data;
};

export const getSystemHealth = async () => {
  const response = await api.get("/admin-dashboard/health");
  return response.data.data;
};

export const getAdminActivities = async (params = {}) => {
  const response = await api.get("/admin-dashboard/activities", { params });
  return response.data;
};

export const logAdminActivity = async (data) => {
  const response = await api.post("/admin-dashboard/activities", data);
  return response.data.data;
};
