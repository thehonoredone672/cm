import api from "../api/axios";

export const getAllInterests = async () => {
  const res = await api.get("/interests");
  return res.data.data;
};

export const getMyInterests = async () => {
  const res = await api.get("/interests/user");
  return res.data.data;
};

export const addInterest = async (interestId, matchingWeight = 1) => {
  const res = await api.post("/interests/user", {
    interestId,
    matchingWeight
  });
  return res.data.data;
};

export const updateInterest = async (interestId, matchingWeight) => {
  const res = await api.patch(`/interests/user/${interestId}`, {
    matchingWeight
  });
  return res.data.data;
};

export const createInterest = async (name, category) => {
  const res = await api.post("/interests", {
    name,
    category
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