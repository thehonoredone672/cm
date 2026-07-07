const prisma = require("../../config/prisma");
const { executeCode } = require("./execution.service");

const runCodeHandler = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true }
    });

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const publicTestCases = problem.testCases.filter(tc => tc.isPublic);

    if (publicTestCases.length === 0) {
      return res.status(400).json({ success: false, message: "No public test cases found for this problem" });
    }

    const executionResult = await executeCode(code, language, publicTestCases);

    res.status(200).json({
      success: true,
      data: executionResult
    });
  } catch (err) {
    next(err);
  }
};

const submitCodeHandler = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true }
    });

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    if (problem.testCases.length === 0) {
      return res.status(400).json({ success: false, message: "No test cases found for this problem" });
    }

    const executionResult = await executeCode(code, language, problem.testCases);

    const totalTestCases = problem.testCases.length;
    const testCasesPassed = executionResult.results ? executionResult.results.filter(r => r.status === "ACCEPTED").length : 0;

    const submission = await prisma.submission.create({
      data: {
        problemId,
        userId: req.user.id,
        code,
        language,
        status: executionResult.status,
        errorMessage: executionResult.errorMessage,
        executionTime: executionResult.executionTime || null,
        memoryUsage: executionResult.memoryUsage || null,
        testCasesPassed,
        totalTestCases
      }
    });

    res.status(201).json({
      success: true,
      data: {
        submission,
        executionResult
      }
    });
  } catch (err) {
    next(err);
  }
};

const getProblemSubmissionsHandler = async (req, res, next) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        problemId: req.params.problemId,
        userId: req.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  runCodeHandler,
  submitCodeHandler,
  getProblemSubmissionsHandler
};
