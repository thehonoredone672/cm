const bcrypt =
  require("bcryptjs");

const prisma =
  require("../../config/prisma");

const {
  generateToken,
} = require("../../utils/jwt");

const registerUser = async (
  name,
  email,
  password
) => {
  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingUser) {
    throw new Error(
      "User already exists"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const user =
    await prisma.user.create({
      data: {
        name,
        email,
        password:
          hashedPassword,
      },
    });

  const token =
    generateToken(user.id);

  const {
    password: _,
    ...safeUser
    } = user;

    return {
    user: safeUser,
    token,
  };
};

const loginUser = async (
  email,
  password
) => {
  const user =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (!user) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const isMatch =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isMatch) {
    throw new Error(
      "Invalid credentials"
    );
  }

  const token =
    generateToken(user.id);

  const {
    password: _,
    ...safeUser
    } = user;

    return {
    user: safeUser,
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};