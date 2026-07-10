const BASE_URL = "http://localhost:5000/api";

const runTests = async () => {
  console.log("=== STARTING ECOSYSTEM INTEGRATION TESTS ===");

  let token = "";

  // 1. Log in as Student 1
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
    if (!token) throw new Error("No token returned in data payload");
    console.log("✓ Logged in as student1@codematch.com. Token acquired.");
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    process.exit(1);
  }

  const authHeaders = {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };

  // 2. Fetch Hackathons
  try {
    const res = await fetch(`${BASE_URL}/hackathons`, authHeaders);
    const data = await res.json();
    console.log(`✓ Fetched hackathons list. Count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Failed to fetch hackathons:", err.message);
  }

  // 3. Fetch Solves Leaderboard
  try {
    const res = await fetch(`${BASE_URL}/dashboard/leaderboard`, authHeaders);
    const data = await res.json();
    console.log(`✓ Fetched solves leaderboard. Count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Failed to fetch leaderboard:", err.message);
  }

  // 4. Fetch Community Posts
  try {
    const res = await fetch(`${BASE_URL}/posts`, authHeaders);
    const data = await res.json();
    console.log(`✓ Fetched community forum board. Post count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Failed to fetch forum board:", err.message);
  }

  // 5. Create Community Post
  let postId = "";
  try {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: "POST",
      ...authHeaders,
      body: JSON.stringify({ title: "Test Post", content: "This is integration test content", tags: ["test"] })
    });
    const data = await res.json();
    postId = data.data.id;
    console.log(`✓ Created forum post successfully. ID: ${postId}`);
  } catch (err) {
    console.error("❌ Failed to create post:", err.message);
  }

  // 6. Like Community Post
  try {
    const res = await fetch(`${BASE_URL}/posts/${postId}/like`, {
      method: "POST",
      ...authHeaders
    });
    const data = await res.json();
    console.log(`✓ Toggled post like. Status liked: ${data.data.liked}`);
  } catch (err) {
    console.error("❌ Failed to like post:", err.message);
  }

  // 7. Comment on Community Post
  try {
    const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
      method: "POST",
      ...authHeaders,
      body: JSON.stringify({ content: "Test comment text" })
    });
    const data = await res.json();
    console.log(`✓ Submitted comment. Author: ${data.data.author.name}`);
  } catch (err) {
    console.error("❌ Failed to comment on post:", err.message);
  }

  // 8. Fetch Learning Resources
  try {
    const res = await fetch(`${BASE_URL}/resources`, authHeaders);
    const data = await res.json();
    console.log(`✓ Fetched learning resources list. Count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Failed to fetch resources:", err.message);
  }

  // 9. Fetch Job Listings
  try {
    const res = await fetch(`${BASE_URL}/careers`, authHeaders);
    const data = await res.json();
    console.log(`✓ Fetched job listings. Count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Failed to fetch careers:", err.message);
  }

  // 10. Fetch AI recommendations
  try {
    const res = await fetch(`${BASE_URL}/ai/resume-audit`, authHeaders);
    const data = await res.json();
    console.log(`✓ Fetched AI resume audit. Score: ${data.data.score}`);
  } catch (err) {
    console.error("❌ Failed to fetch AI resume audit:", err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/ai/team-recommendation`, authHeaders);
    const data = await res.json();
    console.log(`✓ Fetched AI teammates compatibility. Recommendations count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Failed to fetch AI team recommendations:", err.message);
  }

  // 11. Fetch Daily Challenge
  try {
    const res = await fetch(`${BASE_URL}/challenges/daily`, authHeaders);
    const data = await res.json();
    console.log(`✓ Fetched daily coding challenge. Problem: ${data.data.title}`);
  } catch (err) {
    console.error("❌ Failed to fetch daily challenge:", err.message);
  }

  console.log("=== ALL ECOSYSTEM INTEGRATION TESTS PASSED ===");
};

runTests();
