"use strict";

const prisma = require("../../config/prisma");
const { executeCode, executeCustomCode } = require("./execution.service");

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

const runCustomTestCaseHandler = async (req, res, next) => {
  try {
    const { code, language, customInput } = req.body;
    if (!code || !language) {
      return res.status(400).json({ success: false, message: "code and language are required." });
    }

    const result = await executeCustomCode(code, language, customInput || "");

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

    if (executionResult.status === "ACCEPTED") {
      // Reverted without notifications
    }

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
    const { problemId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { 
      problemId,
      userId: req.user.id 
    };

    // Filters
    if (req.query.language) {
      where.language = req.query.language;
    }
    if (req.query.verdict) {
      where.status = req.query.verdict;
    }
    if (req.query.status) {
      if (req.query.status === "ACCEPTED_ONLY") {
        where.status = "ACCEPTED";
      } else if (req.query.status === "FAILED_ONLY") {
        where.status = { not: "ACCEPTED" };
      } else {
        where.status = req.query.status;
      }
    }

    // Search query matching Submission ID, language, or status
    if (req.query.search) {
      const searchStr = req.query.search.trim();
      where.OR = [
        { id: { contains: searchStr, mode: "insensitive" } },
        { language: { contains: searchStr, mode: "insensitive" } },
        { status: { contains: searchStr, mode: "insensitive" } }
      ];
    }

    let orderBy = { createdAt: "desc" };
    if (req.query.sort) {
      if (req.query.sort === "OLDEST") {
        orderBy = { createdAt: "asc" };
      } else if (req.query.sort === "NEWEST") {
        orderBy = { createdAt: "desc" };
      } else if (req.query.sort === "RUNTIME") {
        orderBy = { executionTime: "asc" };
      } else if (req.query.sort === "MEMORY") {
        orderBy = { memoryUsage: "asc" };
      }
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      prisma.submission.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

const getLatestSubmissionsHandler = async (req, res, next) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      include: {
        problem: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });
    return res.status(200).json({ success: true, data: submissions });
  } catch (err) {
    next(err);
  }
};

// ─── Draft handlers ─────────────────────────────────────────────────────────────

const getCodeDraftHandler = async (req, res, next) => {
  try {
    const { problemId, language } = req.query;
    if (!problemId || !language) {
      return res.status(400).json({ success: false, message: "problemId and language are required." });
    }
    const draft = await prisma.codeDraft.findUnique({
      where: {
        problemId_userId_language: {
          problemId,
          userId: req.user.id,
          language
        }
      }
    });
    return res.status(200).json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};

const saveCodeDraftHandler = async (req, res, next) => {
  try {
    const { problemId, language, code } = req.body;
    if (!problemId || !language || code === undefined) {
      return res.status(400).json({ success: false, message: "problemId, language and code are required." });
    }
    const draft = await prisma.codeDraft.upsert({
      where: {
        problemId_userId_language: {
          problemId,
          userId: req.user.id,
          language
        }
      },
      update: { code },
      create: { problemId, userId: req.user.id, language, code }
    });
    return res.status(200).json({ success: true, data: draft });
  } catch (err) {
    next(err);
  }
};

// ─── Settings handlers ──────────────────────────────────────────────────────────

const getEditorSettingsHandler = async (req, res, next) => {
  try {
    let settings = await prisma.editorSettings.findUnique({
      where: { userId: req.user.id }
    });
    if (!settings) {
      settings = await prisma.editorSettings.create({
        data: { userId: req.user.id }
      });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

const saveEditorSettingsHandler = async (req, res, next) => {
  try {
    const { theme, fontSize, wordWrap, minimap, autoSave } = req.body;
    const settings = await prisma.editorSettings.upsert({
      where: { userId: req.user.id },
      update: { theme, fontSize, wordWrap, minimap, autoSave },
      create: { userId: req.user.id, theme, fontSize, wordWrap, minimap, autoSave }
    });
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// ─── Language Preference handlers ──────────────────────────────────────────────

const getLanguagePreferenceHandler = async (req, res, next) => {
  try {
    const pref = await prisma.languagePreference.findUnique({
      where: { userId: req.user.id }
    });
    return res.status(200).json({ success: true, data: pref });
  } catch (err) {
    next(err);
  }
};

const saveLanguagePreferenceHandler = async (req, res, next) => {
  try {
    const { language } = req.body;
    if (!language) {
      return res.status(400).json({ success: false, message: "language is required." });
    }
    const pref = await prisma.languagePreference.upsert({
      where: { userId: req.user.id },
      update: { language },
      create: { userId: req.user.id, language }
    });
    return res.status(200).json({ success: true, data: pref });
  } catch (err) {
    next(err);
  }
};

// ─── Submission History & Statistics handlers ──────────────────────────────────

const getUserSubmissionsHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };

    if (req.query.problem) {
      where.problem = { title: { contains: req.query.problem, mode: "insensitive" } };
    }
    if (req.query.language) {
      where.language = req.query.language;
    }
    if (req.query.verdict) {
      where.status = req.query.verdict;
    }

    let orderBy = { createdAt: "desc" };
    if (req.query.sort) {
      if (req.query.sort === "OLDEST") {
        orderBy = { createdAt: "asc" };
      } else if (req.query.sort === "RUNTIME") {
        orderBy = { executionTime: "asc" };
      } else if (req.query.sort === "MEMORY") {
        orderBy = { memoryUsage: "asc" };
      } else if (req.query.sort === "SCORE") {
        orderBy = { testCasesPassed: "desc" };
      }
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: { problem: { select: { title: true, difficulty: true } } },
        orderBy,
        skip,
        take: limit
      }),
      prisma.submission.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

const getSubmissionDetailHandler = async (req, res, next) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { problem: { select: { title: true, difficulty: true, examples: true } } }
    });

    if (!submission) return res.status(404).json({ success: false, message: "Submission not found." });
    if (submission.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    return res.status(200).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

const getSubmissionsStatisticsHandler = async (req, res, next) => {
  try {
    const where = { userId: req.user.id };

    const total = await prisma.submission.count({ where });
    const accepted = await prisma.submission.count({
      where: { ...where, status: "ACCEPTED" }
    });

    const averageMetrics = await prisma.submission.aggregate({
      where,
      _avg: {
        executionTime: true,
        memoryUsage: true
      }
    });

    // Unique solved problems
    const solvedSubmissions = await prisma.submission.findMany({
      where: { ...where, status: "ACCEPTED" },
      select: { problemId: true }
    });
    const solvedCount = new Set(solvedSubmissions.map(s => s.problemId)).size;

    const rate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalSubmissions: total,
        acceptedSubmissions: accepted,
        acceptanceRate: rate,
        averageRuntime: averageMetrics._avg.executionTime ? Math.round(averageMetrics._avg.executionTime * 1000) : 0,
        averageMemory: averageMetrics._avg.memoryUsage ? Math.round(averageMetrics._avg.memoryUsage) : 0,
        solvedProblemsCount: solvedCount
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  runCodeHandler,
  runCustomTestCaseHandler,
  submitCodeHandler,
  getProblemSubmissionsHandler,
  getLatestSubmissionsHandler,
  getCodeDraftHandler,
  saveCodeDraftHandler,
  getEditorSettingsHandler,
  saveEditorSettingsHandler,
  getLanguagePreferenceHandler,
  saveLanguagePreferenceHandler,
  getUserSubmissionsHandler,
  getSubmissionDetailHandler,
  getSubmissionsStatisticsHandler
};
