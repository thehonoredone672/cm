const mentorsService = require("./mentors.service");

const getMentorsHandler = async (req, res, next) => {
  try {
    const list = await mentorsService.getMentors();
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const registerAsMentorHandler = async (req, res, next) => {
  try {
    const mentor = await mentorsService.registerAsMentor(req.user.id, req.body);
    res.status(201).json({ success: true, data: mentor });
  } catch (err) {
    next(err);
  }
};

const bookSessionHandler = async (req, res, next) => {
  try {
    const booking = await mentorsService.bookSession(req.params.id, req.user.id, req.body.scheduledAt);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

const submitSessionFeedbackHandler = async (req, res, next) => {
  try {
    const booking = await mentorsService.submitSessionFeedback(req.params.id, req.body.rating, req.body.feedback);
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMentorsHandler,
  registerAsMentorHandler,
  bookSessionHandler,
  submitSessionFeedbackHandler
};
