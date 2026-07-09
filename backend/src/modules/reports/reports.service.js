const prisma = require("../../config/prisma");

const fileReport = async (reporterId, { targetType, targetId, reason }) => {
  if (!["USER", "TEAM", "MESSAGE"].includes(targetType)) {
    throw new Error("Invalid target type");
  }
  if (!reason || !reason.trim()) {
    throw new Error("Reason is required");
  }

  return prisma.report.create({
    data: {
      reporterId,
      targetType,
      targetId,
      reason: reason.trim()
    }
  });
};

module.exports = {
  fileReport
};
