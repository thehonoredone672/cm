const {
  getMatches,
} = require(
  "./matches.service"
);

const getMatchesHandler =
  async (req, res) => {
    const matches =
      await getMatches(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: matches,
    });
  };

module.exports = {
  getMatchesHandler,
};