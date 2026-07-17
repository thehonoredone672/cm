import api from "../api/axios";

export const getContests = async () => {
  const response = await api.get("/contests");
  return response.data.data;
};

export const getContestDetails = async (id) => {
  const response = await api.get(`/contests/${id}`);
  return response.data.data;
};

export const registerForContest = async (id) => {
  const response = await api.post(`/contests/${id}/register`);
  return response.data.data;
};

export const getContestLeaderboard = async (id) => {
  const response = await api.get(`/contests/${id}/leaderboard`);
  return response.data.data;
};

export const getContestAnnouncements = async (id) => {
  const response = await api.get(`/contests/${id}/announcements`);
  return response.data.data;
};

export const createContestAnnouncement = async (id, data) => {
  const response = await api.post(`/contests/${id}/announcements`, data);
  return response.data.data;
};

export const createContest = async (data) => {
  const response = await api.post("/contests", data);
  return response.data.data;
};

export const updateContest = async (id, data) => {
  const response = await api.put(`/contests/${id}`, data);
  return response.data.data;
};

export const deleteContest = async (id) => {
  const response = await api.delete(`/contests/${id}`);
  return response.data;
};
