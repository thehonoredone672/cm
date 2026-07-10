const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding competitive coding problems...");

  const bcrypt = require("bcryptjs");
  const adminPassword = await bcrypt.hash("adminpassword", 10);
  
  await prisma.user.upsert({
    where: { email: "admin@codematch.com" },
    update: {
      name: "System Admin",
      password: adminPassword,
      role: "ADMIN",
    },
    create: {
      name: "System Admin",
      email: "admin@codematch.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin account (admin@codematch.com / adminpassword) seeded successfully.");

  const studentPassword = await bcrypt.hash("studentpassword", 10);

  const student1 = await prisma.user.upsert({
    where: { email: "student1@codematch.com" },
    update: { name: "Jane Doe", password: studentPassword, role: "STUDENT" },
    create: { name: "Jane Doe", email: "student1@codematch.com", password: studentPassword, role: "STUDENT", bio: "Passionate about modern UI design and minimalist interfaces." }
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@codematch.com" },
    update: { name: "John Smith", password: studentPassword, role: "STUDENT" },
    create: { name: "John Smith", email: "student2@codematch.com", password: studentPassword, role: "STUDENT", bio: "Backend engineer focused on highly scalable systems." }
  });

  const student3 = await prisma.user.upsert({
    where: { email: "student3@codematch.com" },
    update: { name: "Bob Johnson", password: studentPassword, role: "STUDENT" },
    create: { name: "Bob Johnson", email: "student3@codematch.com", password: studentPassword, role: "STUDENT", bio: "Algorithms enthusiast and competitive coding wizard." }
  });

  console.log("Student accounts seeded successfully.");

  // Delete existing ones
  await prisma.submission.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.problem.deleteMany({});
  await prisma.hackathon.deleteMany({});
  await prisma.postLike.deleteMany({});
  await prisma.postComment.deleteMany({});
  await prisma.communityPost.deleteMany({});
  await prisma.bookmarkedResource.deleteMany({});
  await prisma.learningResource.deleteMany({});
  await prisma.jobApplication.deleteMany({});
  await prisma.jobListing.deleteMany({});
  await prisma.dailyChallenge.deleteMany({});

  await prisma.hackathon.createMany({
    data: [
      {
        title: "CodeMatch Global Hackathon 2026",
        description: "Build developer matchmaking utilities and collaborate in real-time.",
        date: new Date("2026-07-24"),
        link: "https://hackathon.codematch.com"
      },
      {
        title: "Web3 Developer Sprint",
        description: "Create decentralised file transfer layers and messaging portals.",
        date: new Date("2026-08-12"),
        link: "https://web3devs.org"
      },
      {
        title: "Generative AI Hackathon",
        description: "Embed custom LLM agents to provide feedback on resume profiles.",
        date: new Date("2026-09-05"),
        link: "https://aihack.devpost.com"
      }
    ]
  });
  console.log("Hackathons seeded successfully.");

  // 1. Two Sum
  const twoSum = await prisma.problem.create({
    data: {
      title: "Two Sum",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer as a comma-separated string (e.g. `0,1`).",
      category: "Arrays",
      difficulty: "EASY",
      tags: ["array", "hash-table"],
      constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
      starterCode: {
        javascript: `function solve(input) {\n  const lines = input.split('\\n');\n  const nums = lines[0].split(',').map(Number);\n  const target = Number(lines[1]);\n  \n  // Write your code here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) {\n      return [map.get(comp), i].join(',');\n    }\n    map.set(nums[i], i);\n  }\n  return "";\n}`,
        python: `def solve(input_str):\n    lines = input_str.split('\\n')\n    nums = [int(x) for x in lines[0].split(',')]\n    target = int(lines[1])\n    \n    # Write your code here\n    d = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in d:\n            return f"{d[comp]},{i}"\n        d[num] = i\n    return ""`
      },
      examples: [
        { input: "2,7,11,15\n9", output: "0,1", explanation: "Because nums[0] + nums[1] == 9, we return 0,1." },
        { input: "3,2,4\n6", output: "1,2", explanation: "Because nums[1] + nums[2] == 6, we return 1,2." }
      ],
      testCases: {
        create: [
          { input: "2,7,11,15\n9", expectedOutput: "0,1", isPublic: true },
          { input: "3,2,4\n6", expectedOutput: "1,2", isPublic: true },
          { input: "3,3\n6", expectedOutput: "0,1", isPublic: false },
          { input: "1,5,8,12,14\n20", expectedOutput: "2,3", isPublic: false }
        ]
      }
    }
  });

  // 2. Reverse String
  const reverseString = await prisma.problem.create({
    data: {
      title: "Reverse String",
      description: "Write a function that reverses a string. The input string is given as a single string from input.",
      category: "Strings",
      difficulty: "EASY",
      tags: ["string", "two-pointers"],
      constraints: "1 <= input.length <= 10^5",
      starterCode: {
        javascript: `function solve(input) {\n  // Write your code here\n  return input.split('').reverse().join('');\n}`,
        python: `def solve(input_str):\n    # Write your code here\n    return input_str[::-1]`
      },
      examples: [
        { input: "hello", output: "olleh" },
        { input: "Hannah", output: "hannaH" }
      ],
      testCases: {
        create: [
          { input: "hello", expectedOutput: "olleh", isPublic: true },
          { input: "Hannah", expectedOutput: "hannaH", isPublic: true },
          { input: "codematch", expectedOutput: "hctamedoc", isPublic: false },
          { input: "a", expectedOutput: "a", isPublic: false }
        ]
      }
    }
  });

  // 3. Fibonacci Number
  const fibonacci = await prisma.problem.create({
    data: {
      title: "Fibonacci Number",
      description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nGiven n, calculate F(n).",
      category: "Dynamic Programming",
      difficulty: "EASY",
      tags: ["math", "dynamic-programming", "recursion"],
      constraints: "0 <= n <= 30",
      starterCode: {
        javascript: `function solve(input) {\n  const n = Number(input);\n  // Write your code here\n  if (n <= 1) return n;\n  let prev2 = 0, prev1 = 1;\n  for (let i = 2; i <= n; i++) {\n    const curr = prev1 + prev2;\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return prev1;\n}`,
        python: `def solve(input_str):\n    n = int(input_str)\n    # Write your code here\n    if n <= 1: return n\n    prev2, prev1 = 0, 1\n    for i in range(2, n + 1):\n        curr = prev1 + prev2\n        prev2 = prev1\n        prev1 = curr\n    return prev1`
      },
      examples: [
        { input: "2", output: "1" },
        { input: "4", output: "3" }
      ],
      testCases: {
        create: [
          { input: "2", expectedOutput: "1", isPublic: true },
          { input: "4", expectedOutput: "3", isPublic: true },
          { input: "0", expectedOutput: "0", isPublic: false },
          { input: "10", expectedOutput: "55", isPublic: false },
          { input: "30", expectedOutput: "832040", isPublic: false }
        ]
      }
    }
  });

  console.log("Problems seeded successfully!");

  // Seed Learning Resources
  await prisma.learningResource.createMany({
    data: [
      {
        title: "Frontend Web Developer Roadmap 2026",
        description: "Step-by-step guide to becoming a modern React developer with TypeScript and Vite.",
        category: "Roadmaps",
        link: "https://roadmap.sh/frontend"
      },
      {
        title: "Prisma ORM Crash Course",
        description: "Learn how to define database schemas, manage relations, and run migrations in Node.js.",
        category: "Tutorials",
        link: "https://www.prisma.io/docs"
      },
      {
        title: "Docker Containerization Essentials",
        description: "An absolute beginners guide to containerizing Node.js servers, caching with Redis, and composing services.",
        category: "Articles",
        link: "https://docs.docker.com"
      }
    ]
  });
  console.log("Learning resources seeded successfully.");

  // Seed Job Listings
  await prisma.jobListing.createMany({
    data: [
      {
        title: "Frontend React Developer Intern",
        company: "Monochrome Labs",
        description: "Build state-of-the-art minimalist user interfaces using Vite, React, and clean CSS variables.",
        location: "Remote",
        type: "Internship",
        link: "https://careers.monochromelabs.com"
      },
      {
        title: "Junior Node Backend Engineer",
        company: "CodeMatch Inc.",
        description: "Help build secure REST APIs, optimize PostgreSQL queries, and design socket communication layers.",
        location: "San Francisco, CA",
        type: "Job",
        link: "https://careers.codematch.com"
      }
    ]
  });
  console.log("Job listings seeded successfully.");

  // Seed Daily Challenge
  await prisma.dailyChallenge.create({
    data: {
      problemId: twoSum.id,
      date: new Date()
    }
  });
  console.log("Daily challenge seeded successfully.");

  // Seed community posts by student1
  await prisma.communityPost.create({
    data: {
      authorId: student1.id,
      title: "Pro-tip: Solving Two Sum in a single pass",
      content: "Instead of doing a nested loop O(N^2) search, you can use a Javascript Map to store complements and index positions. This yields a neat O(N) runtime complexity!",
      tags: ["algorithms", "javascript"]
    }
  });
  console.log("Community posts seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
