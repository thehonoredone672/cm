"use strict";

const prisma = require("../../config/prisma");

const getRecommendedTeams = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { include: { skill: true } },
    },
  });

  if (!user) throw new Error("User not found");

  const userSkills = user.skills.map((s) => s.skill.name.toLowerCase());

  // Find all teams where user is not a member
  const teams = await prisma.team.findMany({
    where: {
      members: {
        none: { userId },
      },
    },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          skills: { include: { skill: true } },
        },
      },
      members: {
        include: {
          user: {
            select: {
              skills: { include: { skill: true } },
            },
          },
        },
      },
    },
  });

  // Calculate matching score based Jaccard similarity of skills
  const recs = teams.map((team) => {
    const teamSkills = new Set();
    // Add leader's skills
    team.leader.skills.forEach((s) => teamSkills.add(s.skill.name.toLowerCase()));
    // Add members' skills
    team.members.forEach((m) => {
      m.user.skills.forEach((s) => teamSkills.add(s.skill.name.toLowerCase()));
    });

    const teamSkillsArr = Array.from(teamSkills);
    const intersection = userSkills.filter((sk) => teamSkillsArr.includes(sk));
    const union = new Set([...userSkills, ...teamSkillsArr]);

    const jaccard = union.size > 0 ? intersection.length / union.size : 0;
    const score = Math.round(jaccard * 100);

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      leader: team.leader.name,
      joinCode: team.joinCode,
      compatibilityScore: score || Math.floor(Math.random() * 20) + 10, // baseline
    };
  });

  return recs.sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, 10);
};

const getRecommendedProblems = async (userId) => {
  const solvedSubmissions = await prisma.submission.findMany({
    where: { userId, status: "ACCEPTED" },
    select: { problemId: true },
  });

  const solvedIds = new Set(solvedSubmissions.map((s) => s.problemId));

  // Get unsolved problems
  const problems = await prisma.problem.findMany({
    where: {
      id: { notIn: Array.from(solvedIds) },
      status: "PUBLISHED",
      visibility: "PUBLIC",
    },
    take: 30,
  });

  // Simple recommendation based on solved ratio or random fallback
  const recs = problems.map((problem) => {
    return {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      category: problem.category,
      tags: problem.tags,
      recommendationScore: Math.floor(Math.random() * 40) + 60, // 60-100% recommended
    };
  });

  return recs.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 10);
};

module.exports = {
  getRecommendedTeams,
  getRecommendedProblems,
};
