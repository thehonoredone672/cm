const BASE_URL = "http://localhost:5000/api";

const testTeamsWorkflows = async () => {
  console.log("=== STARTING TEAMS WORKFLOW INTEGRATION TEST ===");

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

  let targetTeamId = "";

  // 2. Create team
  try {
    const createRes = await fetch(`${BASE_URL}/teams`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "DevOps Automated Team",
        description: "Deploying automated validation telemetry channels.",
        maxMembers: 4,
        requiredSkills: ["React", "Go"],
        requiredInterests: ["AI"]
      })
    });
    const data = await createRes.json();
    if (!data.success) {
      throw new Error(`Failed to create team: ${data.message}`);
    }
    targetTeamId = data.data.id;
    console.log(`✓ Team created successfully: ${data.data.name} (${targetTeamId})`);
    console.log(`  - Max Members: ${data.data.maxMembers}`);
    console.log(`  - Required Skills: ${JSON.stringify(data.data.requiredSkills)}`);
    console.log(`  - Required Interests: ${JSON.stringify(data.data.requiredInterests)}`);
  } catch (err) {
    console.error("❌ Create team failed:", err.message);
    process.exit(1);
  }

  // 3. Toggle recruitment
  try {
    const toggleRes = await fetch(`${BASE_URL}/teams/${targetTeamId}/recruitment`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        isRecruiting: false
      })
    });
    const data = await toggleRes.json();
    if (!data.success || data.data.isRecruiting !== false) {
      throw new Error(`Failed to toggle recruitment: ${data.message}`);
    }
    console.log("✓ Toggled recruitment successfully. Status: closed (false).");
  } catch (err) {
    console.error("❌ Toggle recruitment failed:", err.message);
    process.exit(1);
  }

  // 4. Fetch all teams to check discovery
  try {
    const res = await fetch(`${BASE_URL}/teams/all`, { headers });
    const data = await res.json();
    const found = data.data.find(t => t.id === targetTeamId);
    if (!found) {
      throw new Error("Failed: Created team is not present in all teams discovery feed!");
    }
    console.log("✓ Verification: Found team in discovery feed `/teams/all`.");
  } catch (err) {
    console.error("❌ Discovery verification failed:", err.message);
    process.exit(1);
  }

  // 5. Cleanup delete team
  try {
    const deleteRes = await fetch(`${BASE_URL}/teams/${targetTeamId}`, {
      method: "DELETE",
      headers
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success) throw new Error("Delete failed");
    console.log("✓ Cleanup: Removed team workspace from database.");
    console.log("=== ALL TEAMS TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
  }
};

testTeamsWorkflows();
