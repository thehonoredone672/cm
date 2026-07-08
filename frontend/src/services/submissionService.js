import api from "../api/axios";

export const runCode = async (problemId, code, language) => {
  try {
    const response = await api.post("/submissions/run", { problemId, code, language });
    return response.data.data;
  } catch (err) {
    // Surface the real error message from the backend (or axios interceptor)
    const msg = err.userMessage || err.response?.data?.message || err.message || "Run failed. Check your network.";
    throw Object.assign(err, { displayMessage: msg });
  }
};

export const submitCode = async (problemId, code, language) => {
  try {
    const response = await api.post("/submissions/submit", { problemId, code, language });
    return response.data.data;
  } catch (err) {
    const msg = err.userMessage || err.response?.data?.message || err.message || "Submission failed. Check your network.";
    throw Object.assign(err, { displayMessage: msg });
  }
};

export const getSubmissions = async (problemId) => {
  try {
    const response = await api.get(`/submissions/problem/${problemId}`);
    return response.data.data;
  } catch (err) {
    const msg = err.userMessage || err.response?.data?.message || err.message || "Could not load submissions.";
    throw Object.assign(err, { displayMessage: msg });
  }
};

export const runCustomCode = async (code, language, customInput) => {
  try {
    const response = await api.post("/submissions/run-custom", { code, language, customInput });
    return response.data.data;
  } catch (err) {
    const msg = err.userMessage || err.response?.data?.message || err.message || "Custom run failed. Check your network.";
    throw Object.assign(err, { displayMessage: msg });
  }
};
