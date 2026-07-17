const BASE_URL = "http://localhost:5000/api";

const testSubmissionsAndSolutions = async () => {
  console.log("=== STARTING SUBMISSIONS AND SOLUTIONS INTEGRATION TEST ===");

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

  // 2. Retrieve submissions statistics
  try {
    const statsRes = await fetch(`${BASE_URL}/submissions/stats`, { headers });
    const data = await statsRes.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Submissions statistics retrieved successfully:", data.data);
  } catch (err) {
    console.error("❌ Submissions stats failed:", err.message);
    process.exit(1);
  }

  // 3. Retrieve user submissions history list
  try {
    const historyRes = await fetch(`${BASE_URL}/submissions?page=1&limit=5&sort=NEWEST`, { headers });
    const data = await historyRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Submissions history retrieved. Count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Submissions history failed:", err.message);
    process.exit(1);
  }

  // Get a problem ID to query solutions
  let testProblemId = "";
  try {
    const res = await fetch(`${BASE_URL}/problems?page=1&limit=1`, { headers });
    const data = await res.json();
    if (data.data.length > 0) {
      testProblemId = data.data[0].id;
    }
  } catch (err) {
    console.error("❌ Fetch problem failed:", err.message);
    process.exit(1);
  }

  if (!testProblemId) {
    console.log("⚠️ No problems in database. Skipping solutions checks.");
    console.log("=== TESTS COMPLETED WITH BYPASS ===");
    process.exit(0);
  }

  // 4. Retrieve official solutions for the problem
  try {
    const solRes = await fetch(`${BASE_URL}/solutions?problemId=${testProblemId}`, { headers });
    const data = await solRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Solutions retrieved for problem ${testProblemId}. Count: ${data.data.length}`);
    if (data.data.length > 0) {
      console.log(`  - Title: "${data.data[0].title}"`);
      console.log(`  - Time Complexity: ${data.data[0].complexity?.time}`);
    }
  } catch (err) {
    console.error("❌ Solutions query failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL SUBMISSIONS AND SOLUTIONS TESTS PASSED SUCCESSFULLY ===");
};

testSubmissionsAndSolutions();
