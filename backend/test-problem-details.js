const BASE_URL = "http://localhost:5000/api";

const testProblemDetailsWorkflows = async () => {
  console.log("=== STARTING PROBLEM DETAILS INTEGRATION TEST ===");

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

  let testProblemId = "";

  // Get first problem ID
  try {
    const res = await fetch(`${BASE_URL}/problems?page=1&limit=1`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (data.data.length > 0) {
      testProblemId = data.data[0].id;
    }
  } catch (err) {
    console.error("❌ Fetch problems list failed:", err.message);
    process.exit(1);
  }

  if (!testProblemId) {
    console.log("⚠️ No problems in database. Skipping details checks.");
    console.log("=== PROBLEM DETAILS TEST COMPLETED WITH BYPASS ===");
    process.exit(0);
  }

  console.log(`✓ Target problem selected for validation: ${testProblemId}`);

  // 2. Fetch problem details
  try {
    const res = await fetch(`${BASE_URL}/problems/${testProblemId}`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Problem details fetched. Title: "${data.data.title}"`);
    console.log(`  - Related problems count: ${data.data.relatedProblems.length}`);
  } catch (err) {
    console.error("❌ Fetch problem details failed:", err.message);
    process.exit(1);
  }

  // 3. Post a discussion thread
  try {
    const discRes = await fetch(`${BASE_URL}/problems/${testProblemId}/discussions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Testing solution complexities",
        content: "What is the space complexity of the recursive stack in worst case?"
      })
    });
    const data = await discRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Posted discussion thread: "${data.data.title}"`);
  } catch (err) {
    console.error("❌ Post discussion failed:", err.message);
    process.exit(1);
  }

  // 4. Get discussions list
  try {
    const discListRes = await fetch(`${BASE_URL}/problems/${testProblemId}/discussions`, { headers });
    const data = await discListRes.json();
    if (!data.success || data.data.length === 0) {
      throw new Error(`Failed to retrieve discussions: ${data.message}`);
    }
    console.log(`✓ Retrieved discussions list. Count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Get discussions failed:", err.message);
    process.exit(1);
  }

  // 5. Post a problem report
  try {
    const repRes = await fetch(`${BASE_URL}/problems/${testProblemId}/reports`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        reason: "Typo in description example 2 explanation."
      })
    });
    const data = await repRes.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Posted problem report successfully.");
  } catch (err) {
    console.error("❌ Post report failed:", err.message);
    process.exit(1);
  }

  // 6. Get problem editorial
  try {
    const edRes = await fetch(`${BASE_URL}/problems/${testProblemId}/editorial`, { headers });
    const data = await edRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Retrieved editorial successfully. Locked status: ${data.data.isLocked}`);
  } catch (err) {
    console.error("❌ Get editorial failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL PROBLEM DETAILS TESTS PASSED SUCCESSFULLY ===");
};

testProblemDetailsWorkflows();
