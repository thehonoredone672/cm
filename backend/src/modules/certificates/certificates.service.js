const prisma = require("../../config/prisma");

const getCertificates = async (userId) => {
  return prisma.certificate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};

const validateCertificate = async (code) => {
  if (!code) throw new Error("Certificate code is required");
  const cert = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });

  if (!cert) throw new Error("Certificate not found / invalid verification code");
  return cert;
};

module.exports = {
  getCertificates,
  validateCertificate
};
