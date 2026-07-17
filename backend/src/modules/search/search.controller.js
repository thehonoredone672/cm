"use strict";

const {
  performGlobalSearch,
  getSearchSuggestions,
  getSearchHistory,
  deleteSearchHistoryItem,
  clearAllSearchHistory,
  getTrendingSearches
} = require("./search.service");

const performSearchHandler = async (req, res, next) => {
  try {
    const { q, college, difficulty, contestStatus } = req.query;
    const filters = { college, difficulty, contestStatus };
    const results = await performGlobalSearch(req.user.id, q, filters);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

const getSearchSuggestionsHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    const suggestions = await getSearchSuggestions(q);
    res.status(200).json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
};

const getSearchHistoryHandler = async (req, res, next) => {
  try {
    const history = await getSearchHistory(req.user.id);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

const deleteSearchHistoryItemHandler = async (req, res, next) => {
  try {
    const result = await deleteSearchHistoryItem(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const clearAllSearchHistoryHandler = async (req, res, next) => {
  try {
    await clearAllSearchHistory(req.user.id);
    res.status(200).json({ success: true, message: "Search history cleared" });
  } catch (err) {
    next(err);
  }
};

const getTrendingSearchesHandler = async (req, res, next) => {
  try {
    const trending = await getTrendingSearches();
    res.status(200).json({ success: true, data: trending });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  performSearchHandler,
  getSearchSuggestionsHandler,
  getSearchHistoryHandler,
  deleteSearchHistoryItemHandler,
  clearAllSearchHistoryHandler,
  getTrendingSearchesHandler
};
