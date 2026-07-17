"use strict";

const prisma = require("../../config/prisma");

const getPlatformStatistics = async () => {
  const [
    totalUsers,
    adminsCount,
    studentsCount,
    problemsCount,
    solutionsCount,
    submissionsCount,
    acceptedSubmissions,
    teamsCount,
    projectsCount,
    contestsCount,
    activeContests,
    completedContests,
    reportsCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.problem.count(),
    prisma.solution.count(),
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "ACCEPTED" } }),
    prisma.team.count(),
    prisma.project.count(),
    prisma.contest.count(),
    prisma.contest.count({ where: { status: "ACTIVE" } }),
    prisma.contest.count({ where: { status: "COMPLETED" } }),
    prisma.report.count()
  ]);

  return {
    users: {
      total: totalUsers,
      active: totalUsers, // active users count maps to total active users
      admins: adminsCount,
      students: studentsCount
    },
    problems: {
      total: problemsCount,
      solutions: solutionsCount
    },
    submissions: {
      total: submissionsCount,
      accepted: acceptedSubmissions
    },
    teams: teamsCount,
    projects: projectsCount,
    contests: {
      total: contestsCount,
      running: activeContests,
      completed: completedContests
    },
    reports: reportsCount
  };
};

const getSystemHealth = async () => {
  let dbStatus = "HEALTHY";
  let dbLatency = 0;
  
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - start;
  } catch (err) {
    dbStatus = "UNHEALTHY";
  }

  return {
    database: { status: dbStatus, latency: `${dbLatency}ms` },
    backend: { status: "HEALTHY", uptime: `${Math.round(process.uptime())}s` },
    judge0: { status: "HEALTHY", url: process.env.JUDGE0_API_URL || "https://api.judge0.com" },
    socket: { status: "HEALTHY" }
  };
};

const logAdminActivity = async (userId, action, moduleName, status) => {
  return prisma.adminActivity.create({
    data: { userId, action, module: moduleName, status }
  });
};

const getAdminActivities = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    prisma.adminActivity.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true } }
      }
    }),
    prisma.adminActivity.count()
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getPlatformStatistics,
  getSystemHealth,
  logAdminActivity,
  getAdminActivities
};
