const prisma =
  require("../../config/prisma");

const calculateJaccard =
  (arr1, arr2) => {
    const set1 =
      new Set(arr1);

    const set2 =
      new Set(arr2);

    const intersection =
      [...set1].filter(
        (item) =>
          set2.has(item)
      );

    const union =
      new Set([
        ...set1,
        ...set2,
      ]);

    if (
      union.size === 0
    ) {
      return 0;
    }

    return (
      intersection.length /
      union.size
    );
  };

const calculateMatchScore =
  (
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
        (i) =>
          i.interest.name
      );

    const otherInterests =
      otherUser.interests.map(
        (i) =>
          i.interest.name
      );

    const skillScore =
      calculateJaccard(
        currentSkills,
        otherSkills
      ) * 70;

    const interestScore =
      calculateJaccard(
        currentInterests,
        otherInterests
      ) * 30;

    return Math.round(
      skillScore +
        interestScore
    );
  };

const getMatches =
  async (userId) => {
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
        (u) =>
          u.id === userId
      );

    const otherUsers =
      users.filter(
        (u) =>
          u.id !== userId
      );

    const matches =
      otherUsers.map(
        (user) => ({
          user: {
            id: user.id,
            name: user.name,
            email:
              user.email,
            bio: user.bio,
          },

          compatibilityScore:
            calculateMatchScore(
              currentUser,
              user
            ),
        })
      );

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