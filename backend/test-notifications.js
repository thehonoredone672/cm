const BASE_URL = "http://localhost:5000/api";

const testNotificationsWorkflows = async () => {
  console.log("=== STARTING NOTIFICATIONS INTEGRATION TEST ===");

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

  // 2. Fetch notification preferences
  try {
    const prefRes = await fetch(`${BASE_URL}/notifications/preferences`, { headers });
    const data = await prefRes.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Notification preferences retrieved successfully:", data.data);
  } catch (err) {
    console.error("❌ Fetch preferences failed:", err.message);
    process.exit(1);
  }

  // 3. Update preferences
  try {
    const updRes = await fetch(`${BASE_URL}/notifications/preferences`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        chat: true,
        teams: true,
        contests: true,
        problems: true,
        announcements: true,
        marketing: false
      })
    });
    const data = await updRes.json();
    if (!data.success || data.data.marketing !== false) {
      throw new Error(`Failed to update preferences: ${data.message}`);
    }
    console.log("✓ Notification preferences updated successfully.");
  } catch (err) {
    console.error("❌ Update preferences failed:", err.message);
    process.exit(1);
  }

  // 4. Fetch notifications list
  let testNotifId = "";
  try {
    const listRes = await fetch(`${BASE_URL}/notifications?page=1&limit=5`, { headers });
    const data = await listRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Notifications list retrieved. Count: ${data.data.length}`);
    if (data.data.length > 0) {
      testNotifId = data.data[0].id;
    }
  } catch (err) {
    console.error("❌ Fetch notifications failed:", err.message);
    process.exit(1);
  }

  if (testNotifId) {
    // 5. Mark notification as read
    try {
      const readRes = await fetch(`${BASE_URL}/notifications/${testNotifId}/read`, {
        method: "PATCH",
        headers
      });
      const data = await readRes.json();
      if (!data.success || data.data.isRead !== true) {
        throw new Error(`Failed to mark read: ${data.message}`);
      }
      console.log(`✓ Notification marked read: ${testNotifId}`);
    } catch (err) {
      console.error("❌ Mark read failed:", err.message);
      process.exit(1);
    }

    // 6. Delete notification
    try {
      const delRes = await fetch(`${BASE_URL}/notifications/${testNotifId}`, {
        method: "DELETE",
        headers
      });
      const data = await delRes.json();
      if (!data.success) throw new Error(data.message);
      console.log(`✓ Notification deleted successfully: ${testNotifId}`);
    } catch (err) {
      console.error("❌ Delete notification failed:", err.message);
      process.exit(1);
    }
  }

  console.log("=== ALL NOTIFICATIONS TESTS PASSED SUCCESSFULLY ===");
};

testNotificationsWorkflows();
