import api from "../api/axios";

export const getGlobalLeaderboard = async (params = {}) => {
  const response = await api.get("/leaderboard", { params });
  return response.data;
};

export const getUserProfileStatistics = async () => {
  const response = await api.get("/leaderboard/stats");
  return response.data.data;
};

export const syncUserXP = async () => {
  const response = await api.post("/leaderboard/sync");
  return response.data.data;
};
