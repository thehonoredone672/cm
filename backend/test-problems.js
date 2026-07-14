const BASE_URL = "http://localhost:5000/api";

const testProblemsSolvingStatus = async () => {
  console.log("=== STARTING PROBLEMS SOLVE STATUS INTEGRATION TEST ===");

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

  // 2. Fetch problems list
  try {
    const res = await fetch(`${BASE_URL}/problems`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(`API returned success=false: ${data.message}`);
    }

    console.log(`✓ Fetched problems successfully. Count: ${data.data.length}`);

    // Verify presence of solveStatus parameter on each object
    const missingStatus = data.data.filter(p => !p.solveStatus);
    if (missingStatus.length > 0) {
      throw new Error(`Failed: ${missingStatus.length} problems are missing the solveStatus field!`);
    }

    console.log("✓ Verified that all problems have a solveStatus parameter.");

    // Print solved/attempted counts from response
    const solvedCount = data.data.filter(p => p.solveStatus === "SOLVED").length;
    const attemptedCount = data.data.filter(p => p.solveStatus === "ATTEMPTED").length;
    const unsolvedCount = data.data.filter(p => p.solveStatus === "UNSOLVED").length;

    console.log(`  - Solved: ${solvedCount}`);
    console.log(`  - Attempted: ${attemptedCount}`);
    console.log(`  - Unsolved: ${unsolvedCount}`);

    console.log("=== ALL PROBLEMS TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Problems integration test failed:", err.message);
    process.exit(1);
  }
};

testProblemsSolvingStatus();
