const jwt =
  require("jsonwebtoken");

const prisma =
  require("../config/prisma");

const protect =
  async (
    req,
    res,
    next
  ) => {
    try {
      const header =
        req.headers.authorization;

      if (
        !header ||
        !header.startsWith(
          "Bearer "
        )
      ) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "Not authorized",
          });
      }

      const token =
        header.split(" ")[1];

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const user =
        await prisma.user.findUnique({
          where: {
            id: decoded.userId,
          },
        });

      if (!user) {
        return res
          .status(401)
          .json({
            success: false,
            message:
              "User not found",
          });
      }

      req.user = user;

      next();
    } catch (error) {
      return res
        .status(401)
        .json({
          success: false,
          message:
            "Not authorized",
        });
    }
  };

module.exports = {
  protect,
};