"use strict";

const prisma = require("../../config/prisma");

const performGlobalSearch = async (userId, queryText, filters = {}) => {
  const q = queryText ? queryText.trim() : "";
  
  if (q && userId) {
    // 1. Save query in user's search history
    await prisma.searchHistory.create({
      data: { userId, query: q }
    });

    // 2. Increment popular search counts in SearchAnalytics
    await prisma.searchAnalytics.upsert({
      where: { query: q },
      update: { count: { increment: 1 } },
      create: { query: q }
    });
  }

  const results = {
    students: [],
    teams: [],
    projects: [],
    problems: [],
    contests: []
  };

  const containsQuery = q ? { contains: q, mode: "insensitive" } : undefined;

  // Query Students
  const studentWhere = {};
  if (containsQuery) {
    studentWhere.OR = [
      { name: containsQuery },
      { email: containsQuery },
      { college: containsQuery },
      { department: containsQuery }
    ];
  }
  if (filters.college) {
    studentWhere.college = { contains: filters.college, mode: "insensitive" };
  }
  results.students = await prisma.user.findMany({
    where: studentWhere,
    take: 10,
    select: { id: true, name: true, email: true, college: true, department: true }
  });

  // Query Teams
  const teamWhere = {};
  if (containsQuery) {
    teamWhere.OR = [
      { name: containsQuery },
      { description: containsQuery }
    ];
  }
  results.teams = await prisma.team.findMany({
    where: teamWhere,
    take: 10,
    select: { id: true, name: true, description: true }
  });

  // Query Projects
  const projectWhere = {};
  if (containsQuery) {
    projectWhere.OR = [
      { title: containsQuery },
      { description: containsQuery }
    ];
  }
  results.projects = await prisma.project.findMany({
    where: projectWhere,
    take: 10,
    select: { id: true, title: true, description: true }
  });

  // Query Problems
  const problemWhere = { status: "PUBLISHED" };
  if (containsQuery) {
    problemWhere.OR = [
      { title: containsQuery },
      { description: containsQuery },
      { category: containsQuery }
    ];
  }
  if (filters.difficulty && filters.difficulty !== "ALL") {
    problemWhere.difficulty = filters.difficulty;
  }
  results.problems = await prisma.problem.findMany({
    where: problemWhere,
    take: 10,
    select: { id: true, title: true, difficulty: true, category: true }
  });

  // Query Contests
  const contestWhere = {};
  if (containsQuery) {
    contestWhere.OR = [
      { title: containsQuery },
      { description: containsQuery }
    ];
  }
  if (filters.contestStatus) {
    contestWhere.status = filters.contestStatus;
  }
  results.contests = await prisma.contest.findMany({
    where: contestWhere,
    take: 10,
    select: { id: true, title: true, status: true, startTime: true }
  });

  return results;
};

const getSearchSuggestions = async (queryText) => {
  const q = queryText ? queryText.trim() : "";
  if (!q) return [];

  // Match suggestions from popular analytics or problem titles
  const [analyticsMatch, problemsMatch] = await Promise.all([
    prisma.searchAnalytics.findMany({
      where: { query: { contains: q, mode: "insensitive" } },
      orderBy: { count: "desc" },
      take: 5,
      select: { query: true }
    }),
    prisma.problem.findMany({
      where: { title: { contains: q, mode: "insensitive" }, status: "PUBLISHED" },
      take: 5,
      select: { title: true }
    })
  ]);

  const suggestions = new Set();
  analyticsMatch.forEach(item => suggestions.add(item.query));
  problemsMatch.forEach(item => suggestions.add(item.title));

  return Array.from(suggestions).slice(0, 8);
};

const getSearchHistory = async (userId) => {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10
  });
};

const deleteSearchHistoryItem = async (id, userId) => {
  const item = await prisma.searchHistory.findUnique({ where: { id } });
  if (!item) throw new Error("Search record not found");
  if (item.userId !== userId) throw new Error("Unauthorized");

  await prisma.searchHistory.delete({ where: { id } });
  return { id };
};

const clearAllSearchHistory = async (userId) => {
  await prisma.searchHistory.deleteMany({ where: { userId } });
  return { success: true };
};

const getTrendingSearches = async () => {
  return prisma.searchAnalytics.findMany({
    orderBy: { count: "desc" },
    take: 5
  });
};

module.exports = {
  performGlobalSearch,
  getSearchSuggestions,
  getSearchHistory,
  deleteSearchHistoryItem,
  clearAllSearchHistory,
  getTrendingSearches
};
