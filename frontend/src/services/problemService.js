import api from "../api/axios";

export const getProblems = async () => {
  const response = await api.get("/problems");
  return response.data.data;
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
