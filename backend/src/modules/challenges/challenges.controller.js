const challengesService = require("./challenges.service");

const getDailyChallengeHandler = async (req, res, next) => {
  try {
    const problem = await challengesService.getDailyChallenge();
    if (!problem) {
      return res.status(404).json({ success: false, message: "No daily challenge found" });
    }
    res.status(200).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDailyChallengeHandler
};
