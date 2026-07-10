const prisma = require("../../config/prisma");

const auditResume = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { projects: true, skills: { include: { skill: true } } }
  });

  const skillCount = user.skills.length;
  const projectCount = user.projects.length;
  const hasBio = !!user.bio;
  const hasGithub = !!user.githubUrl;

  let score = 30;
  const suggestions = [];

  if (hasBio) { score += 15; } else { suggestions.push("Add a detailed professional biography statement."); }
  if (hasGithub) { score += 15; } else { suggestions.push("Link your active GitHub profile."); }
  if (skillCount >= 3) { score += 20; } else { suggestions.push("List at least 3 core technical skills."); }
  if (projectCount >= 2) { score += 20; } else { suggestions.push("Showcase at least 2 developer projects."); }

  return {
    score,
    rating: score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : "NEEDS_IMPROVEMENT",
    suggestions,
    skillGaps: skillCount < 4 ? ["React", "TypeScript", "Docker"] : ["GraphQL", "CI/CD Platforms"]
  };
};

const getTeamRecommendation = async (userId) => {
  const mySkills = await prisma.userSkill.findMany({
    where: { userId },
    select: { skillId: true }
  });
  const mySkillIds = mySkills.map(s => s.skillId);

  const potentialPartners = await prisma.user.findMany({
    where: {
      id: { not: userId },
      role: { not: "ADMIN" }
    },
    include: {
      skills: { include: { skill: true } }
    },
    take: 3
  });

  return potentialPartners.map(p => {
    const pSkillIds = p.skills.map(s => s.skillId);
    const complementary = p.skills.filter(s => !mySkillIds.includes(s.skillId)).map(s => s.skill.name);
    return {
      userId: p.id,
      name: p.name,
      compatibilityScore: Math.min(60 + (complementary.length * 10), 98),
      missingSkills: complementary
    };
  });
};

const explainCode = async (code, language) => {
  if (!code || !code.trim()) {
    throw new Error("No code submitted for audit");
  }

  const clean = code.trim();
  const containsLoops = clean.includes("for") || clean.includes("while");
  const containsRecursion = clean.includes("solve(") || clean.includes("def solve");

  return {
    explanation: `This is a ${language || "Javascript"} function. It processes input strings, tokenizes parameters, and performs lookups.`,
    complexity: {
      time: containsLoops ? "O(N)" : "O(1)",
      space: containsRecursion ? "O(N)" : "O(1)"
    },
    suggestions: [
      "Ensure boundary check boundaries are verified.",
      "Consider caching lookup queries to minimize loop evaluations."
    ]
  };
};

module.exports = {
  auditResume,
  getTeamRecommendation,
  explainCode
};
