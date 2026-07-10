const prisma = require("../../config/prisma");

const getJobListings = async (userId) => {
  const jobs = await prisma.jobListing.findMany({
    include: {
      appliedJobs: {
        where: { userId }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return jobs.map(job => {
    const { appliedJobs, ...clean } = job;
    return {
      ...clean,
      applicationStatus: appliedJobs[0]?.status || "UNAPPLIED"
    };
  });
};

const createJobListing = async (data) => {
  if (!data.title || !data.company || !data.description || !data.location || !data.type || !data.link) {
    throw new Error("Missing required fields: title, company, description, location, type, link");
  }

  return prisma.jobListing.create({
    data: {
      title: data.title,
      company: data.company,
      description: data.description,
      location: data.location,
      type: data.type,
      link: data.link
    }
  });
};

const applyOrSaveJob = async (jobId, userId, status) => {
  const validStatuses = ["SAVED", "APPLIED", "INTERVIEWING", "REJECTED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid job application status status.");
  }

  const existing = await prisma.jobApplication.findFirst({
    where: { jobId, userId }
  });

  if (existing) {
    return prisma.jobApplication.update({
      where: { id: existing.id },
      data: { status }
    });
  } else {
    return prisma.jobApplication.create({
      data: { jobId, userId, status }
    });
  }
};

const getApplicationTracker = async (userId) => {
  return prisma.jobApplication.findMany({
    where: { userId },
    include: {
      job: true
    },
    orderBy: { createdAt: "desc" }
  });
};

module.exports = {
  getJobListings,
  createJobListing,
  applyOrSaveJob,
  getApplicationTracker
};
