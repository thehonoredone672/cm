"use strict";

const prisma = require("../../config/prisma");
const { executeCode } = require("./execution.service");

const runCodeHandler = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) {
      return res.status(400).json({ success: false, message: "problemId, code and language are required." });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: { where: { isPublic: true } } },
    });

    if (!problem) return res.status(404).json({ success: false, message: "Problem not found." });
    if (!problem.testCases.length) return res.status(400).json({ success: false, message: "No public test cases for this problem." });

    const result = await executeCode(code, language, problem.testCases);

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const submitCodeHandler = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) {
      return res.status(400).json({ success: false, message: "problemId, code and language are required." });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: { testCases: true },
    });

    if (!problem) return res.status(404).json({ success: false, message: "Problem not found." });
    if (!problem.testCases.length) return res.status(400).json({ success: false, message: "No test cases for this problem." });

    const executionResult = await executeCode(code, language, problem.testCases);

    const testCasesPassed = executionResult.results
      ? executionResult.results.filter((r) => r.status === "ACCEPTED").length
      : 0;
    const totalTestCases = problem.testCases.length;

    const submission = await prisma.submission.create({
      data: {
        problemId,
        userId: req.user.id,
        code,
        language,
        status: executionResult.status,
        errorMessage: executionResult.errorMessage || null,
        executionTime: executionResult.executionTime || null,
        memoryUsage: executionResult.memoryUsage || null,
        testCasesPassed,
        totalTestCases,
      },
    });

    return res.status(201).json({
      success: true,
      data: { submission, executionResult },
    });
  } catch (err) {
    next(err);
  }
};

const getProblemSubmissionsHandler = async (req, res, next) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { problemId: req.params.problemId, userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
};

module.exports = { runCodeHandler, submitCodeHandler, getProblemSubmissionsHandler };
