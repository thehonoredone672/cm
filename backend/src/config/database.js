const prisma = require("./prisma");

const connectDatabase = async () => {
  try {
    await prisma.$connect();

    console.log(
      "PostgreSQL connected successfully"
    );
  } catch (error) {
    console.error(
      "Database connection failed:",
      error
    );

    process.exit(1);
  }
};

module.exports = connectDatabase;