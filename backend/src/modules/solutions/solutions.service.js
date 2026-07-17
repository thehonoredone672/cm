"use strict";

const prisma = require("../../config/prisma");

const hasSolvedProblem = async (problemId, userId) => {
  const solved = await prisma.submission.findFirst({
    where: { problemId, userId, status: "ACCEPTED" }
  });
  return !!solved;
};

const createSolution = async (userId, data) => {
  return prisma.$transaction(async (tx) => {
    const approach = await tx.solutionApproach.create({
      data: {
        title: data.title,
        description: data.approach
      }
    });

    const explanation = await tx.solutionExplanation.create({
      data: {
        steps: data.stepExplanation
      }
    });

    const complexity = await tx.solutionComplexity.create({
      data: {
        time: data.timeComplexity,
        space: data.spaceComplexity
      }
    });

    const solution = await tx.solution.create({
      data: {
        problemId: data.problemId,
        title: data.title,
        language: data.language,
        visibility: data.visibility || "PRIVATE",
        code: data.code,
        approachId: approach.id,
        explanationId: explanation.id,
        complexityId: complexity.id,
        createdBy: userId,
        updatedBy: userId
      },
      include: {
        approach: true,
        explanation: true,
        complexity: true
      }
    });

    return solution;
  });
};

const updateSolution = async (solutionId, userId, data) => {
  const existing = await prisma.solution.findUnique({
    where: { id: solutionId }
  });
  if (!existing) throw new Error("Solution not found");

  return prisma.$transaction(async (tx) => {
    if (data.approach && existing.approachId) {
      await tx.solutionApproach.update({
        where: { id: existing.approachId },
        data: { title: data.title || existing.title, description: data.approach }
      });
    }

    if (data.stepExplanation && existing.explanationId) {
      await tx.solutionExplanation.update({
        where: { id: existing.explanationId },
        data: { steps: data.stepExplanation }
      });
    }

    if ((data.timeComplexity || data.spaceComplexity) && existing.complexityId) {
      await tx.solutionComplexity.update({
        where: { id: existing.complexityId },
        data: {
          time: data.timeComplexity || undefined,
          space: data.spaceComplexity || undefined
        }
      });
    }

    const updated = await tx.solution.update({
      where: { id: solutionId },
      data: {
        title: data.title,
        language: data.language,
        visibility: data.visibility,
        code: data.code,
        updatedBy: userId
      },
      include: {
        approach: true,
        explanation: true,
        complexity: true
      }
    });

    return updated;
  });
};

const deleteSolution = async (solutionId) => {
  const existing = await prisma.solution.findUnique({
    where: { id: solutionId }
  });
  if (!existing) throw new Error("Solution not found");

  return prisma.$transaction(async (tx) => {
    await tx.solution.delete({ where: { id: solutionId } });
    if (existing.approachId) await tx.solutionApproach.delete({ where: { id: existing.approachId } });
    if (existing.explanationId) await tx.solutionExplanation.delete({ where: { id: existing.explanationId } });
    if (existing.complexityId) await tx.solutionComplexity.delete({ where: { id: existing.complexityId } });
    return { id: solutionId };
  });
};

const getSolutionsForProblem = async (problemId, userRole, userId) => {
  const query = {
    where: { problemId },
    include: {
      approach: true,
      explanation: true,
      complexity: true
    }
  };

  // If user is ADMIN, return everything
  if (userRole === "ADMIN") {
    return prisma.solution.findMany(query);
  }

  // Check solved status
  const solved = await hasSolvedProblem(problemId, userId);
  
  if (!solved) {
    // Student can only see solutions with visibility = PUBLIC
    query.where.visibility = "PUBLIC";
  }

  return prisma.solution.findMany(query);
};

const getSolutionById = async (solutionId, userRole, userId) => {
  const solution = await prisma.solution.findUnique({
    where: { id: solutionId },
    include: {
      approach: true,
      explanation: true,
      complexity: true
    }
  });

  if (!solution) throw new Error("Solution not found");
  if (userRole === "ADMIN") return solution;

  const solved = await hasSolvedProblem(solution.problemId, userId);
  if (!solved && solution.visibility !== "PUBLIC") {
    throw new Error("You must solve the problem first to view the official solution.");
  }

  return solution;
};

const setSolutionVisibility = async (solutionId, visibility) => {
  return prisma.solution.update({
    where: { id: solutionId },
    data: { visibility },
    include: {
      approach: true,
      explanation: true,
      complexity: true
    }
  });
};

module.exports = {
  createSolution,
  updateSolution,
  deleteSolution,
  getSolutionsForProblem,
  getSolutionById,
  setSolutionVisibility
};
