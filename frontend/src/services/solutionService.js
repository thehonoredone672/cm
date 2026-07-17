import api from "../api/axios";

export const getSolutionsForProblem = async (problemId) => {
  const response = await api.get("/solutions", { params: { problemId } });
  return response.data.data;
};

export const getSolutionById = async (id) => {
  const response = await api.get(`/solutions/${id}`);
  return response.data.data;
};

export const createSolution = async (data) => {
  const response = await api.post("/solutions", data);
  return response.data.data;
};

export const updateSolution = async (id, data) => {
  const response = await api.put(`/solutions/${id}`, data);
  return response.data.data;
};

export const deleteSolution = async (id) => {
  const response = await api.delete(`/solutions/${id}`);
  return response.data;
};

export const publishSolution = async (id) => {
  const response = await api.post(`/solutions/${id}/publish`);
  return response.data.data;
};

export const hideSolution = async (id) => {
  const response = await api.post(`/solutions/${id}/hide`);
  return response.data.data;
};
