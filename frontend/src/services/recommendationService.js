import api from "../api/axios";

export const getRecommendedTeams = async () => {
  const response = await api.get("/recommendations/teams");
  return response.data.data;
};

export const getRecommendedProblems = async () => {
  const response = await api.get("/recommendations/problems");
  return response.data.data;
};
