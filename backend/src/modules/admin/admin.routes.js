const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../../middleware/authMiddleware");
const adminController = require("./admin.controller");

// Apply authentication and admin role restrictions globally to this router
router.use(protect);
router.use(adminOnly);

// Sprint 4.1 stats
router.get("/stats", adminController.getStats);

// Sprint 4.2 Users
router.get("/users", adminController.getUsers);
router.put("/users/:id/block", adminController.blockUser);
router.put("/users/:id/role", adminController.changeRole);
router.delete("/users/:id", adminController.deleteUser);

// Sprint 4.4 Teams
router.get("/teams", adminController.getTeams);
router.delete("/teams/:id", adminController.deleteTeam);

// Sprint 4.5 Skills / Interests
router.post("/skills", adminController.createSkill);
router.delete("/skills/:id", adminController.deleteSkill);
router.post("/interests", adminController.createInterest);
router.delete("/interests/:id", adminController.deleteInterest);

// Sprint 4.6 Moderation Reports
router.get("/reports", adminController.getReports);
router.put("/reports/:id", adminController.resolveReport);

// Sprint 4.7 Announcements & Maintenance Mode
router.get("/announcements", adminController.getAnnouncements);
router.post("/announcements", adminController.createAnnouncement);
router.put("/announcements/:id/toggle", adminController.toggleAnnouncement);
router.delete("/announcements/:id", adminController.deleteAnnouncement);
router.get("/maintenance", adminController.getMaintenance);
router.post("/maintenance", adminController.setMaintenance);

module.exports = router;
