const aiService = require("./ai.service");

const auditResumeHandler = async (req, res, next) => {
  try {
    const report = await aiService.auditResume(req.user.id);
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

const getTeamRecommendationHandler = async (req, res, next) => {
  try {
    const list = await aiService.getTeamRecommendation(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const explainCodeHandler = async (req, res, next) => {
  try {
    const result = await aiService.explainCode(req.body.code, req.body.language);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  auditResumeHandler,
  getTeamRecommendationHandler,
  explainCodeHandler
};
