import api from "../api/axios";

export const getNotifications = async (params = {}) => {
  const response = await api.get("/notifications", { params });
  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch("/notifications/read");
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data.data;
};

export const deleteAllNotifications = async () => {
  const response = await api.delete("/notifications");
  return response.data;
};

export const getNotificationPreferences = async () => {
  const response = await api.get("/notifications/preferences");
  return response.data.data;
};

export const updateNotificationPreferences = async (data) => {
  const response = await api.put("/notifications/preferences", data);
  return response.data.data;
};
