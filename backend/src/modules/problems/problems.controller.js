const {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} = require("./problems.service");

const createProblemHandler = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const problem = await createProblem(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
};

const getProblemsHandler = async (req, res, next) => {
  try {
    const problems = await getAllProblems();
    res.status(200).json({ success: true, data: problems });
  } catch (err) {
    next(err);
  }
};

const getProblemByIdHandler = async (req, res, next) => {
  try {
    const problem = await getProblemById(req.params.id, req.user.role);
    res.status(200).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
};

const updateProblemHandler = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const problem = await updateProblem(req.params.id, req.body);
    res.status(200).json({ success: true, data: problem });
  } catch (err) {
    next(err);
  }
};

const deleteProblemHandler = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await deleteProblem(req.params.id);
    res.status(200).json({ success: true, message: "Problem deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProblemHandler,
  getProblemsHandler,
  getProblemByIdHandler,
  updateProblemHandler,
  deleteProblemHandler,
};
