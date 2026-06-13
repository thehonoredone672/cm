const {
  createInterest,
  getAllInterests,
  addInterestToUser,
  getUserInterests,
  removeInterestFromUser,
} = require("./interests.service");

const createInterestHandler =
  async (req, res) => {
    const { name } = req.body;

    const interest =
      await createInterest(name);

    res.status(201).json({
      success: true,
      data: interest,
    });
  };

const getInterestsHandler =
  async (req, res) => {
    const interests =
      await getAllInterests();

    res.status(200).json({
      success: true,
      data: interests,
    });
  };

const addInterestHandler =
  async (req, res) => {
    const { interestId } =
      req.body;

    const result =
      await addInterestToUser(
        req.user.id,
        interestId
      );

    res.status(201).json({
      success: true,
      data: result,
    });
  };

const getUserInterestsHandler =
  async (req, res) => {
    const interests =
      await getUserInterests(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: interests,
    });
  };

const removeInterestHandler =
  async (req, res) => {
    const { interestId } =
      req.params;

    await removeInterestFromUser(
      req.user.id,
      interestId
    );

    res.status(200).json({
      success: true,
      message:
        "Interest removed",
    });
  };

module.exports = {
  createInterestHandler,
  getInterestsHandler,
  addInterestHandler,
  getUserInterestsHandler,
  removeInterestHandler,
};