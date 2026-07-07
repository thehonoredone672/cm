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
