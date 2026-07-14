import api from "../api/axios";

export const getAllSkills = async () => {
  const res = await api.get("/skills");
  return res.data.data;
};

export const getMySkills = async () => {
  const res = await api.get("/skills/user");
  return res.data.data;
};

export const addSkill = async (skillId, proficiency = "INTERMEDIATE", yearsOfExperience = 0) => {
  const res = await api.post("/skills/user", {
    skillId,
    proficiency,
    yearsOfExperience
  });
  return res.data.data;
};

export const updateSkill = async (skillId, proficiency, yearsOfExperience) => {
  const res = await api.patch(`/skills/user/${skillId}`, {
    proficiency,
    yearsOfExperience
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