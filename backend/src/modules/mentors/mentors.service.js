const prisma = require("../../config/prisma");

const getMentors = async () => {
  return prisma.mentorProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });
};

const registerAsMentor = async (userId, data) => {
  if (!data.title || !data.company || !data.bio) {
    throw new Error("Missing required mentor details: title, company, bio");
  }

  // Update user role to MENTOR
  await prisma.user.update({
    where: { id: userId },
    data: { role: "MENTOR" }
  });

  return prisma.mentorProfile.create({
    data: {
      userId,
      title: data.title,
      company: data.company,
      bio: data.bio,
      skills: data.skills || []
    }
  });
};

const bookSession = async (mentorProfileId, studentId, scheduledAt) => {
  if (!scheduledAt) throw new Error("Scheduling timestamp is required");

  return prisma.mentorshipBooking.create({
    data: {
      mentorProfileId,
      studentId,
      scheduledAt: new Date(scheduledAt),
      status: "SCHEDULED"
    }
  });
};

const submitSessionFeedback = async (bookingId, rating, feedback) => {
  return prisma.mentorshipBooking.update({
    where: { id: bookingId },
    data: {
      status: "COMPLETED",
      rating: Number(rating),
      feedback
    }
  });
};

module.exports = {
  getMentors,
  registerAsMentor,
  bookSession,
  submitSessionFeedback
};
