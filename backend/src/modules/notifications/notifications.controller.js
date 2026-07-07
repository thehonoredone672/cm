const {
  getNotificationsForUser,
  markAllRead,
  markRead,
} = require("./notifications.service");

const getNotificationsHandler = async (req, res, next) => {
  try {
    const notifs = await getNotificationsForUser(req.user.id);
    res.status(200).json({ success: true, data: notifs });
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

module.exports = {
  getNotificationsHandler,
  markAllReadHandler,
  markReadHandler,
};
