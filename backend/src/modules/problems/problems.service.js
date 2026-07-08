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

const getAllProblems = async (userRole) => {
  const where = {};
  if (userRole !== "ADMIN") {
    where.status = "PUBLISHED";
    where.visibility = "PUBLIC";
  }

  return prisma.problem.findMany({
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
    },
    orderBy: {
      createdAt: "desc",
    },
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
