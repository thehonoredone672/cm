const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { sendInvite, acceptInvite } = require("./src/modules/teamInvites/teamInvites.service");
const { createConversation, sendMessage } = require("./src/modules/chat/chat.service");
const { createTeam, joinTeam, updateMemberRole } = require("./src/modules/teams/teams.service");
const bcrypt = require("bcryptjs");

async function runTest() {
  console.log("=== STARTING SYSTEM INTEGRATION TEST ===");
  const testEmailA = "test_user_a@codematch.com";
  const testEmailB = "test_user_b@codematch.com";

  try {
    // ── 0. Clean up any leftover test data first ──────────────────────────────
    console.log("Cleaning up stale test data...");
    const existingA = await prisma.user.findUnique({ where: { email: testEmailA } });
    const existingB = await prisma.user.findUnique({ where: { email: testEmailB } });

    if (existingA || existingB) {
      const ids = [existingA?.id, existingB?.id].filter(Boolean);
      await prisma.teamMember.deleteMany({ where: { userId: { in: ids } } });
      await prisma.teamInvite.deleteMany({ where: { OR: [{ senderId: { in: ids } }, { receiverId: { in: ids } }] } });
      await prisma.message.deleteMany({ where: { senderId: { in: ids } } });
      await prisma.conversationParticipant.deleteMany({ where: { userId: { in: ids } } });
      await prisma.team.deleteMany({ where: { leaderId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }

    // ── 1. Create Test Users ──────────────────────────────────────────────────
    console.log("1. Creating test users User A and User B...");
    const hashedPassword = await bcrypt.hash("testpassword", 10);
    const userA = await prisma.user.create({
      data: { name: "User A (Test)", email: testEmailA, password: hashedPassword }
    });
    const userB = await prisma.user.create({
      data: { name: "User B (Test)", email: testEmailB, password: hashedPassword }
    });
    console.log(`✓ Created User A (ID: ${userA.id})`);
    console.log(`✓ Created User B (ID: ${userB.id})`);

    // ── 2. Test Team Invite Flow ──────────────────────────────────────────────
    console.log("\n2. Sending collaboration invitation from User A to User B...");
    const invite = await sendInvite(userA.id, userB.id, "Let's collaborate on code!");
    console.log(`✓ Invitation created successfully. ID: ${invite.id}, Status: ${invite.status}`);
    if (invite.status !== "PENDING") throw new Error("Invite status should be PENDING");

    console.log("Accepting invitation from User B...");
    const acceptedInvite = await acceptInvite(invite.id, userB.id);
    console.log(`✓ Invitation accepted. Status: ${acceptedInvite.status}`);
    if (acceptedInvite.status !== "ACCEPTED") throw new Error("Invite status should be ACCEPTED");

    // ── 3. Test Real-time Chat Conversation ──────────────────────────────────
    console.log("\n3. Starting chat conversation between User A and User B...");
    const conv = await createConversation(userA.id, userB.id);
    console.log(`✓ Chat conversation created/retrieved. ID: ${conv.id}`);

    console.log("Sending chat message from User A to User B...");
    const msg = await sendMessage(conv.id, userA.id, "Hello User B, did you see my invite?");
    console.log(`✓ Message sent. ID: ${msg.id}, Sender: ${msg.sender.name}, Content: "${msg.text}"`);
    if (msg.senderId !== userA.id) throw new Error("Message senderId mismatch");

    // ── 4. Test Team/Group Flow ──────────────────────────────────────────────
    console.log("\n4. Creating team under User A...");
    const team = await createTeam(userA.id, { name: "A's Elite Hackers", description: "Coding team" });
    console.log(`✓ Team created. ID: ${team.id}, Join Code: ${team.joinCode}`);

    console.log("User B joining team via code...");
    const member = await joinTeam(userB.id, team.joinCode);
    console.log(`✓ User B successfully joined the team. Membership ID: ${member.id}, Role: ${member.role}`);
    if (member.role !== "MEMBER") throw new Error("Joined user role should be MEMBER");

    console.log("Leader User A promoting User B to ADMIN...");
    const promoted = await updateMemberRole(userA.id, team.id, userB.id, "ADMIN");
    console.log(`✓ User B role updated. New Role: ${promoted.role}`);
    if (promoted.role !== "ADMIN") throw new Error("User B role should be ADMIN");

    console.log("Leader User A demoting User B back to MEMBER...");
    const demoted = await updateMemberRole(userA.id, team.id, userB.id, "MEMBER");
    console.log(`✓ User B role updated. New Role: ${demoted.role}`);
    if (demoted.role !== "MEMBER") throw new Error("User B role should be MEMBER");

    // ── 5. Clean up test data ─────────────────────────────────────────────────
    console.log("\n5. Cleaning up test data from database...");
    await prisma.teamMember.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.teamInvite.deleteMany({ where: { OR: [{ senderId: { in: [userA.id, userB.id] } }, { receiverId: { in: [userA.id, userB.id] } }] } });
    await prisma.message.deleteMany({ where: { senderId: { in: [userA.id, userB.id] } } });
    await prisma.conversationParticipant.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
    await prisma.team.deleteMany({ where: { leaderId: { in: [userA.id, userB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    console.log("✓ Cleanup finished.");

    console.log("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===");

  } catch (err) {
    console.error("\n❌ INTEGRATION TEST FAILED:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
