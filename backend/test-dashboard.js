const BASE_URL = "http://localhost:5000/api";

const testDashboardSaaSMetrics = async () => {
  console.log("=== STARTING DASHBOARD SAAS METRICS INTEGRATION TEST ===");

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

  // 2. Fetch dashboard stats
  try {
    const res = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(`API returned success=false: ${data.message}`);
    }

    console.log("✓ Fetched dashboard stats successfully.");

    // Verify presence of projectsCount & messagesCount
    if (typeof data.data.projectsCount !== "number") {
      throw new Error(`Failed: projectsCount is not a number! Type is ${typeof data.data.projectsCount}`);
    }
    console.log(`✓ Verified projectsCount is present: ${data.data.projectsCount}`);

    if (typeof data.data.messagesCount !== "number") {
      throw new Error(`Failed: messagesCount is not a number! Type is ${typeof data.data.messagesCount}`);
    }
    console.log(`✓ Verified messagesCount is present: ${data.data.messagesCount}`);

    // Verify userDetails structure
    const ud = data.data.userDetails;
    if (!ud) {
      throw new Error("Failed: userDetails object is missing!");
    }
    console.log("✓ Verified userDetails checklist parameters are present:");
    console.log(`  - Bio statement: ${ud.bio || "None"}`);
    console.log(`  - GitHub link: ${ud.githubUrl || "None"}`);
    console.log(`  - LinkedIn link: ${ud.linkedinUrl || "None"}`);

    console.log("=== ALL DASHBOARD TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Dashboard integration test failed:", err.message);
    process.exit(1);
  }
};

testDashboardSaaSMetrics();
