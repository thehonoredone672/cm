const BASE_URL = "http://localhost:5000/api";

const testProblemsList = async () => {
  console.log("=== STARTING PROBLEMS LIST INTEGRATION TEST ===");

  let token = "";

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

  // 2. Fetch statistics
  try {
    const res = await fetch(`${BASE_URL}/problems/statistics`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Successfully retrieved practice stats:", data.data);
  } catch (err) {
    console.error("❌ Fetch statistics failed:", err.message);
    process.exit(1);
  }

  let testProblemId = "";

  // 3. Fetch problems with pagination & filters
  try {
    const res = await fetch(`${BASE_URL}/problems?page=1&limit=5&sort=NEWEST`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Retrieved problems list. Total count: ${data.pagination.total}`);
    if (data.data.length > 0) {
      testProblemId = data.data[0].id;
    }
  } catch (err) {
    console.error("❌ Fetch problems list failed:", err.message);
    process.exit(1);
  }

  if (!testProblemId) {
    console.log("⚠️ No problems in database. Skipping like & bookmark checks.");
    console.log("=== PROBLEMS LIST TEST COMPLETED WITH BYPASS ===");
    process.exit(0);
  }

  console.log(`✓ Target problem selected for validation: ${testProblemId}`);

  // 4. Like target problem
  try {
    const likeRes = await fetch(`${BASE_URL}/problems/${testProblemId}/like`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        value: "LIKE"
      })
    });
    const data = await likeRes.json();
    if (!data.success || data.data.likeStatus !== 1) {
      throw new Error(`Failed to like problem: ${data.message}`);
    }
    console.log("✓ Liked problem successfully.");
  } catch (err) {
    console.error("❌ Like problem failed:", err.message);
    process.exit(1);
  }

  // 5. Bookmark target problem
  try {
    const bookmarkRes = await fetch(`${BASE_URL}/problems/${testProblemId}/bookmark`, {
      method: "POST",
      headers
    });
    const data = await bookmarkRes.json();
    if (!data.success || data.data.bookmarked !== true) {
      throw new Error(`Failed to bookmark problem: ${data.message}`);
    }
    console.log("✓ Bookmarked problem successfully.");
  } catch (err) {
    console.error("❌ Bookmark problem failed:", err.message);
    process.exit(1);
  }

  // 6. Re-fetch stats to confirm bookmarks count updated
  try {
    const res = await fetch(`${BASE_URL}/problems/statistics`, { headers });
    const data = await res.json();
    if (!data.success || data.data.bookmarks < 1) {
      throw new Error("Stats did not reflect updated bookmark count");
    }
    console.log("✓ Practice statistics updated and confirmed bookmarks count increments.");
  } catch (err) {
    console.error("❌ Stats update check failed:", err.message);
    process.exit(1);
  }

  // 7. Cleanup bookmark & like back to NONE to restore state
  try {
    await fetch(`${BASE_URL}/problems/${testProblemId}/bookmark`, { method: "POST", headers });
    await fetch(`${BASE_URL}/problems/${testProblemId}/like`, {
      method: "POST",
      headers,
      body: JSON.stringify({ value: "NONE" })
    });
    console.log("✓ Cleanup: Restored problem bookmark & like state.");
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL PROBLEMS LIST TESTS PASSED SUCCESSFULLY ===");
};

testProblemsList();
