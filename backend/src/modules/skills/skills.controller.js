const {
  createSkill,
  getAllSkills,
  addSkillToUser,
  removeSkillFromUser,
  getUserSkills,
  updateUserSkill,
} = require("./skills.service");

const createSkillHandler =
  async (req, res) => {
    const { name } = req.body;

    const skill =
      await createSkill(name);

    res.status(201).json({
      success: true,
      data: skill,
    });
  };

const getSkillsHandler =
  async (req, res) => {
    const skills =
      await getAllSkills();

    res.status(200).json({
      success: true,
      data: skills,
    });
  };

const addSkillHandler =
  async (req, res, next) => {
    try {
      const { skillId, proficiency, yearsOfExperience } = req.body;

      const result =
        await addSkillToUser(
          req.user.id,
          skillId,
          { proficiency, yearsOfExperience }
        );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

const updateSkillHandler = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const { proficiency, yearsOfExperience } = req.body;
    const result = await updateUserSkill(req.user.id, skillId, { proficiency, yearsOfExperience });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const removeSkillHandler =
  async (req, res) => {
    const { skillId } = req.params;

    await removeSkillFromUser(
      req.user.id,
      skillId
    );

    res.status(200).json({
      success: true,
      message:
        "Skill removed",
    });
  };

const getUserSkillsHandler =
  async (req, res) => {
    const skills =
      await getUserSkills(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: skills,
    });
  };

module.exports = {
  createSkillHandler,
  getSkillsHandler,
  addSkillHandler,
  removeSkillHandler,
  getUserSkillsHandler,
  updateSkillHandler
};