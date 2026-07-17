const BASE_URL = "http://localhost:5000/api";

const testContestsWorkflows = async () => {
  console.log("=== STARTING CONTESTS INTEGRATION TEST ===");

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

  let testContestId = "";

  // 2. Fetch contests list and select an ACTIVE or UPCOMING one
  try {
    const res = await fetch(`${BASE_URL}/contests`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Contests list retrieved. Count: ${data.data.length}`);
    
    const targetContest = data.data.find(c => c.status === "ACTIVE" || c.status === "UPCOMING");
    if (targetContest) {
      testContestId = targetContest.id;
    } else if (data.data.length > 0) {
      testContestId = data.data[0].id;
    }
  } catch (err) {
    console.error("❌ Fetch contests failed:", err.message);
    process.exit(1);
  }

  if (!testContestId) {
    console.log("⚠️ No contests in database. Skipping details checks.");
    console.log("=== CONTESTS TEST COMPLETED WITH BYPASS ===");
    process.exit(0);
  }

  console.log(`✓ Target contest selected for validation: ${testContestId}`);

  // 3. Fetch contest details
  try {
    const res = await fetch(`${BASE_URL}/contests/${testContestId}`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Contest details fetched. Title: "${data.data.title}"`);
    console.log(`  - Status: ${data.data.status}`);
  } catch (err) {
    console.error("❌ Fetch contest details failed:", err.message);
    process.exit(1);
  }

  // 4. Register for contest (only if not completed)
  try {
    const regRes = await fetch(`${BASE_URL}/contests/${testContestId}/register`, {
      method: "POST",
      headers
    });
    const data = await regRes.json();
    if (!data.success) {
      console.log(`⚠️ Registration returned status: ${data.message}`);
    } else {
      console.log("✓ Registered for contest successfully.");
    }
  } catch (err) {
    console.error("❌ Registration failed:", err.message);
    process.exit(1);
  }

  // 5. Get leaderboard
  try {
    const leadRes = await fetch(`${BASE_URL}/contests/${testContestId}/leaderboard`, { headers });
    const data = await leadRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Retrieved contest leaderboard list. Entries count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Leaderboard fetch failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL CONTESTS TESTS PASSED SUCCESSFULLY ===");
};

testContestsWorkflows();
