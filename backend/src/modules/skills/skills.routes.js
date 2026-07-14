const express =
  require("express");

const {
  protect,
} = require(
  "../../middleware/authMiddleware"
);

const {
  createSkillHandler,
  getSkillsHandler,
  addSkillHandler,
  removeSkillHandler,
  getUserSkillsHandler,
  updateSkillHandler
} = require("./skills.controller");

const router = express.Router();

router.post(
  "/",
  createSkillHandler
);

router.get(
  "/",
  getSkillsHandler
);

router.post(
  "/user",
  protect,
  addSkillHandler
);

router.get(
  "/user",
  protect,
  getUserSkillsHandler
);

router.patch(
  "/user/:skillId",
  protect,
  updateSkillHandler
);

router.delete(
  "/user/:skillId",
  protect,
  removeSkillHandler
);

module.exports = router;