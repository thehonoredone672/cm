const eventsService = require("./events.service");

const getEventsHandler = async (req, res, next) => {
  try {
    const list = await eventsService.getEvents(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const createEventHandler = async (req, res, next) => {
  try {
    const event = await eventsService.createEvent(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const registerForEventHandler = async (req, res, next) => {
  try {
    const reg = await eventsService.registerForEvent(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: reg });
  } catch (err) {
    next(err);
  }
};

const markAttendanceHandler = async (req, res, next) => {
  try {
    const cert = await eventsService.trackAttendanceAndIssueCertificate(req.params.id, req.body.userId);
    res.status(200).json({ success: true, message: "Attendance verified, certificate issued.", data: cert });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEventsHandler,
  createEventHandler,
  registerForEventHandler,
  markAttendanceHandler
};
