const prisma = require("../../config/prisma");

const getColleges = async () => {
  return prisma.college.findMany({
    include: {
      users: { select: { id: true, name: true, role: true } }
    },
    orderBy: { name: "asc" }
  });
};

const registerCollege = async (name, domain) => {
  if (!name) throw new Error("College name is required");
  return prisma.college.create({
    data: { name, domain }
  });
};

const getCollegeAnalytics = async (collegeId) => {
  const college = await prisma.college.findUnique({
    where: { id: collegeId },
    include: {
      users: {
        include: {
          submissions: { where: { status: "ACCEPTED" } }
        }
      },
      drives: {
        include: {
          candidates: true
        }
      }
    }
  });

  if (!college) throw new Error("College not found");

  const verifiedStudents = college.users.filter(u => u.role === "STUDENT").length;
  const facultyCount = college.users.filter(u => u.role === "FACULTY").length;
  
  // Calculate total coding solves in college
  let totalSolves = 0;
  college.users.forEach(u => {
    totalSolves += u.submissions.length;
  });

  // Calculate placements
  let placedCount = 0;
  college.drives.forEach(d => {
    placedCount += d.candidates.filter(c => c.status === "OFFERED").length;
  });

  return {
    collegeName: college.name,
    verifiedStudents,
    facultyCount,
    totalSolves,
    placedCount,
    drivesCount: college.drives.length
  };
};

module.exports = {
  getColleges,
  registerCollege,
  getCollegeAnalytics
};
