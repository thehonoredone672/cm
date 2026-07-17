const BASE_URL = "http://localhost:5000/api";

const testSearchWorkflows = async () => {
  console.log("=== STARTING SEARCH INTEGRATION TEST ===");

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

  // 2. Perform search
  try {
    const searchRes = await fetch(`${BASE_URL}/search?q=Sum`, { headers });
    const data = await searchRes.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Global search executed successfully.");
    console.log(`  - Students match: ${data.data.students.length}`);
    console.log(`  - Problems match: ${data.data.problems.length}`);
  } catch (err) {
    console.error("❌ Perform search failed:", err.message);
    process.exit(1);
  }

  // 3. Fetch autocomplete suggestions
  try {
    const sugRes = await fetch(`${BASE_URL}/search/suggestions?q=Su`, { headers });
    const data = await sugRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Suggestions retrieved. Count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Suggestions failed:", err.message);
    process.exit(1);
  }

  // 4. Fetch search history
  let historyItemId = "";
  try {
    const histRes = await fetch(`${BASE_URL}/search/history`, { headers });
    const data = await histRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Search history retrieved. Count: ${data.data.length}`);
    if (data.data.length > 0) {
      historyItemId = data.data[0].id;
    }
  } catch (err) {
    console.error("❌ Fetch history failed:", err.message);
    process.exit(1);
  }

  // 5. Delete search item
  if (historyItemId) {
    try {
      const delRes = await fetch(`${BASE_URL}/search/history/${historyItemId}`, {
        method: "DELETE",
        headers
      });
      const data = await delRes.json();
      if (!data.success) throw new Error(data.message);
      console.log(`✓ Deleted search history record: ${historyItemId}`);
    } catch (err) {
      console.error("❌ Delete search item failed:", err.message);
      process.exit(1);
    }
  }

  // 6. Clear all search history
  try {
    const clearRes = await fetch(`${BASE_URL}/search/history`, {
      method: "DELETE",
      headers
    });
    const data = await clearRes.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ All search history cleared.");
  } catch (err) {
    console.error("❌ Clear search history failed:", err.message);
    process.exit(1);
  }

  // 7. Fetch trending popular keywords
  try {
    const trendRes = await fetch(`${BASE_URL}/search/trending`, { headers });
    const data = await trendRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Trending popular keywords retrieved. Tally: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Fetch trending failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL SEARCH TESTS PASSED SUCCESSFULLY ===");
};

testSearchWorkflows();
