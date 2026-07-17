import api from "../api/axios";

export const getProblems = async (params = {}) => {
  const response = await api.get("/problems", { params });
  return response.data;
};

export const getProblemDetails = async (id) => {
  const response = await api.get(`/problems/${id}`);
  return response.data.data;
};

export const createProblem = async (data) => {
  const response = await api.post("/problems", data);
  return response.data.data;
};

export const updateProblem = async (id, data) => {
  const response = await api.put(`/problems/${id}`, data);
  return response.data.data;
};

export const deleteProblem = async (id) => {
  const response = await api.delete(`/problems/${id}`);
  return response.data;
};

export const getProblemsStatistics = async () => {
  const response = await api.get("/problems/statistics");
  return response.data.data;
};

export const toggleBookmark = async (id) => {
  const response = await api.post(`/problems/${id}/bookmark`);
  return response.data.data;
};

export const toggleLike = async (id, value) => {
  const response = await api.post(`/problems/${id}/like`, { value });
  return response.data.data;
};

export const getProblemDiscussions = async (id) => {
  const response = await api.get(`/problems/${id}/discussions`);
  return response.data.data;
};

export const createProblemDiscussion = async (id, title, content) => {
  const response = await api.post(`/problems/${id}/discussions`, { title, content });
  return response.data.data;
};

export const reportProblem = async (id, reason) => {
  const response = await api.post(`/problems/${id}/reports`, { reason });
  return response.data.data;
};

export const getProblemEditorial = async (id) => {
  const response = await api.get(`/problems/${id}/editorial`);
  return response.data.data;
};
