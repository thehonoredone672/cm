const {
  createInterest,
  getAllInterests,
  addInterestToUser,
  getUserInterests,
  removeInterestFromUser,
  updateUserInterest,
} = require("./interests.service");

const createInterestHandler =
  async (req, res, next) => {
    try {
      const { name, category } = req.body;

      const interest =
        await createInterest(name, category);

      res.status(201).json({
        success: true,
        data: interest,
      });
    } catch (err) {
      next(err);
    }
  };

const getInterestsHandler =
  async (req, res, next) => {
    try {
      const interests =
        await getAllInterests();

      res.status(200).json({
        success: true,
        data: interests,
      });
    } catch (err) {
      next(err);
    }
  };

const addInterestHandler =
  async (req, res, next) => {
    try {
      const { interestId, matchingWeight } = req.body;

      const result =
        await addInterestToUser(
          req.user.id,
          interestId,
          matchingWeight
        );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

const updateInterestHandler = async (req, res, next) => {
  try {
    const { interestId } = req.params;
    const { matchingWeight } = req.body;
    const result = await updateUserInterest(req.user.id, interestId, matchingWeight);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
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
  updateInterestHandler,
};