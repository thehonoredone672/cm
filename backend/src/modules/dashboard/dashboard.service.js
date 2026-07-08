const prisma = require("../../config/prisma");
const { getMatches } = require("../matches/matches.service");

const getDashboardStats = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: true,
      interests: true,
      teamRequests: true,
      applications: true,
      teamMemberships: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 1. Profile Completion
  let fieldsFilled = 0;
  let totalFields = 8;

  if (user.bio) fieldsFilled++;
  if (user.profileImage) fieldsFilled++;
  if (user.githubUrl) fieldsFilled++;
  if (user.linkedinUrl) fieldsFilled++;
  if (user.educationType) fieldsFilled++;
  
  if (user.educationType === "SCHOOL" && user.schoolName) fieldsFilled++;
  else if (user.educationType === "COLLEGE" && user.college) fieldsFilled++;
  else if (user.educationType === "EMPLOYED" && user.company) fieldsFilled++;
  else if (user.educationType === "SELF_LEARNER") fieldsFilled++;
  else fieldsFilled++;

  if (user.skills.length > 0) fieldsFilled++;
  if (user.interests.length > 0) fieldsFilled++;

  const profileCompletion = Math.round((fieldsFilled / totalFields) * 100);

  // 2. Counts
  const skillsCount = user.skills.length;
  const interestsCount = user.interests.length;

  // 3. Matches count
  let matchesCount = 0;
  try {
    const matches = await getMatches(userId);
    matchesCount = matches.length;
  } catch (err) {
    console.error("Failed to compute matches for dashboard stats", err);
  }

  // 4. Invites
  const pendingInvites = await prisma.teamInvite.count({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: "PENDING",
    },
  });

  const acceptedInvites = await prisma.teamInvite.count({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: "ACCEPTED",
    },
  });

  // 5. Team Requests & Applications
  const teamRequestsCount = user.teamRequests.length;
  const applicationsCount = user.applications.length;

  // 6. Teams Joined
  const teamsJoinedCount = user.teamMemberships.length;

  // 7. Unread Messages
  const userParticipants = await prisma.conversationParticipant.findMany({
    where: { userId },
  });

  let unreadMessagesCount = 0;
  for (const part of userParticipants) {
    const lastReadAt = part.lastReadAt || null;
    const count = await prisma.message.count({
      where: {
        conversationId: part.conversationId,
        senderId: { not: userId },
        createdAt: lastReadAt ? { gt: lastReadAt } : undefined,
      },
    });
    unreadMessagesCount += count;
  }

  // 8. Coding Stats (Student Analytics)
  const submissionsCount = await prisma.submission.count({
    where: { userId },
  });

  const solvedProblems = await prisma.submission.findMany({
    where: { userId, status: "ACCEPTED" },
    select: {
      problem: {
        select: {
          id: true,
          title: true,
          difficulty: true,
        },
      },
    },
  });

  const uniqueSolvedIds = new Set(solvedProblems.map((s) => s.problem.id));
  const solvedCount = uniqueSolvedIds.size;
  const successRate = submissionsCount > 0 ? Math.round((solvedCount / submissionsCount) * 100) : 0;

  const easySolved = Array.from(new Set(solvedProblems.filter(p => p.problem.difficulty === "EASY").map(p => p.problem.id))).length;
  const mediumSolved = Array.from(new Set(solvedProblems.filter(p => p.problem.difficulty === "MEDIUM").map(p => p.problem.id))).length;
  const hardSolved = Array.from(new Set(solvedProblems.filter(p => p.problem.difficulty === "HARD").map(p => p.problem.id))).length;

  // Submission timeline for Heatmap (last 7 days submission counts)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0,0,0,0);
    last7Days.push({
      date: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      count: 0,
      rawDate: d,
    });
  }

  const submissions = await prisma.submission.findMany({
    where: { userId },
    select: { createdAt: true },
  });

  submissions.forEach((sub) => {
    const subDate = new Date(sub.createdAt);
    subDate.setHours(0,0,0,0);
    const day = last7Days.find(d => d.rawDate.getTime() === subDate.getTime());
    if (day) day.count++;
  });

  const codingSummary = {
    submissionsCount,
    solvedCount,
    successRate,
    easySolved,
    mediumSolved,
    hardSolved,
    heatmap: last7Days.map(d => ({ date: d.date, count: d.count })),
  };

  // 9. Recent Activity
  const recentInvites = await prisma.teamInvite.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { name: true } },
      receiver: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentApplications = await prisma.application.findMany({
    where: {
      applicantId: userId,
    },
    include: {
      teamRequest: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentMemberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          leader: { select: { name: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
    take: 5,
  });

  const activities = [];

  recentInvites.forEach((invite) => {
    const isSender = invite.senderId === userId;
    activities.push({
      id: `invite-${invite.id}`,
      type: "INVITE",
      text: isSender 
        ? `You invited ${invite.receiver.name} to collaborate` 
        : `${invite.sender.name} invited you to collaborate`,
      status: invite.status,
      date: invite.updatedAt || invite.createdAt,
    });
  });

  recentApplications.forEach((app) => {
    activities.push({
      id: `app-${app.id}`,
      type: "APPLICATION",
      text: `You applied to the team request "${app.teamRequest.title}"`,
      status: app.status,
      date: app.createdAt,
    });
  });

  recentMemberships.forEach((mem) => {
    activities.push({
      id: `mem-${mem.id}`,
      type: "TEAM",
      text: mem.team.leaderId === userId 
        ? `You created and lead the team "${mem.team.name}"`
        : `You joined the team "${mem.team.name}" led by ${mem.team.leader.name}`,
      status: "ACCEPTED",
      date: mem.joinedAt,
    });
  });

  activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentActivity = activities.slice(0, 6);

  // 10. Admin Analytics (if admin)
  let adminStats = null;
  if (user.role === "ADMIN") {
    const totalUsers = await prisma.user.count();
    const totalTeams = await prisma.team.count();
    const totalProblems = await prisma.problem.count();
    const activeUsersCount = await prisma.submission.groupBy({
      by: ["userId"],
    });

    adminStats = {
      totalUsers,
      totalTeams,
      totalProblems,
      activeUsers: activeUsersCount.length,
    };
  }

  return {
    profileCompletion,
    skillsCount,
    interestsCount,
    matchesCount,
    pendingInvites,
    acceptedInvites,
    teamRequestsCount,
    applicationsCount,
    teamsJoinedCount,
    unreadMessagesCount,
    recentActivity,
    codingSummary,
    adminStats,
  };
};

module.exports = {
  getDashboardStats,
};
