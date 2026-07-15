import api from "../api/axios";

export const createTeam = async (data) => {
  const response = await api.post("/teams", data);
  return response.data.data;
};

export const getTeams = async () => {
  const response = await api.get("/teams");
  return response.data.data;
};

export const getTeamDetails = async (id) => {
  const response = await api.get(`/teams/${id}`);
  return response.data.data;
};

export const joinTeam = async (joinCode) => {
  const response = await api.post("/teams/join", { joinCode });
  return response.data.data;
};

export const leaveTeam = async (id) => {
  const response = await api.post(`/teams/${id}/leave`);
  return response.data;
};

export const removeMember = async (teamId, userId) => {
  const response = await api.post(`/teams/${teamId}/remove/${userId}`);
  return response.data;
};

export const updateTeam = async (teamId, data) => {
  const response = await api.put(`/teams/${teamId}`, data);
  return response.data.data;
};

export const updateMemberRole = async (teamId, userId, role) => {
  const response = await api.put(`/teams/${teamId}/members/${userId}/role`, { role });
  return response.data.data;
};

export const inviteToTeamByEmail = async (teamId, email) => {
  const response = await api.post(`/teams/${teamId}/invite`, { email });
  return response.data;
};

export const getAllTeams = async () => {
  const response = await api.get("/teams/all");
  return response.data.data;
};

export const deleteTeam = async (id) => {
  const response = await api.delete(`/teams/${id}`);
  return response.data;
};

export const transferOwnership = async (id, newLeaderId) => {
  const response = await api.post(`/teams/${id}/transfer`, { newLeaderId });
  return response.data.data;
};

export const toggleRecruitment = async (id, isRecruiting) => {
  const response = await api.post(`/teams/${id}/recruitment`, { isRecruiting });
  return response.data.data;
};

export const createTeamAnnouncement = async (teamId, data) => {
  const response = await api.post(`/teams/${teamId}/announcements`, data);
  return response.data.data;
};

export const deleteTeamAnnouncement = async (teamId, announcementId) => {
  const response = await api.delete(`/teams/${teamId}/announcements/${announcementId}`);
  return response.data;
};

export const createTeamTask = async (teamId, data) => {
  const response = await api.post(`/teams/${teamId}/tasks`, data);
  return response.data.data;
};

export const updateTeamTask = async (teamId, taskId, data) => {
  const response = await api.put(`/teams/${teamId}/tasks/${taskId}`, data);
  return response.data.data;
};

export const deleteTeamTask = async (teamId, taskId) => {
  const response = await api.delete(`/teams/${teamId}/tasks/${taskId}`);
  return response.data;
};

export const createTeamFile = async (teamId, data) => {
  const response = await api.post(`/teams/${teamId}/files`, data);
  return response.data.data;
};

export const deleteTeamFile = async (teamId, fileId) => {
  const response = await api.delete(`/teams/${teamId}/files/${fileId}`);
  return response.data;
};

export const createTeamResource = async (teamId, data) => {
  const response = await api.post(`/teams/${teamId}/resources`, data);
  return response.data.data;
};

export const deleteTeamResource = async (teamId, resourceId) => {
  const response = await api.delete(`/teams/${teamId}/resources/${resourceId}`);
  return response.data;
};
