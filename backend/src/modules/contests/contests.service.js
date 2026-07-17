"use strict";

const prisma = require("../../config/prisma");

const getUpdatedContestStatus = (startTime, endTime) => {
  const now = new Date();
  if (now < new Date(startTime)) return "UPCOMING";
  if (now > new Date(endTime)) return "COMPLETED";
  return "ACTIVE";
};

const createContest = async (data) => {
  const { problems, ...contestData } = data;
  return prisma.$transaction(async (tx) => {
    const contest = await tx.contest.create({
      data: {
        ...contestData,
        status: getUpdatedContestStatus(contestData.startTime, contestData.endTime)
      }
    });

    if (problems && problems.length > 0) {
      await tx.contestProblem.createMany({
        data: problems.map((p) => ({
          contestId: contest.id,
          problemId: p.problemId,
          points: p.points,
          order: p.order
        }))
      });
    }

    return tx.contest.findUnique({
      where: { id: contest.id },
      include: { problems: { include: { problem: true } } }
    });
  });
};

const getAllContests = async (query = {}) => {
  const contests = await prisma.contest.findMany({
    orderBy: { startTime: "asc" },
    include: {
      registrations: true,
      problems: { select: { problemId: true } }
    }
  });

  // Dynamically update status and return
  const now = new Date();
  return Promise.all(
    contests.map(async (c) => {
      const status = getUpdatedContestStatus(c.startTime, c.endTime);
      if (status !== c.status) {
        await prisma.contest.update({
          where: { id: c.id },
          data: { status }
        });
        c.status = status;
      }
      return {
        ...c,
        problemsCount: c.problems.length,
        registrationsCount: c.registrations.length
      };
    })
  );
};

const getContestById = async (id, userId) => {
  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      problems: {
        orderBy: { order: "asc" },
        include: { problem: true }
      },
      registrations: true
    }
  });

  if (!contest) throw new Error("Contest not found");

  const status = getUpdatedContestStatus(contest.startTime, contest.endTime);
  if (status !== contest.status) {
    await prisma.contest.update({
      where: { id },
      data: { status }
    });
    contest.status = status;
  }

  const isRegistered = contest.registrations.some((r) => r.userId === userId);

  return {
    ...contest,
    isRegistered,
    problemsCount: contest.problems.length,
    registrationsCount: contest.registrations.length
  };
};

const updateContest = async (id, data) => {
  const { problems, ...contestData } = data;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.contest.update({
      where: { id },
      data: {
        ...contestData,
        status: contestData.startTime && contestData.endTime 
          ? getUpdatedContestStatus(contestData.startTime, contestData.endTime)
          : undefined
      }
    });

    if (problems) {
      await tx.contestProblem.deleteMany({ where: { contestId: id } });
      if (problems.length > 0) {
        await tx.contestProblem.createMany({
          data: problems.map((p) => ({
            contestId: id,
            problemId: p.problemId,
            points: p.points,
            order: p.order
          }))
        });
      }
    }

    return tx.contest.findUnique({
      where: { id },
      include: { problems: { include: { problem: true } } }
    });
  });
};

const deleteContest = async (id) => {
  return prisma.contest.delete({ where: { id } });
};

const registerForContest = async (contestId, userId) => {
  const contest = await prisma.contest.findUnique({ where: { id: contestId } });
  if (!contest) throw new Error("Contest not found");

  const now = new Date();
  if (now > new Date(contest.endTime)) {
    throw new Error("Contest has already ended");
  }

  const existing = await prisma.contestRegistration.findUnique({
    where: { contestId_userId: { contestId, userId } }
  });

  if (existing) return existing;

  return prisma.contestRegistration.create({
    data: { contestId, userId }
  });
};

const getContestLeaderboard = async (contestId) => {
  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
    include: {
      problems: { include: { problem: true } },
      registrations: { include: { user: { select: { id: true, name: true, college: true } } } }
    }
  });

  if (!contest) throw new Error("Contest not found");

  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  const leaderboard = await Promise.all(
    contest.registrations.map(async (reg) => {
      const submissions = await prisma.submission.findMany({
        where: {
          userId: reg.userId,
          problemId: { in: contest.problems.map((p) => p.problemId) },
          createdAt: { gte: start, lte: end }
        },
        orderBy: { createdAt: "asc" }
      });

      let score = 0;
      let penalty = 0;
      let solvedCount = 0;

      // Group submissions by problemId
      const subMap = new Map();
      submissions.forEach((s) => {
        if (!subMap.has(s.problemId)) subMap.set(s.problemId, []);
        subMap.get(s.problemId).push(s);
      });

      contest.problems.forEach((cp) => {
        const problemSubs = subMap.get(cp.problemId) || [];
        const firstAcceptIdx = problemSubs.findIndex((s) => s.status === "ACCEPTED");

        if (firstAcceptIdx !== -1) {
          solvedCount += 1;
          score += cp.points;

          // Time elapsed in minutes from contest start
          const acceptedAt = new Date(problemSubs[firstAcceptIdx].createdAt);
          const elapsedMinutes = Math.floor((acceptedAt - start) / 60000);

          // Penalty = elapsed minutes + 20 minutes for each wrong submission before accepted
          const wrongBeforeAccept = firstAcceptIdx;
          penalty += elapsedMinutes + wrongBeforeAccept * 20;
        }
      });

      return {
        user: reg.user,
        solved: solvedCount,
        score,
        penalty
      };
    })
  );

  // Sort: Solved (desc), Penalty (asc)
  leaderboard.sort((a, b) => {
    if (b.solved !== a.solved) return b.solved - a.solved;
    return a.penalty - b.penalty;
  });

  return leaderboard.map((entry, idx) => ({
    rank: idx + 1,
    ...entry
  }));
};

const createContestAnnouncement = async (contestId, data) => {
  return prisma.contestAnnouncement.create({
    data: {
      contestId,
      title: data.title,
      content: data.content
    }
  });
};

const getContestAnnouncements = async (contestId) => {
  return prisma.contestAnnouncement.findMany({
    where: { contestId },
    orderBy: { createdAt: "desc" }
  });
};

module.exports = {
  createContest,
  getAllContests,
  getContestById,
  updateContest,
  deleteContest,
  registerForContest,
  getContestLeaderboard,
  createContestAnnouncement,
  getContestAnnouncements
};
