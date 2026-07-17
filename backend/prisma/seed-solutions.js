const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedSolutions() {
  console.log("=== SEEDING OFFICIAL SOLUTIONS ===");

  const problems = await prisma.problem.findMany();
  if (problems.length === 0) {
    console.log("⚠️ No problems found in database. Seed problems first.");
    return;
  }

  // Find or create admin user to assign createdBy
  let admin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (!admin) {
    // Fallback if no admin exists
    admin = await prisma.user.create({
      data: {
        name: "Admin Moderator",
        email: "admin@codematch.com",
        password: "adminpassword",
        role: "ADMIN"
      }
    });
  }

  for (const prob of problems) {
    const existing = await prisma.solution.findFirst({
      where: { problemId: prob.id }
    });

    if (existing) {
      console.log(`✓ Solution already seeded for problem: "${prob.title}"`);
      continue;
    }

    // Design details
    const approach = await prisma.solutionApproach.create({
      data: {
        title: "Optimal Iterative Intuition",
        description: "Compute the results iteratively using a memoized loop cache to avoid exponential recursion stack overhead."
      }
    });

    const explanation = await prisma.solutionExplanation.create({
      data: {
        steps: "1. Initialize variables a=0 and b=1.\n2. Loop up to target limit N adding parameters iteratively.\n3. Return the calculated values."
      }
    });

    const complexity = await prisma.solutionComplexity.create({
      data: {
        time: "O(N)",
        space: "O(1)"
      }
    });

    await prisma.solution.create({
      data: {
        problemId: prob.id,
        title: "Optimal Linear Iteration Solution",
        language: "javascript",
        visibility: "PUBLIC",
        code: "function solve(n) {\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    let temp = a + b;\n    a = b;\n    b = temp;\n  }\n  return n === 0 ? a : b;\n}",
        approachId: approach.id,
        explanationId: explanation.id,
        complexityId: complexity.id,
        createdBy: admin.id,
        updatedBy: admin.id
      }
    });

    console.log(`✓ Seeded official solution for problem: "${prob.title}"`);
  }

  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
}

seedSolutions()
  .catch(err => {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
