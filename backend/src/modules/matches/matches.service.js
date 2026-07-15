const prisma = require("../../config/prisma");

/*
|--------------------------------------------------------------------------
| Jaccard Similarity Helper
|--------------------------------------------------------------------------
*/
const calculateJaccard = (arr1, arr2) => {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const intersection = [...set1].filter((item) => set2.has(item));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.length / union.size;
};

/*
|--------------------------------------------------------------------------
| Profile Completion Helper
|--------------------------------------------------------------------------
*/
const calculateProfileCompletion = (user) => {
  let filled = 0;
  const fields = [
    user.bio, 
    user.githubUrl, 
    user.linkedinUrl, 
    user.profileImage, 
    user.college, 
    user.department,
    user.educationType
  ];
  fields.forEach(f => { if (f) filled++; });
  if (user.skills && user.skills.length > 0) filled++;
  if (user.interests && user.interests.length > 0) filled++;
  if (user.projects && user.projects.length > 0) filled++;
  
  return Math.round((filled / 10) * 100);
};

/*
|--------------------------------------------------------------------------
| Calculate Matching Telemetry Breakdown
|--------------------------------------------------------------------------
*/
const calculateMatchScore = (currentUser, otherUser) => {
  // 1. SKILLS MATCH (30%)
  const currentSkills = currentUser.skills.map(s => s.skill.name.toLowerCase());
  const otherSkills = otherUser.skills.map(s => s.skill.name.toLowerCase());
  const commonSkills = currentUser.skills
    .filter(s => otherSkills.includes(s.skill.name.toLowerCase()))
    .map(s => s.skill.name);
  const skillJaccard = calculateJaccard(currentSkills, otherSkills);
  const skillScore = skillJaccard * 30;

  // 2. INTERESTS MATCH (20%)
  const currentInterests = currentUser.interests.map(i => i.interest.name.toLowerCase());
  const otherInterests = otherUser.interests.map(i => i.interest.name.toLowerCase());
  const commonInterests = currentUser.interests
    .filter(i => otherInterests.includes(i.interest.name.toLowerCase()))
    .map(i => i.interest.name);
  const interestJaccard = calculateJaccard(currentInterests, otherInterests);
  const interestScore = interestJaccard * 20;

  // 3. PROJECTS MATCH (15%)
  const currentProjectStacks = currentUser.projects.flatMap(p => p.techStack || []).map(s => s.toLowerCase());
  const otherProjectStacks = otherUser.projects.flatMap(p => p.techStack || []).map(s => s.toLowerCase());
  const commonProjectTech = [...new Set(currentProjectStacks)].filter(s => otherProjectStacks.includes(s));
  const projectJaccard = calculateJaccard(currentProjectStacks, otherProjectStacks);
  const projectScore = projectJaccard * 15;

  // 4. CODING & LANGUAGE MATCH (15%)
  const currentLanguages = [...new Set(currentUser.submissions.map(s => s.language.toLowerCase()))];
  const otherLanguages = [...new Set(otherUser.submissions.map(s => s.language.toLowerCase()))];
  const commonLanguages = currentLanguages.filter(l => otherLanguages.includes(l));
  
  const currentSolvedIds = [...new Set(currentUser.submissions.filter(s => s.status === "ACCEPTED").map(s => s.problemId))];
  const otherSolvedIds = [...new Set(otherUser.submissions.filter(s => s.status === "ACCEPTED").map(s => s.problemId))];
  const commonSolvedProblems = currentSolvedIds.filter(id => otherSolvedIds.includes(id)).length;
  
  const langJaccard = calculateJaccard(currentLanguages, otherLanguages);
  const codingJaccard = calculateJaccard(currentSolvedIds, otherSolvedIds);
  const codingScore = (langJaccard * 0.6 + codingJaccard * 0.4) * 15;

  // 5. EDUCATION MATCH (10%)
  let educationScore = 0;
  if (currentUser.college && otherUser.college && currentUser.college.toLowerCase() === otherUser.college.toLowerCase()) {
    educationScore += 4;
  }
  if (currentUser.department && otherUser.department && currentUser.department.toLowerCase() === otherUser.department.toLowerCase()) {
    educationScore += 4;
  }
  if (currentUser.academicYear && otherUser.academicYear && currentUser.academicYear === otherUser.academicYear) {
    educationScore += 2;
  }

  // 6. PROFILE COMPLETION & ACTIVITY STATUS MATCH (10%)
  const curComplete = calculateProfileCompletion(currentUser);
  const othComplete = calculateProfileCompletion(otherUser);
  const completionMatch = 10 - Math.min(Math.abs(curComplete - othComplete) / 10, 10);

  const curActivity = (currentUser.streak || 0) + (currentUser.posts ? currentUser.posts.length : 0);
  const othActivity = (otherUser.streak || 0) + (otherUser.posts ? otherUser.posts.length : 0);
  const activityMatch = curActivity > 0 && othActivity > 0 ? Math.min(othActivity / curActivity, 1) * 10 : 0;
  const activityScore = (completionMatch * 0.5 + activityMatch * 0.5);

  const finalScore = Math.round(
    skillScore + interestScore + projectScore + codingScore + educationScore + activityScore
  );

  return {
    score: Math.max(15, Math.min(finalScore, 100)), // clamp between 15% and 100%
    breakdown: {
      skill: Math.round((skillScore / 30) * 100),
      interest: Math.round((interestScore / 20) * 100),
      project: Math.round((projectScore / 15) * 100),
      coding: Math.round((codingScore / 15) * 100),
      education: Math.round((educationScore / 10) * 100),
    },
    mutual: {
      commonSkills,
      commonInterests,
      commonLanguages,
      commonSolvedProblems,
      commonProjectTech
    }
  };
};

/*
|--------------------------------------------------------------------------
| Get Recommended Matching Students
|--------------------------------------------------------------------------
*/
const getMatches = async (userId) => {
  const users = await prisma.user.findMany({
    include: {
      skills: {
        include: {
          skill: true
        }
      },
      interests: {
        include: {
          interest: true
        }
      },
      projects: true,
      submissions: true,
      posts: true
    }
  });

  const currentUser = users.find(u => u.id === userId);
  if (!currentUser) {
    throw new Error("User not found");
  }

  const invites = await prisma.teamInvite.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }
  });

  const otherUsers = users.filter(u => u.id !== userId && u.role !== "ADMIN");

  const matches = otherUsers.map(user => {
    const matchingResult = calculateMatchScore(currentUser, user);
    const invite = invites.find(
      i => (i.senderId === userId && i.receiverId === user.id) ||
           (i.senderId === user.id && i.receiverId === userId)
    );

    const solvedProblemsCount = [...new Set(user.submissions.filter(s => s.status === "ACCEPTED").map(s => s.problemId))].length;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      college: user.college,
      department: user.department,
      academicYear: user.academicYear,
      educationType: user.educationType,
      profileImage: user.profileImage,
      streak: user.streak,
      
      // Matching Results
      compatibilityScore: matchingResult.score,
      breakdown: matchingResult.breakdown,
      mutual: matchingResult.mutual,

      // Skills and interests lists
      skills: user.skills.map(s => s.skill.name),
      interests: user.interests.map(i => i.interest.name),

      // Project and problems solved statistics
      projectsCount: user.projects.length,
      problemsSolved: solvedProblemsCount,
      profileCompletion: calculateProfileCompletion(user),
      activityStatus: user.streak > 5 ? "ACTIVE" : user.streak > 1 ? "IDLE" : "OFFLINE",

      // Invite statuses
      inviteStatus: invite ? {
        id: invite.id,
        status: invite.status,
        senderId: invite.senderId,
        receiverId: invite.receiverId,
      } : null
    };
  });

  // Sort by highest compatibility
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  return matches;
};

module.exports = {
  getMatches,
  calculateMatchScore
};