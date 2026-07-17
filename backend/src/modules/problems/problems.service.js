"use strict";

const prisma = require("../../config/prisma");

const createProblem = async (data) => {
  const { testCases, ...problemData } = data;
  return prisma.$transaction(async (tx) => {
    const problem = await tx.problem.create({
      data: {
        ...problemData,
        testCases: {
          create: testCases,
        },
      },
      include: {
        testCases: true,
      },
    });
    return problem;
  });
};

const getAllProblems = async (userRole, userId, query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {};
  if (userRole !== "ADMIN") {
    where.status = "PUBLISHED";
    where.visibility = "PUBLIC";
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { category: { contains: query.search, mode: "insensitive" } },
      { tags: { has: query.search } },
      { companies: { has: query.search } }
    ];
  }

  if (query.difficulty && query.difficulty !== "ALL") {
    where.difficulty = query.difficulty;
  }

  if (query.category && query.category !== "ALL") {
    where.category = query.category;
  }

  if (query.tag) {
    where.tags = { has: query.tag };
  }

  if (query.company) {
    where.companies = { has: query.company };
  }

  if (query.status && query.status !== "ALL") {
    if (query.status === "BOOKMARKED") {
      where.bookmarks = { some: { userId } };
    } else if (query.status === "SOLVED") {
      where.submissions = { some: { userId, status: "ACCEPTED" } };
    } else if (query.status === "ATTEMPTED") {
      where.submissions = { some: { userId } };
      where.NOT = {
        submissions: { some: { userId, status: "ACCEPTED" } }
      };
    } else if (query.status === "UNSOLVED") {
      where.NOT = {
        submissions: { some: { userId } }
      };
    }
  }

  const rawProblems = await prisma.problem.findMany({
    where,
    include: {
      bookmarks: true,
      likes: true,
      submissions: {
        select: {
          status: true,
          userId: true
        }
      }
    }
  });

  let problems = rawProblems.map((p) => {
    const totalSubs = p.submissions.length;
    const acceptedSubs = p.submissions.filter(s => s.status === "ACCEPTED").length;
    const acceptanceRate = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;
    
    const userSubs = p.submissions.filter(s => s.userId === userId);
    const isSolved = userSubs.some(s => s.status === "ACCEPTED");
    const isAttempted = !isSolved && userSubs.length > 0;
    const solveStatus = isSolved ? "SOLVED" : (isAttempted ? "ATTEMPTED" : "UNSOLVED");

    const isBookmarked = p.bookmarks.some(b => b.userId === userId);
    const userLikeRow = p.likes.find(l => l.userId === userId);
    const likeStatus = userLikeRow ? (userLikeRow.isLike ? 1 : -1) : 0;

    const likesCount = p.likes.filter(l => l.isLike).length;
    const dislikesCount = p.likes.filter(l => !l.isLike).length;

    const solvesCount = new Set(p.submissions.filter(s => s.status === "ACCEPTED").map(s => s.userId)).size;

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      category: p.category,
      difficulty: p.difficulty,
      tags: p.tags,
      companies: p.companies || [],
      status: p.status,
      visibility: p.visibility,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      solveStatus,
      isBookmarked,
      likeStatus,
      likesCount,
      dislikesCount,
      bookmarksCount: p.bookmarks.length,
      acceptanceRate,
      solvesCount
    };
  });

  if (query.sort) {
    if (query.sort === "NEWEST") {
      problems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (query.sort === "OLDEST") {
      problems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (query.sort === "DIFFICULTY") {
      const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
      problems.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    } else if (query.sort === "ACCEPTANCE") {
      problems.sort((a, b) => b.acceptanceRate - a.acceptanceRate);
    } else if (query.sort === "POPULARITY") {
      problems.sort((a, b) => b.likesCount - a.likesCount);
    } else if (query.sort === "ALPHABETICAL") {
      problems.sort((a, b) => a.title.localeCompare(b.title));
    }
  } else {
    problems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = problems.length;
  const paginatedProblems = problems.slice(skip, skip + limit);

  return {
    problems: paginatedProblems,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

const getProblemById = async (id, userRole, userId) => {
  const p = await prisma.problem.findUnique({
    where: { id },
    include: {
      testCases: true,
      bookmarks: true,
      likes: true,
      submissions: {
        select: {
          status: true,
          userId: true
        }
      },
      discussions: {
        take: 3,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: { user: { select: { id: true, name: true } } }
      },
      editorial: true
    },
  });

  if (!p) {
    throw new Error("Problem not found");
  }

  if (userRole !== "ADMIN") {
    if (p.status !== "PUBLISHED" || p.visibility !== "PUBLIC") {
      throw new Error("Problem not found");
    }
    p.testCases = p.testCases.filter((tc) => tc.isPublic);
  }

  // Dynamic statistics computations
  const totalSubs = p.submissions.length;
  const acceptedSubs = p.submissions.filter(s => s.status === "ACCEPTED").length;
  const acceptanceRate = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;
  
  const userSubs = p.submissions.filter(s => s.userId === userId);
  const isSolved = userSubs.some(s => s.status === "ACCEPTED");
  const isAttempted = !isSolved && userSubs.length > 0;
  const solveStatus = isSolved ? "SOLVED" : (isAttempted ? "ATTEMPTED" : "UNSOLVED");

  const isBookmarked = p.bookmarks.some(b => b.userId === userId);
  const userLikeRow = p.likes.find(l => l.userId === userId);
  const likeStatus = userLikeRow ? (userLikeRow.isLike ? 1 : -1) : 0;

  const likesCount = p.likes.filter(l => l.isLike).length;
  const dislikesCount = p.likes.filter(l => !l.isLike).length;

  const solvesCount = new Set(p.submissions.filter(s => s.status === "ACCEPTED").map(s => s.userId)).size;

  // Query related problems sharing same tags or difficulty
  const related = await prisma.problem.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      id: { not: id },
      OR: [
        { difficulty: p.difficulty },
        { category: p.category },
        { tags: { hasSome: p.tags } }
      ]
    },
    take: 5,
    select: {
      id: true,
      title: true,
      difficulty: true,
      category: true
    }
  });

  return {
    ...p,
    solveStatus,
    isBookmarked,
    likeStatus,
    likesCount,
    dislikesCount,
    bookmarksCount: p.bookmarks.length,
    acceptanceRate,
    solvesCount,
    attemptsCount: totalSubs,
    relatedProblems: related
  };
};

const updateProblem = async (id, data) => {
  const { testCases, ...problemData } = data;

  return prisma.$transaction(async (tx) => {
    const problem = await tx.problem.update({
      where: { id },
      data: problemData,
    });

    if (testCases) {
      await tx.testCase.deleteMany({
        where: { problemId: id },
      });

      await tx.testCase.createMany({
        data: testCases.map((tc) => ({
          ...tc,
          problemId: id,
        })),
      });
    }

    return tx.problem.findUnique({
      where: { id },
      include: { testCases: true },
    });
  });
};

const deleteProblem = async (id) => {
  return prisma.problem.delete({
    where: { id },
  });
};

// ─── Bookmark toggles ───────────────────────────────────────────────────────────

const toggleBookmark = async (problemId, userId) => {
  const existing = await prisma.problemBookmark.findUnique({
    where: { problemId_userId: { problemId, userId } }
  });

  if (existing) {
    await prisma.problemBookmark.delete({
      where: { problemId_userId: { problemId, userId } }
    });
    return { bookmarked: false };
  } else {
    await prisma.problemBookmark.create({
      data: { problemId, userId }
    });
    return { bookmarked: true };
  }
};

// ─── Likes toggles ──────────────────────────────────────────────────────────────

const toggleLike = async (problemId, userId, value) => {
  if (value === "NONE") {
    await prisma.problemLike.deleteMany({
      where: { problemId, userId }
    });
    return { likeStatus: 0 };
  }

  const isLike = value === "LIKE";

  const result = await prisma.problemLike.upsert({
    where: { problemId_userId: { problemId, userId } },
    update: { isLike },
    create: { problemId, userId, isLike }
  });

  return { likeStatus: result.isLike ? 1 : -1 };
};

// ─── Statistics ─────────────────────────────────────────────────────────────────

const getProblemsStatistics = async (userId) => {
  const totalProblems = await prisma.problem.count({
    where: { status: "PUBLISHED", visibility: "PUBLIC" }
  });

  const submissions = await prisma.submission.findMany({
    where: { userId },
    select: { problemId: true, status: true }
  });

  const solvedIds = new Set(submissions.filter(s => s.status === "ACCEPTED").map(s => s.problemId));
  const attemptedIds = new Set(submissions.map(s => s.problemId));

  const solvedCount = solvedIds.size;
  const attemptedCount = attemptedIds.size - solvedCount;

  const successRate = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  const bookmarksCount = await prisma.problemBookmark.count({
    where: { userId }
  });

  return {
    totalProblems,
    solvedProblems: solvedCount,
    attempted: attemptedCount,
    successRate,
    bookmarks: bookmarksCount
  };
};

// ─── Discussions ────────────────────────────────────────────────────────────────

const createProblemDiscussion = async (problemId, userId, title, content) => {
  return prisma.problemDiscussion.create({
    data: { problemId, userId, title, content },
    include: { user: { select: { id: true, name: true } } }
  });
};

const getProblemDiscussions = async (problemId) => {
  return prisma.problemDiscussion.findMany({
    where: { problemId },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { user: { select: { id: true, name: true } } }
  });
};

// ─── Reports ────────────────────────────────────────────────────────────────────

const createProblemReport = async (problemId, userId, reason) => {
  return prisma.problemReport.create({
    data: { problemId, userId, reason }
  });
};

// ─── Editorial ──────────────────────────────────────────────────────────────────

const getProblemEditorial = async (problemId) => {
  const editorial = await prisma.problemEditorial.findUnique({
    where: { problemId }
  });
  if (!editorial) {
    // Return a default mock unlocked editorial content if not seeded yet
    return { content: "Implement target solution using double pointers or sliding window algorithms.", isLocked: false };
  }
  return editorial;
};

module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  toggleBookmark,
  toggleLike,
  getProblemsStatistics,
  createProblemDiscussion,
  getProblemDiscussions,
  createProblemReport,
  getProblemEditorial
};
