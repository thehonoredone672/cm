import api from "../api/axios";

export const performSearch = async (queryText, filters = {}) => {
  const params = { q: queryText, ...filters };
  const response = await api.get("/search", { params });
  return response.data.data;
};

export const getSearchSuggestions = async (queryText) => {
  const response = await api.get("/search/suggestions", { params: { q: queryText } });
  return response.data.data;
};

export const getSearchHistory = async () => {
  const response = await api.get("/search/history");
  return response.data.data;
};

export const deleteSearchHistoryItem = async (id) => {
  const response = await api.delete(`/search/history/${id}`);
  return response.data.data;
};

export const clearAllSearchHistory = async () => {
  const response = await api.delete("/search/history");
  return response.data;
};

export const getTrendingSearches = async () => {
  const response = await api.get("/search/trending");
  return response.data.data;
};
