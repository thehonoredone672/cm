const prisma = require("../../config/prisma");

const getPosts = async () => {
  return prisma.communityPost.findMany({
    include: {
      author: {
        select: { id: true, name: true, email: true }
      },
      likes: true,
      comments: {
        include: {
          author: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

const createPost = async (authorId, data) => {
  if (!data.title || !data.content) {
    throw new Error("Missing required fields: title, content");
  }

  return prisma.communityPost.create({
    data: {
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      authorId
    },
    include: {
      author: {
        select: { id: true, name: true, email: true }
      },
      likes: true,
      comments: true
    }
  });
};

const toggleLike = async (postId, userId) => {
  const existing = await prisma.postLike.findFirst({
    where: { postId, userId }
  });

  if (existing) {
    await prisma.postLike.delete({
      where: { id: existing.id }
    });
    return { liked: false };
  } else {
    await prisma.postLike.create({
      data: { postId, userId }
    });
    return { liked: true };
  }
};

const addComment = async (postId, authorId, content) => {
  if (!content || !content.trim()) {
    throw new Error("Comment content cannot be empty");
  }

  return prisma.postComment.create({
    data: {
      postId,
      authorId,
      content: content.trim()
    },
    include: {
      author: {
        select: { id: true, name: true }
      }
    }
  });
};

module.exports = {
  getPosts,
  createPost,
  toggleLike,
  addComment
};
