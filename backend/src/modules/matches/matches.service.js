const prisma =
  require("../../config/prisma");

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

  const sharedSkills =
    currentSkills.filter(
      (skill) =>
        otherSkills.includes(skill)
    );

  const sharedInterests =
    currentInterests.filter(
      (interest) =>
        otherInterests.includes(
          interest
        )
    );

  const skillScore =
    currentSkills.length === 0
      ? 0
      : (
          sharedSkills.length /
          currentSkills.length
        ) *
        70;

  const interestScore =
    currentInterests.length ===
    0
      ? 0
      : (
          sharedInterests.length /
          currentInterests.length
        ) *
        30;

  return Math.round(
    skillScore +
      interestScore
  );
};

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
      (u) => u.id === userId
    );

  const others =
    users.filter(
      (u) => u.id !== userId
    );

  const matches =
    others.map((user) => ({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
      },

      compatibilityScore:
        calculateMatchScore(
          currentUser,
          user
        ),
    }));

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