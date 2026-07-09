const prisma = require("../../config/prisma");

const getAdminStats = async () => {
  const [totalUsers, activeUsers, totalTeams, totalProblems, totalReports, totalAnnouncements] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        submissions: { some: {} }
      }
    }),
    prisma.team.count(),
    prisma.problem.count(),
    prisma.report.count(),
    prisma.announcement.count()
  ]);

  // System statistics
  const memoryUsage = process.memoryUsage();
  const systemOverview = {
    cpuUsage: process.cpuUsage(),
    memoryUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    memoryTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    uptimeSeconds: Math.round(process.uptime()),
    nodeVersion: process.version
  };

  return {
    totalUsers,
    activeUsers,
    totalTeams,
    totalProblems,
    totalReports,
    totalAnnouncements,
    systemOverview
  };
};

const getUsers = async ({ search = "", role = "", isBlocked = "", page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const whereClause = {
    AND: [
      search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ]
      } : {},
      role ? { role: role } : {},
      isBlocked !== "" ? { isBlocked: isBlocked === "true" } : {}
    ]
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
        college: true,
        department: true,
        academicYear: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit)
    }),
    prisma.user.count({ where: whereClause })
  ]);

  return {
    users,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit)
  };
};

const toggleBlockUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { isBlocked: !user.isBlocked }
  });
};

const toggleUserRole = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const newRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";
  return prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });
};

const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  return prisma.$transaction([
    prisma.teamMember.deleteMany({ where: { userId } }),
    prisma.teamInvite.deleteMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
    prisma.message.deleteMany({ where: { senderId: userId } }),
    prisma.conversationParticipant.deleteMany({ where: { userId } }),
    prisma.team.deleteMany({ where: { leaderId: userId } }),
    prisma.user.delete({ where: { id: userId } })
  ]);
};

const getTeams = async () => {
  return prisma.team.findMany({
    include: {
      leader: {
        select: { id: true, name: true, email: true }
      },
      _count: {
        select: { members: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const deleteTeam = async (teamId) => {
  return prisma.team.delete({ where: { id: teamId } });
};

const getReports = async () => {
  return prisma.report.findMany({
    include: {
      reporter: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const resolveReport = async (reportId, status) => {
  if (!["RESOLVED", "DISMISSED"].includes(status)) {
    throw new Error("Invalid status");
  }

  return prisma.report.update({
    where: { id: reportId },
    data: { status }
  });
};

const getAnnouncements = async () => {
  return prisma.announcement.findMany({
    orderBy: { createdAt: "desc" }
  });
};

const createAnnouncement = async (title, content) => {
  return prisma.announcement.create({
    data: { title, content }
  });
};

const toggleAnnouncement = async (id) => {
  const ann = await prisma.announcement.findUnique({ where: { id } });
  if (!ann) throw new Error("Announcement not found");

  return prisma.announcement.update({
    where: { id },
    data: { active: !ann.active }
  });
};

const deleteAnnouncement = async (id) => {
  return prisma.announcement.delete({ where: { id } });
};

const getMaintenanceMode = async () => {
  const config = await prisma.systemConfig.findUnique({ where: { key: "maintenance_mode" } });
  return config ? config.value === "true" : false;
};

const setMaintenanceMode = async (active) => {
  const value = active ? "true" : "false";
  return prisma.systemConfig.upsert({
    where: { key: "maintenance_mode" },
    update: { value },
    create: { key: "maintenance_mode", value }
  });
};

module.exports = {
  getAdminStats,
  getUsers,
  toggleBlockUser,
  toggleUserRole,
  deleteUser,
  getTeams,
  deleteTeam,
  getReports,
  resolveReport,
  getAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  getMaintenanceMode,
  setMaintenanceMode
};
