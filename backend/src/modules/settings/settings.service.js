"use strict";

const prisma = require("../../config/prisma");
const bcrypt = require("bcryptjs");

const getSettingsProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      profileImage: true,
      college: true,
      department: true,
      academicYear: true,
      githubUrl: true,
      linkedinUrl: true,
      leetcodeProfile: true
    }
  });
};

const updateSettingsProfile = async (userId, data) => {
  const { name, bio, profileImage, college, department, academicYear, githubUrl, linkedinUrl, leetcodeProfile } = data;
  return prisma.user.update({
    where: { id: userId },
    data: {
      name,
      bio,
      profileImage,
      college,
      department,
      academicYear: Number(academicYear) || null,
      githubUrl,
      linkedinUrl,
      leetcodeProfile
    }
  });
};

const getSettingsPreferences = async (userId) => {
  let prefs = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!prefs) {
    prefs = await prisma.userPreferences.create({
      data: { userId }
    });
  }
  return prefs;
};

const updateSettingsPreferences = async (userId, data) => {
  const { theme, accentColor, fontSize, editorLanguage, editorTheme, editorFontSize, editorTabSize, editorWordWrap, editorAutoSave, editorLineNumbers, editorMinimap } = data;
  return prisma.userPreferences.upsert({
    where: { userId },
    update: {
      theme,
      accentColor,
      fontSize: Number(fontSize) || undefined,
      editorLanguage,
      editorTheme,
      editorFontSize: Number(editorFontSize) || undefined,
      editorTabSize: Number(editorTabSize) || undefined,
      editorWordWrap,
      editorAutoSave,
      editorLineNumbers,
      editorMinimap
    },
    create: {
      userId,
      theme,
      accentColor,
      fontSize: Number(fontSize) || 14,
      editorLanguage,
      editorTheme,
      editorFontSize: Number(editorFontSize) || 14,
      editorTabSize: Number(editorTabSize) || 4,
      editorWordWrap,
      editorAutoSave,
      editorLineNumbers,
      editorMinimap
    }
  });
};

const getSettingsPrivacy = async (userId) => {
  let privacy = await prisma.userPrivacy.findUnique({ where: { userId } });
  if (!privacy) {
    privacy = await prisma.userPrivacy.create({
      data: { userId }
    });
  }
  return privacy;
};

const updateSettingsPrivacy = async (userId, data) => {
  const { publicProfile, showEmail, showCollege, showGithub, showStatistics, showProjects, showTeams } = data;
  return prisma.userPrivacy.upsert({
    where: { userId },
    update: { publicProfile, showEmail, showCollege, showGithub, showStatistics, showProjects, showTeams },
    create: { userId, publicProfile, showEmail, showCollege, showGithub, showStatistics, showProjects, showTeams }
  });
};

const getActiveSessions = async (userId) => {
  return prisma.activeSession.findMany({
    where: { userId },
    orderBy: { lastActive: "desc" }
  });
};

const terminateActiveSession = async (id, userId) => {
  const session = await prisma.activeSession.findUnique({ where: { id } });
  if (!session) throw new Error("Session not found");
  if (session.userId !== userId) throw new Error("Unauthorized");

  await prisma.activeSession.delete({ where: { id } });
  return { id };
};

const getLoginHistory = async (userId) => {
  return prisma.loginHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 15
  });
};

const deleteUserAccount = async (userId) => {
  await prisma.user.delete({ where: { id: userId } });
  return { success: true };
};

module.exports = {
  getSettingsProfile,
  updateSettingsProfile,
  getSettingsPreferences,
  updateSettingsPreferences,
  getSettingsPrivacy,
  updateSettingsPrivacy,
  getActiveSessions,
  terminateActiveSession,
  getLoginHistory,
  deleteUserAccount
};
