"use strict";

const {
  getSettingsProfile,
  updateSettingsProfile,
  getSettingsPreferences,
  updateSettingsPreferences,
  getSettingsPrivacy,
  updateSettingsPrivacy,
  getActiveSessions,
  terminateActiveSession,
  getLoginHistory,
  deleteUserAccount
} = require("./settings.service");

const getSettingsProfileHandler = async (req, res, next) => {
  try {
    const profile = await getSettingsProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const updateSettingsProfileHandler = async (req, res, next) => {
  try {
    const profile = await updateSettingsProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

const getSettingsPreferencesHandler = async (req, res, next) => {
  try {
    const prefs = await getSettingsPreferences(req.user.id);
    res.status(200).json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
};

const updateSettingsPreferencesHandler = async (req, res, next) => {
  try {
    const prefs = await updateSettingsPreferences(req.user.id, req.body);
    res.status(200).json({ success: true, data: prefs });
  } catch (err) {
    next(err);
  }
};

const getSettingsPrivacyHandler = async (req, res, next) => {
  try {
    const privacy = await getSettingsPrivacy(req.user.id);
    res.status(200).json({ success: true, data: privacy });
  } catch (err) {
    next(err);
  }
};

const updateSettingsPrivacyHandler = async (req, res, next) => {
  try {
    const privacy = await updateSettingsPrivacy(req.user.id, req.body);
    res.status(200).json({ success: true, data: privacy });
  } catch (err) {
    next(err);
  }
};

const getActiveSessionsHandler = async (req, res, next) => {
  try {
    const sessions = await getActiveSessions(req.user.id);
    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
};

const terminateActiveSessionHandler = async (req, res, next) => {
  try {
    const result = await terminateActiveSession(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getLoginHistoryHandler = async (req, res, next) => {
  try {
    const history = await getLoginHistory(req.user.id);
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

const deleteUserAccountHandler = async (req, res, next) => {
  try {
    await deleteUserAccount(req.user.id);
    res.status(200).json({ success: true, message: "Account successfully deleted." });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettingsProfileHandler,
  updateSettingsProfileHandler,
  getSettingsPreferencesHandler,
  updateSettingsPreferencesHandler,
  getSettingsPrivacyHandler,
  updateSettingsPrivacyHandler,
  getActiveSessionsHandler,
  terminateActiveSessionHandler,
  getLoginHistoryHandler,
  deleteUserAccountHandler
};
