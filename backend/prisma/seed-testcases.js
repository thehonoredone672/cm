/**
 * Seed script: adds test cases to existing problems in the database.
 * Run with: node prisma/seed-testcases.js
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PROBLEM_TESTCASES = [
  // ── Reverse String ──────────────────────────────────────────────────────────
  {
    title: "Reverse String",
    testCases: [
      { input: "hello",    expectedOutput: "olleh",    isPublic: true  },
      { input: "world",    expectedOutput: "dlrow",    isPublic: true  },
      { input: "abcdef",   expectedOutput: "fedcba",   isPublic: false },
      { input: "OpenAI",   expectedOutput: "IAnepO",   isPublic: false },
      { input: "12345",    expectedOutput: "54321",    isPublic: false },
      { input: "racecar",  expectedOutput: "racecar",  isPublic: false },
      { input: "a",        expectedOutput: "a",        isPublic: false },
      { input: "",         expectedOutput: "",         isPublic: false },
    ],
  },

  // ── Fibonacci Number ─────────────────────────────────────────────────────────
  // Input: single integer n, output: F(n) where F(0)=0, F(1)=1
  {
    title: "Fibonacci Number",
    testCases: [
      { input: "0",  expectedOutput: "0",  isPublic: true  },
      { input: "1",  expectedOutput: "1",  isPublic: true  },
      { input: "2",  expectedOutput: "1",  isPublic: false },
      { input: "5",  expectedOutput: "5",  isPublic: false },
      { input: "7",  expectedOutput: "13", isPublic: false },
      { input: "10", expectedOutput: "55", isPublic: false },
    ],
  },

  // ── Two Sum ──────────────────────────────────────────────────────────────────
  // Input: "nums=[2,7,11,15] target=9", output: "[0,1]"
  {
    title: "Two Sum",
    testCases: [
      { input: "2 7 11 15\n9",  expectedOutput: "0 1",  isPublic: true  },
      { input: "3 2 4\n6",      expectedOutput: "1 2",  isPublic: true  },
      { input: "3 3\n6",        expectedOutput: "0 1",  isPublic: false },
      { input: "1 2 3 4 5\n9",  expectedOutput: "3 4",  isPublic: false },
    ],
  },
];

async function main() {
  console.log("🌱  Seeding test cases…");

  for (const { title, testCases } of PROBLEM_TESTCASES) {
    const problem = await prisma.problem.findFirst({ where: { title } });
    if (!problem) {
      console.warn(`  ⚠  Problem "${title}" not found in DB. Skipping.`);
      continue;
    }

    // Remove old test cases to avoid duplication on re-run
    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });

    const created = await prisma.testCase.createMany({
      data: testCases.map((tc) => ({ ...tc, problemId: problem.id })),
    });

    console.log(`  ✓  "${title}" → ${created.count} test cases added.`);
  }

  console.log("✅  Done.");
}

main()
  .catch((e) => { console.error("❌  Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
