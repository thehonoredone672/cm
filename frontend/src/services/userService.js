import api from "../api/axios";

export async function getCurrentUser() {
  const response = await api.get("/users/profile");
  return response.data;
}

export async function updateCurrentUser(profileData) {
  const response = await api.patch("/users/me", profileData);
  return response.data;
}