"use strict";

const {
  getPlatformStatistics,
  getSystemHealth,
  getAdminActivities,
  logAdminActivity
} = require("./admin-dashboard.service");

const checkAdminRole = (req, res) => {
  if (req.user.role !== "ADMIN") {
    res.status(403).json({ success: false, message: "Forbidden: Admin authorization required." });
    return false;
  }
  return true;
};

const getPlatformStatisticsHandler = async (req, res, next) => {
  try {
    if (!checkAdminRole(req, res)) return;
    const stats = await getPlatformStatistics();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

const getSystemHealthHandler = async (req, res, next) => {
  try {
    if (!checkAdminRole(req, res)) return;
    const health = await getSystemHealth();
    res.status(200).json({ success: true, data: health });
  } catch (err) {
    next(err);
  }
};

const getAdminActivitiesHandler = async (req, res, next) => {
  try {
    if (!checkAdminRole(req, res)) return;
    const { activities, pagination } = await getAdminActivities(req.query);
    res.status(200).json({ success: true, data: activities, pagination });
  } catch (err) {
    next(err);
  }
};

const logAdminActivityHandler = async (req, res, next) => {
  try {
    if (!checkAdminRole(req, res)) return;
    const { action, moduleName, status } = req.body;
    const log = await logAdminActivity(req.user.id, action, moduleName, status);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlatformStatisticsHandler,
  getSystemHealthHandler,
  getAdminActivitiesHandler,
  logAdminActivityHandler
};
