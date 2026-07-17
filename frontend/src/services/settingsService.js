import api from "../api/axios";

export const getSettingsProfile = async () => {
  const response = await api.get("/settings/profile");
  return response.data.data;
};

export const updateSettingsProfile = async (data) => {
  const response = await api.put("/settings/profile", data);
  return response.data.data;
};

export const getSettingsPreferences = async () => {
  const response = await api.get("/settings/preferences");
  return response.data.data;
};

export const updateSettingsPreferences = async (data) => {
  const response = await api.put("/settings/preferences", data);
  return response.data.data;
};

export const getSettingsPrivacy = async () => {
  const response = await api.get("/settings/privacy");
  return response.data.data;
};

export const updateSettingsPrivacy = async (data) => {
  const response = await api.put("/settings/privacy", data);
  return response.data.data;
};

export const getActiveSessions = async () => {
  const response = await api.get("/settings/sessions");
  return response.data.data;
};

export const terminateActiveSession = async (id) => {
  const response = await api.delete(`/settings/sessions/${id}`);
  return response.data.data;
};

export const getLoginHistory = async () => {
  const response = await api.get("/settings/login-history");
  return response.data.data;
};

export const deleteUserAccount = async () => {
  const response = await api.delete("/settings/danger/delete");
  return response.data;
};
