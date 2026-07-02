import api from "../api/axios";

export const getAllInterests = async () => {
  const res = await api.get("/interests");
  return res.data.data;
};

export const getMyInterests = async () => {
  const res = await api.get("/interests/user");
  return res.data.data;
};

export const addInterest = async (interestId) => {
  const res = await api.post("/interests/user", {
    interestId,
  });

  return res.data.data;
};

export const removeInterest = async (
  interestId
) => {
  await api.delete(
    `/interests/user/${interestId}`
  );
};