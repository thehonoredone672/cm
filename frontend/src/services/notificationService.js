import api from "../api/axios";

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.patch("/notifications/read");
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data.data;
};
