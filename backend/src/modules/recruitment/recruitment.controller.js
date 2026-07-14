const recruitmentService = require("./recruitment.service");

const registerCompanyHandler = async (req, res, next) => {
  try {
    const company = await recruitmentService.registerCompany(req.user.id, req.body);
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};

const createRecruitmentDriveHandler = async (req, res, next) => {
  try {
    const drive = await recruitmentService.createRecruitmentDrive(req.user.id, req.body);
    res.status(201).json({ success: true, data: drive });
  } catch (err) {
    next(err);
  }
};

const getRecruitmentDrivesHandler = async (req, res, next) => {
  try {
    const list = await recruitmentService.getRecruitmentDrives();
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

const applyToRecruitmentDriveHandler = async (req, res, next) => {
  try {
    const app = await recruitmentService.applyToRecruitmentDrive(req.params.id, req.user.id);
    res.status(201).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

const advanceCandidateStatusHandler = async (req, res, next) => {
  try {
    const app = await recruitmentService.advanceCandidateStatus(
      req.params.id,
      req.body.status,
      req.body.score,
      req.body.offerLetterUrl
    );
    res.status(200).json({ success: true, data: app });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerCompanyHandler,
  createRecruitmentDriveHandler,
  getRecruitmentDrivesHandler,
  applyToRecruitmentDriveHandler,
  advanceCandidateStatusHandler
};
