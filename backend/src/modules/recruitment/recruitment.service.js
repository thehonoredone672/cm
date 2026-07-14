const prisma = require("../../config/prisma");

const registerCompany = async (userId, data) => {
  if (!data.name || !data.description || !data.website) {
    throw new Error("Missing required company details: name, description, website");
  }

  // Update user role to RECRUITER
  await prisma.user.update({
    where: { id: userId },
    data: { role: "RECRUITER" }
  });

  return prisma.companyProfile.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      website: data.website
    }
  });
};

const createRecruitmentDrive = async (recruiterId, data) => {
  const company = await prisma.companyProfile.findUnique({
    where: { userId: recruiterId }
  });

  if (!company) throw new Error("Only registered companies can schedule recruitment drives");

  return prisma.recruitmentDrive.create({
    data: {
      companyId: company.id,
      collegeId: data.collegeId || null,
      title: data.title,
      date: new Date(data.date),
      status: "ACTIVE"
    }
  });
};

const getRecruitmentDrives = async () => {
  return prisma.recruitmentDrive.findMany({
    include: {
      company: true,
      college: true,
      candidates: {
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }
    },
    orderBy: { date: "asc" }
  });
};

const applyToRecruitmentDrive = async (driveId, userId) => {
  return prisma.candidateApplication.create({
    data: {
      driveId,
      userId,
      status: "APPLIED"
    }
  });
};

const advanceCandidateStatus = async (appId, status, score, offerLetterUrl) => {
  return prisma.candidateApplication.update({
    where: { id: appId },
    data: {
      status,
      score: score !== undefined ? Number(score) : undefined,
      offerLetterUrl: offerLetterUrl || undefined
    }
  });
};

module.exports = {
  registerCompany,
  createRecruitmentDrive,
  getRecruitmentDrives,
  applyToRecruitmentDrive,
  advanceCandidateStatus
};
