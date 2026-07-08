"use strict";

const {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject,
} = require("./projects.service");

const createProjectHandler = async (req, res, next) => {
  try {
    const project = await createProject(req.user.id, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const getProjectsHandler = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user.id;
    const projects = await getProjectsByUser(userId);
    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};

const getProjectByIdHandler = async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const updateProjectHandler = async (req, res, next) => {
  try {
    const project = await updateProject(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

const deleteProjectHandler = async (req, res, next) => {
  try {
    await deleteProject(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProjectHandler,
  getProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
  deleteProjectHandler,
};
