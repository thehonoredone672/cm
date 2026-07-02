import api from "../api/axios";

export const getMatches = async () => {
  const res = await api.get("/matches");
  return res.data.data;
};