const prisma = require("../../config/prisma");

const getDailyChallenge = async () => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const existing = await prisma.dailyChallenge.findFirst({
    where: { date: today },
    include: { problem: true }
  });

  if (existing) {
    return existing.problem;
  }

  const problem = await prisma.problem.findFirst({
    where: { status: "PUBLISHED", visibility: "PUBLIC" }
  });

  if (!problem) {
    return null;
  }

  try {
    await prisma.dailyChallenge.create({
      data: {
        problemId: problem.id,
        date: today
      }
    });
  } catch (err) {
    // Avoid concurrency race condition
  }

  return problem;
};

module.exports = {
  getDailyChallenge
};
