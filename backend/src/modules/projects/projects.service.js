"use strict";

const prisma = require("../../config/prisma");

const createProject = async (userId, data) => {
  return prisma.project.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      githubUrl: data.githubUrl || null,
      liveDemoUrl: data.liveDemoUrl || null,
      techStack: data.techStack || [],
      images: data.images || [],
      featured: data.featured || false,
    },
  });
};

const getProjectsByUser = async (userId) => {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

const getProjectById = async (id) => {
  return prisma.project.findUnique({
    where: { id },
  });
};

const updateProject = async (id, userId, data) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Not authorized");

  return prisma.project.update({
    where: { id },
    data: {
      title: data.title !== undefined ? data.title : undefined,
      description: data.description !== undefined ? data.description : undefined,
      githubUrl: data.githubUrl !== undefined ? data.githubUrl : undefined,
      liveDemoUrl: data.liveDemoUrl !== undefined ? data.liveDemoUrl : undefined,
      techStack: data.techStack !== undefined ? data.techStack : undefined,
      images: data.images !== undefined ? data.images : undefined,
      featured: data.featured !== undefined ? data.featured : undefined,
    },
  });
};

const deleteProject = async (id, userId) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Not authorized");

  return prisma.project.delete({
    where: { id },
  });
};

module.exports = {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject,
};
