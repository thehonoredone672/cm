"use strict";

const {
  createContest,
  getAllContests,
  getContestById,
  updateContest,
  deleteContest,
  registerForContest,
  getContestLeaderboard,
  createContestAnnouncement,
  getContestAnnouncements
} = require("./contests.service");

const checkAdmin = (req, res) => {
  if (req.user.role !== "ADMIN") {
    res.status(403).json({ success: false, message: "Forbidden: Admin access only." });
    return false;
  }
  return true;
};

const createContestHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    const contest = await createContest(req.body);
    res.status(201).json({ success: true, data: contest });
  } catch (err) {
    next(err);
  }
};

const getContestsHandler = async (req, res, next) => {
  try {
    const contests = await getAllContests(req.query);
    res.status(200).json({ success: true, data: contests });
  } catch (err) {
    next(err);
  }
};

const getContestByIdHandler = async (req, res, next) => {
  try {
    const contest = await getContestById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: contest });
  } catch (err) {
    next(err);
  }
};

const updateContestHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    const contest = await updateContest(req.params.id, req.body);
    res.status(200).json({ success: true, data: contest });
  } catch (err) {
    next(err);
  }
};

const deleteContestHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    await deleteContest(req.params.id);
    res.status(200).json({ success: true, message: "Contest deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const registerForContestHandler = async (req, res, next) => {
  try {
    const registration = await registerForContest(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: registration });
  } catch (err) {
    next(err);
  }
};

const getContestLeaderboardHandler = async (req, res, next) => {
  try {
    const leaderboard = await getContestLeaderboard(req.params.id);
    res.status(200).json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
};

const createContestAnnouncementHandler = async (req, res, next) => {
  try {
    if (!checkAdmin(req, res)) return;
    const announcement = await createContestAnnouncement(req.params.id, req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};

const getContestAnnouncementsHandler = async (req, res, next) => {
  try {
    const announcements = await getContestAnnouncements(req.params.id);
    res.status(200).json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createContestHandler,
  getContestsHandler,
  getContestByIdHandler,
  updateContestHandler,
  deleteContestHandler,
  registerForContestHandler,
  getContestLeaderboardHandler,
  createContestAnnouncementHandler,
  getContestAnnouncementsHandler
};
