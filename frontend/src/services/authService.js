import api from "../api/axios";

export async function loginUser(credentials) {
  const response = await api.post("/auth/login", credentials);

  return response.data;
}

export async function registerUser(data) {
  const response = await api.post("/auth/register", data);

  return response.data;
}

export async function getProfile() {
  const response = await api.get("/users/profile");

  return response.data;
}