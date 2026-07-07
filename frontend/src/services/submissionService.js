import api from "../api/axios";

export const runCode = async (problemId, code, language) => {
  const response = await api.post("/submissions/run", { problemId, code, language });
  return response.data.data;
};

export const submitCode = async (problemId, code, language) => {
  const response = await api.post("/submissions/submit", { problemId, code, language });
  return response.data.data;
};

export const getSubmissions = async (problemId) => {
  const response = await api.get(`/submissions/problem/${problemId}`);
  return response.data.data;
};
