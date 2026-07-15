const BASE_URL = "http://localhost:5000/api";

const testMatchesCalculationWorkflow = async () => {
  console.log("=== STARTING MATCHES CALCULATION INTEGRATION TEST ===");

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

  // 2. Fetch matches
  try {
    const res = await fetch(`${BASE_URL}/matches`, { headers });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(`API returned success=false: ${data.message}`);
    }

    console.log(`✓ Fetched matches list. Total discovered matches: ${data.data.length}`);

    if (data.data.length > 0) {
      const topMatch = data.data[0];
      console.log(`✓ Investigating top match candidate: ${topMatch.name}`);
      console.log(`  - Compatibility Match Score: ${topMatch.compatibilityScore}%`);
      
      // Verify breakdown parameters
      const bd = topMatch.breakdown;
      if (!bd) {
        throw new Error("Failed: Match breakdown object is missing!");
      }
      console.log("✓ Checked Score breakdown categories:");
      console.log(`  - Skill Match: ${bd.skill}%`);
      console.log(`  - Interest Match: ${bd.interest}%`);
      console.log(`  - Project Match: ${bd.project}%`);
      console.log(`  - Coding Match: ${bd.coding}%`);
      console.log(`  - Education Match: ${bd.education}%`);

      // Verify mutual items
      const mutual = topMatch.mutual;
      if (!mutual) {
        throw new Error("Failed: Mutual interests object is missing!");
      }
      console.log("✓ Checked Mutual telemetry metrics:");
      console.log(`  - Common Skills count: ${mutual.commonSkills.length}`);
      console.log(`  - Common Interests count: ${mutual.commonInterests.length}`);
    } else {
      console.log("⚠️ No other students found to match in seeded registry.");
    }

    console.log("=== ALL MATCHES TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Matches integration test failed:", err.message);
    process.exit(1);
  }
};

testMatchesCalculationWorkflow();
