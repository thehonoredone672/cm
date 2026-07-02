const prisma = require("../../config/prisma");

/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

const calculateJaccard = (arr1, arr2) => {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  const intersection = [...set1].filter((item) =>
    set2.has(item)
  );

  const union = new Set([
    ...set1,
    ...set2,
  ]);

  if (union.size === 0) {
    return 0;
  }

  return (
    intersection.length /
    union.size
  );
};

const getCommonItems = (
  arr1,
  arr2
) => {
  return [...new Set(arr1)].filter(
    (item) =>
      arr2.includes(item)
  );
};

/*
|--------------------------------------------------------------------------
| Match Score
|--------------------------------------------------------------------------
*/

const calculateMatchScore = (
  currentUser,
  otherUser
) => {
  const currentSkills =
    currentUser.skills.map(
      (s) => s.skill.name
    );

  const otherSkills =
    otherUser.skills.map(
      (s) => s.skill.name
    );

  const currentInterests =
    currentUser.interests.map(
      (i) => i.interest.name
    );

  const otherInterests =
    otherUser.interests.map(
      (i) => i.interest.name
    );

  const commonSkills =
    getCommonItems(
      currentSkills,
      otherSkills
    );

  const commonInterests =
    getCommonItems(
      currentInterests,
      otherInterests
    );

  let score = 0;

  /*
  -------------------------
  Skills
  -------------------------
  */

  score +=
    calculateJaccard(
      currentSkills,
      otherSkills
    ) * 50;

  /*
  -------------------------
  Interests
  -------------------------
  */

  score +=
    calculateJaccard(
      currentInterests,
      otherInterests
    ) * 30;

  /*
  -------------------------
  Department
  -------------------------
  */

  if (
    currentUser.department &&
    otherUser.department &&
    currentUser.department ===
      otherUser.department
  ) {
    score += 10;
  }

  /*
  -------------------------
  Academic Year
  -------------------------
  */

  if (
    currentUser.academicYear &&
    otherUser.academicYear &&
    currentUser.academicYear ===
      otherUser.academicYear
  ) {
    score += 5;
  }

  /*
  -------------------------
  College
  -------------------------
  */

  if (
    currentUser.college &&
    otherUser.college &&
    currentUser.college ===
      otherUser.college
  ) {
    score += 5;
  }

  return {
    score: Math.round(score),

    commonSkills,

    commonInterests,
  };
};

/*
|--------------------------------------------------------------------------
| Get Matches
|--------------------------------------------------------------------------
*/

const getMatches = async (
  userId
) => {
  const users =
    await prisma.user.findMany({
      include: {
        skills: {
          include: {
            skill: true,
          },
        },

        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

  const currentUser =
    users.find(
      (user) =>
        user.id === userId
    );

  if (!currentUser) {
    throw new Error(
      "User not found"
    );
  }

  const otherUsers =
    users.filter(
      (user) =>
        user.id !== userId
    );

  const matches =
    otherUsers.map((user) => {
      const result =
        calculateMatchScore(
          currentUser,
          user
        );

      return {
        id: user.id,

        name: user.name,

        email: user.email,

        bio: user.bio,

        college:
          user.college,

        department:
          user.department,

        academicYear:
          user.academicYear,

        profileImage:
          user.profileImage,

        compatibilityScore:
          result.score,

        commonSkills:
          result.commonSkills,

        commonInterests:
          result.commonInterests,

        totalSkills:
          user.skills.length,

        totalInterests:
          user.interests.length,
      };
    });

  matches.sort(
    (a, b) =>
      b.compatibilityScore -
      a.compatibilityScore
  );

  return matches;
};

module.exports = {
  getMatches,
};