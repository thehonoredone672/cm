import api from "../api/axios";

export const getProjects = async (userId = null) => {
  const url = userId ? `/projects?userId=${userId}` : "/projects";
  const response = await api.get(url);
  return response.data.data;
};

export const createProject = async (data) => {
  const response = await api.post("/projects", data);
  return response.data.data;
};

export const updateProject = async (id, data) => {
  const response = await api.put(`/projects/${id}`, data);
  return response.data.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};
