const prisma = require("../../config/prisma");

const createProblem = async (data) => {
  const { testCases, ...problemData } = data;
  return prisma.$transaction(async (tx) => {
    const problem = await tx.problem.create({
      data: {
        ...problemData,
        testCases: {
          create: testCases,
        },
      },
      include: {
        testCases: true,
      },
    });
    return problem;
  });
};

const getAllProblems = async (userRole, userId) => {
  const where = {};
  if (userRole !== "ADMIN") {
    where.status = "PUBLISHED";
    where.visibility = "PUBLIC";
  }

  const problems = await prisma.problem.findMany({
    where,
    select: {
      id: true,
      title: true,
      category: true,
      difficulty: true,
      tags: true,
      status: true,
      visibility: true,
      createdAt: true,
      submissions: {
        where: { userId },
        select: {
          status: true
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return problems.map((p) => {
    const subs = p.submissions || [];
    const isSolved = subs.some((s) => s.status === "ACCEPTED");
    const isAttempted = !isSolved && subs.length > 0;
    const { submissions, ...rest } = p;
    return {
      ...rest,
      solveStatus: isSolved ? "SOLVED" : (isAttempted ? "ATTEMPTED" : "UNSOLVED")
    };
  });
};

const getProblemById = async (id, userRole) => {
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      testCases: true,
    },
  });

  if (!problem) {
    throw new Error("Problem not found");
  }

  if (userRole !== "ADMIN") {
    if (problem.status !== "PUBLISHED" || problem.visibility !== "PUBLIC") {
      throw new Error("Problem not found");
    }
    problem.testCases = problem.testCases.filter((tc) => tc.isPublic);
  }

  return problem;
};

const updateProblem = async (id, data) => {
  const { testCases, ...problemData } = data;

  return prisma.$transaction(async (tx) => {
    const problem = await tx.problem.update({
      where: { id },
      data: problemData,
    });

    if (testCases) {
      await tx.testCase.deleteMany({
        where: { problemId: id },
      });

      await tx.testCase.createMany({
        data: testCases.map((tc) => ({
          ...tc,
          problemId: id,
        })),
      });
    }

    return tx.problem.findUnique({
      where: { id },
      include: { testCases: true },
    });
  });
};

const deleteProblem = async (id) => {
  return prisma.problem.delete({
    where: { id },
  });
};

module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
};
