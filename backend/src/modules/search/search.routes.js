const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const {
  performSearchHandler,
  getSearchSuggestionsHandler,
  getSearchHistoryHandler,
  deleteSearchHistoryItemHandler,
  clearAllSearchHistoryHandler,
  getTrendingSearchesHandler
} = require("./search.controller");

const router = express.Router();

router.get("/", protect, performSearchHandler);
router.get("/suggestions", protect, getSearchSuggestionsHandler);
router.get("/history", protect, getSearchHistoryHandler);
router.delete("/history/:id", protect, deleteSearchHistoryItemHandler);
router.delete("/history", protect, clearAllSearchHistoryHandler);
router.get("/trending", protect, getTrendingSearchesHandler);

module.exports = router;
