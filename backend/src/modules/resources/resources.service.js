const prisma = require("../../config/prisma");

const getResources = async (userId) => {
  const items = await prisma.learningResource.findMany({
    include: {
      bookmarkedBy: {
        where: { userId }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return items.map(resource => {
    const { bookmarkedBy, ...clean } = resource;
    return {
      ...clean,
      isBookmarked: bookmarkedBy.length > 0
    };
  });
};

const createResource = async (data) => {
  if (!data.title || !data.description || !data.category || !data.link) {
    throw new Error("Missing required fields: title, description, category, link");
  }

  return prisma.learningResource.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      link: data.link
    }
  });
};

const toggleBookmark = async (resourceId, userId) => {
  const existing = await prisma.bookmarkedResource.findFirst({
    where: { resourceId, userId }
  });

  if (existing) {
    await prisma.bookmarkedResource.delete({
      where: { id: existing.id }
    });
    return { bookmarked: false };
  } else {
    await prisma.bookmarkedResource.create({
      data: { resourceId, userId }
    });
    return { bookmarked: true };
  }
};

module.exports = {
  getResources,
  createResource,
  toggleBookmark
};
