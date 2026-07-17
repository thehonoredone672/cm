const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "http://localhost:5000/api";

const testChatWorkflows = async () => {
  console.log("=== STARTING CHAT INTEGRATION TEST ===");

  let token = "";
  let userId = "";

  // 1. Log in as student1
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "student1@codematch.com",
        password: "studentpassword"
      })
    });
    const data = await loginRes.json();
    token = data.data.token;
    userId = data.data.user.id;
    if (!token) throw new Error("No token returned");
    console.log("✓ Logged in as student1@codematch.com. Token acquired.");
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    process.exit(1);
  }

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  let targetTeammateId = "";

  // Pick first student from matches list
  try {
    const allUsersRes = await fetch(`${BASE_URL}/matches`, { headers });
    const matchesData = await allUsersRes.json();
    if (matchesData.success && matchesData.data.length > 0) {
      targetTeammateId = matchesData.data[0].id;
    }
    if (!targetTeammateId) {
      throw new Error("No target users found to start DM with.");
    }
    console.log(`✓ Target Teammate selected: (${targetTeammateId})`);
  } catch (err) {
    console.error("❌ Teammate search failed:", err.message);
    process.exit(1);
  }

  // Inject Teammate status using Prisma
  try {
    const existing = await prisma.teamInvite.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetTeammateId },
          { senderId: targetTeammateId, receiverId: userId }
        ]
      }
    });

    if (!existing) {
      await prisma.teamInvite.create({
        data: {
          senderId: userId,
          receiverId: targetTeammateId,
          status: "ACCEPTED",
          message: "Seeded for validation tests"
        }
      });
    } else if (existing.status !== "ACCEPTED") {
      await prisma.teamInvite.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED" }
      });
    }
    console.log("✓ Seeded teammate relationship between users.");
  } catch (err) {
    console.error("❌ Seed teammate failed:", err.message);
    process.exit(1);
  }

  let conversationId = "";

  // 3. Start a conversation
  try {
    const convRes = await fetch(`${BASE_URL}/chat/conversation`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId: targetTeammateId
      })
    });
    const data = await convRes.json();
    if (!data.success) throw new Error(data.message);
    conversationId = data.data.id;
    console.log(`✓ Conversation established successfully: ${conversationId}`);
  } catch (err) {
    console.error("❌ Start conversation failed:", err.message);
    process.exit(1);
  }

  let testMessageId = "";

  // 4. Send a message
  try {
    const msgRes = await fetch(`${BASE_URL}/chat/message/${conversationId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: "Sprint 1 launching. Standard chat text message."
      })
    });
    const data = await msgRes.json();
    if (!data.success) throw new Error(data.message);
    testMessageId = data.data.id;
    console.log(`✓ Sent message. ID: ${testMessageId}`);
  } catch (err) {
    console.error("❌ Send message failed:", err.message);
    process.exit(1);
  }

  // 5. Send a code snippet
  try {
    const codeRes = await fetch(`${BASE_URL}/chat/message/${conversationId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: "const check = () => console.log('success');",
        codeLanguage: "javascript"
      })
    });
    const data = await codeRes.json();
    if (!data.success || data.data.codeLanguage !== "javascript") {
      throw new Error(`Failed to verify code snippet language: ${data.message}`);
    }
    console.log(`✓ Sent code snippet message successfully. Language: ${data.data.codeLanguage}`);
  } catch (err) {
    console.error("❌ Send code snippet failed:", err.message);
    process.exit(1);
  }

  // 6. Add reaction 👍 to message
  try {
    const reactRes = await fetch(`${BASE_URL}/chat/message/${conversationId}/${testMessageId}/reactions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        emoji: "👍"
      })
    });
    const data = await reactRes.json();
    if (!data.success || data.data.emoji !== "👍") {
      throw new Error(`Failed to add reaction: ${data.message}`);
    }
    console.log(`✓ Added reaction 👍 to message ${testMessageId}`);
  } catch (err) {
    console.error("❌ Add reaction failed:", err.message);
    process.exit(1);
  }

  // 7. Edit the message text
  try {
    const editRes = await fetch(`${BASE_URL}/chat/message/${conversationId}/${testMessageId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        text: "Edited Text message."
      })
    });
    const data = await editRes.json();
    if (!data.success || data.data.text !== "Edited Text message." || data.data.isEdited !== true) {
      throw new Error(`Failed to edit message: ${data.message}`);
    }
    console.log(`✓ Edited message successfully. Text: "${data.data.text}", isEdited: ${data.data.isEdited}`);
  } catch (err) {
    console.error("❌ Edit message failed:", err.message);
    process.exit(1);
  }

  // 8. Delete the message
  try {
    const deleteRes = await fetch(`${BASE_URL}/chat/message/${conversationId}/${testMessageId}`, {
      method: "DELETE",
      headers
    });
    const data = await deleteRes.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Deleted message successfully (soft-deletion).");
  } catch (err) {
    console.error("❌ Delete message failed:", err.message);
    process.exit(1);
  }

  // 9. Pin conversation
  try {
    const pinRes = await fetch(`${BASE_URL}/chat/conversation/${conversationId}/pin`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        isPinned: true
      })
    });
    const data = await pinRes.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Verified pinConversation toggle works.");
  } catch (err) {
    console.error("❌ Pin conversation failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL CHAT TESTS PASSED SUCCESSFULLY ===");
  prisma.$disconnect();
};

testChatWorkflows();
