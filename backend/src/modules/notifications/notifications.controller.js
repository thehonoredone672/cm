"use strict";

const {
  getNotificationsForUser,
  markAllRead,
  markRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationPreferences,
  updateNotificationPreferences
} = require("./notifications.service");

const getNotificationsHandler = async (req, res, next) => {
  try {
    const { notifications, pagination } = await getNotificationsForUser(req.user.id, req.query);
    res.status(200).json({ success: true, data: notifications, pagination });
  } catch (err) {
    next(err);
  }
};

const markAllReadHandler = async (req, res, next) => {
  try {
    await markAllRead(req.user.id);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

const markReadHandler = async (req, res, next) => {
  try {
    const notif = await markRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
};

const deleteNotificationHandler = async (req, res, next) => {
  try {
    const result = await deleteNotification(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const deleteAllNotificationsHandler = async (req, res, next) => {
  try {
    await deleteAllNotifications(req.user.id);
    res.status(200).json({ success: true, message: "All notifications deleted" });
  } catch (err) {
    next(err);
  }
};

// ─── Preferences ────────────────────────────────────────────────────────────────

const getNotificationPreferencesHandler = async (req, res, next) => {
  try {
    const prefs = await getNotificationPreferences(req.user.id);
    res.status(200).json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
};

const updateNotificationPreferencesHandler = async (req, res, next) => {
  try {
    const prefs = await updateNotificationPreferences(req.user.id, req.body);
    res.status(200).json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotificationsHandler,
  markAllReadHandler,
  markReadHandler,
  deleteNotificationHandler,
  deleteAllNotificationsHandler,
  getNotificationPreferencesHandler,
  updateNotificationPreferencesHandler
};
