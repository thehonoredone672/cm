const BASE_URL = "http://localhost:5000/api";

const testLeaderboardWorkflows = async () => {
  console.log("=== STARTING LEADERBOARD INTEGRATION TEST ===");

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

  // 2. Sync XP
  try {
    const syncRes = await fetch(`${BASE_URL}/leaderboard/sync`, {
      method: "POST",
      headers
    });
    const data = await syncRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ XP synchronized successfully. Level: ${data.data.user.level}, XP: ${data.data.user.xp}`);
  } catch (err) {
    console.error("❌ Sync XP failed:", err.message);
    process.exit(1);
  }

  // 3. Fetch statistics
  try {
    const statsRes = await fetch(`${BASE_URL}/leaderboard/stats`, { headers });
    const data = await statsRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ User profile statistics retrieved. Badges count: ${data.data.badges.length}`);
    console.log(`  - Acceptance Rate: ${data.data.acceptanceRate}%`);
  } catch (err) {
    console.error("❌ Fetch stats failed:", err.message);
    process.exit(1);
  }

  // 4. Fetch global leaderboard list
  try {
    const leadRes = await fetch(`${BASE_URL}/leaderboard?page=1&limit=5`, { headers });
    const data = await leadRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Global leaderboard retrieved. Entries count: ${data.data.length}`);
    if (data.data.length > 0) {
      console.log(`  - Rank 1: ${data.data[0].name} with ${data.data[0].xp} XP`);
    }
  } catch (err) {
    console.error("❌ Fetch leaderboard failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL LEADERBOARD TESTS PASSED SUCCESSFULLY ===");
};

testLeaderboardWorkflows();
