import api from "../api/axios";

export const getAllSkills = async () => {
  const res = await api.get("/skills");
  return res.data.data;
};

export const getMySkills = async () => {
  const res = await api.get("/skills/user");
  return res.data.data;
};

export const addSkill = async (skillId) => {
  const res = await api.post("/skills/user", {
    skillId,
  });

  return res.data.data;
};

export const removeSkill = async (
  skillId
) => {
  await api.delete(
    `/skills/user/${skillId}`
  );
};