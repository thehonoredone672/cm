"use strict";

const prisma = require("../../config/prisma");

const syncUserStatsAndXP = async (userId) => {
  return prisma.$transaction(async (tx) => {
    // 1. Gather all submissions
    const submissions = await tx.submission.findMany({
      where: { userId },
      include: { problem: true }
    });

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === "ACCEPTED");

    // Group solved by problemId to get unique solved problems
    const solvedMap = new Map();
    acceptedSubmissions.forEach(s => {
      solvedMap.set(s.problemId, s.problem);
    });

    const solvedCount = solvedMap.size;

    // Difficulty counts
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    solvedMap.forEach(p => {
      if (p.difficulty === "EASY") easyCount++;
      else if (p.difficulty === "MEDIUM") mediumCount++;
      else if (p.difficulty === "HARD") hardCount++;
    });

    // 2. Gather user projects
    const projectsCount = await tx.project.count({ where: { userId } });

    // 3. Compute XP
    // Formula: Easy solved * 10 + Medium solved * 20 + Hard solved * 50 + Total Submissions * 2 + Projects * 50
    const xp = (easyCount * 10) + (mediumCount * 20) + (hardCount * 50) + (totalSubmissions * 2) + (projectsCount * 50);

    // Level formula: level = floor(XP / 100) + 1
    const level = Math.floor(xp / 100) + 1;

    // Update user profile fields
    const user = await tx.user.update({
      where: { id: userId },
      data: { xp, level }
    });

    // 4. Award Badges
    const existingBadges = await tx.userBadge.findMany({ where: { userId } });
    const badgeNames = new Set(existingBadges.map(b => b.badgeName));

    const checkAndAwardBadge = async (badgeName) => {
      if (!badgeNames.has(badgeName)) {
        await tx.userBadge.create({
          data: { userId, badgeName }
        });
      }
    };

    if (solvedCount >= 1) await checkAndAwardBadge("First Accepted");
    if (solvedCount >= 10) await checkAndAwardBadge("10 Problems");
    if (solvedCount >= 50) await checkAndAwardBadge("50 Problems");
    if (solvedCount >= 100) await checkAndAwardBadge("100 Problems");
    if (projectsCount >= 1) await checkAndAwardBadge("Team Player");

    // 5. Gather average metrics
    const acceptedMetrics = await tx.submission.aggregate({
      where: { userId, status: "ACCEPTED" },
      _avg: {
        executionTime: true,
        memoryUsage: true
      }
    });

    const rate = totalSubmissions > 0 ? Math.round((acceptedSubmissions.length / totalSubmissions) * 100) : 0;

    return {
      user,
      solvedCount,
      easyCount,
      mediumCount,
      hardCount,
      totalSubmissions,
      acceptanceRate: rate,
      averageRuntime: acceptedMetrics._avg.executionTime ? Math.round(acceptedMetrics._avg.executionTime * 1000) : 0,
      averageMemory: acceptedMetrics._avg.memoryUsage ? Math.round(acceptedMetrics._avg.memoryUsage) : 0,
      badges: await tx.userBadge.findMany({ where: { userId } })
    };
  });
};

const getGlobalLeaderboard = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {};

  if (query.college) {
    where.college = { contains: query.college, mode: "insensitive" };
  }
  if (query.department) {
    where.department = { contains: query.department, mode: "insensitive" };
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } }
    ];
  }

  // Get total count
  const total = await prisma.user.count({ where });

  // Get users sorted by XP descending
  const rawUsers = await prisma.user.findMany({
    where,
    orderBy: { xp: "desc" },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      college: true,
      department: true,
      xp: true,
      level: true,
      streak: true,
      longestStreak: true
    }
  });

  const users = rawUsers.map((u, idx) => ({
    rank: skip + idx + 1,
    ...u
  }));

  return {
    leaderboard: users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

const getUserProfileStatistics = async (userId) => {
  // Sync first to ensure we have fresh data
  const stats = await syncUserStatsAndXP(userId);

  // Group submissions by day for submission calendar view (heatmap)
  const submissions = await prisma.submission.findMany({
    where: { userId },
    select: { createdAt: true }
  });

  const dateCounts = {};
  submissions.forEach(s => {
    const dateStr = s.createdAt.toISOString().split("T")[0];
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
  });

  // Compile language used stats
  const langGroup = await prisma.submission.groupBy({
    by: ["language"],
    where: { userId },
    _count: { id: true }
  });

  const languageStats = langGroup.map(g => ({
    language: g.language,
    count: g._count.id
  }));

  return {
    ...stats,
    submissionHeatmap: dateCounts,
    languageStats
  };
};

module.exports = {
  syncUserStatsAndXP,
  getGlobalLeaderboard,
  getUserProfileStatistics
};
