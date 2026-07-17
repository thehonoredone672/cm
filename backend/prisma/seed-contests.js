const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedContests() {
  console.log("=== SEEDING CONTESTS ===");

  const problems = await prisma.problem.findMany();
  if (problems.length === 0) {
    console.log("⚠️ No problems found in database. Seed problems first.");
    return;
  }

  const now = new Date();

  // 1. ACTIVE/running contest
  const activeStart = new Date(now.getTime() - 3600000); // 1 hour ago
  const activeEnd = new Date(now.getTime() + 7200000);   // 2 hours from now
  const activeContest = await prisma.contest.create({
    data: {
      title: "Weekly CodeMatch Showdown #1",
      description: "Compete with other developers in a race to solve algorithmic puzzles.",
      startTime: activeStart,
      endTime: activeEnd,
      type: "PUBLIC",
      status: "ACTIVE"
    }
  });

  // Link first 2 problems
  await prisma.contestProblem.createMany({
    data: [
      { contestId: activeContest.id, problemId: problems[0].id, points: 100, order: 1 },
      ...(problems[1] ? [{ contestId: activeContest.id, problemId: problems[1].id, points: 200, order: 2 }] : [])
    ]
  });

  // 2. UPCOMING contest
  const upcomingStart = new Date(now.getTime() + 86400000); // tomorrow
  const upcomingEnd = new Date(now.getTime() + 86400000 * 2);
  const upcomingContest = await prisma.contest.create({
    data: {
      title: "Sprint Programming Arena #5",
      description: "Speed coding contest designed to test basic programming syntax and logic.",
      startTime: upcomingStart,
      endTime: upcomingEnd,
      type: "PRACTICE",
      status: "UPCOMING"
    }
  });

  // Link first problem
  await prisma.contestProblem.create({
    data: { contestId: upcomingContest.id, problemId: problems[0].id, points: 100, order: 1 }
  });

  // 3. COMPLETED contest
  const completedStart = new Date(now.getTime() - 86400000 * 3); // 3 days ago
  const completedEnd = new Date(now.getTime() - 86400000 * 2);
  const completedContest = await prisma.contest.create({
    data: {
      title: "Hackathon Warmup Contest",
      description: "Preparation workspace containing standard dynamic programming templates.",
      startTime: completedStart,
      endTime: completedEnd,
      type: "HACKATHON",
      status: "COMPLETED"
    }
  });

  // Link problems
  await prisma.contestProblem.create({
    data: { contestId: completedContest.id, problemId: problems[0].id, points: 100, order: 1 }
  });

  console.log("✓ Seeded 3 contests (ACTIVE, UPCOMING, COMPLETED) successfully.");
}

seedContests()
  .catch(err => {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
