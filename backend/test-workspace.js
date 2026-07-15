const BASE_URL = "http://localhost:5000/api";

const testWorkspaceSubresources = async () => {
  console.log("=== STARTING WORKSPACE SUBRESOURCES INTEGRATION TEST ===");

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

  // 2. Create team workspace
  try {
    const createRes = await fetch(`${BASE_URL}/teams`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Telemetry Workspace Team",
        description: "Deploying workspace sub-resources validation tests.",
        maxMembers: 5
      })
    });
    const data = await createRes.json();
    if (!data.success) {
      throw new Error(`Failed to create team: ${data.message}`);
    }
    targetTeamId = data.data.id;
    console.log(`✓ Team created successfully: ${data.data.name} (${targetTeamId})`);
  } catch (err) {
    console.error("❌ Create team failed:", err.message);
    process.exit(1);
  }

  // 3. Post an announcement
  try {
    const annRes = await fetch(`${BASE_URL}/teams/${targetTeamId}/announcements`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Sprint 1 Telemetry Launch",
        content: "Deploying automated telemetry checks on our workspace."
      })
    });
    const data = await annRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Posted announcement: "${data.data.title}"`);
  } catch (err) {
    console.error("❌ Post announcement failed:", err.message);
    process.exit(1);
  }

  // 4. Create a task card
  try {
    const taskRes = await fetch(`${BASE_URL}/teams/${targetTeamId}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "Verify Prisma Migration",
        description: "Test announcements and task relationships.",
        priority: "HIGH",
        status: "TODO"
      })
    });
    const data = await taskRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Created task card: "${data.data.title}"`);
  } catch (err) {
    console.error("❌ Create task failed:", err.message);
    process.exit(1);
  }

  // 5. Upload a simulated file
  try {
    const fileRes = await fetch(`${BASE_URL}/teams/${targetTeamId}/files`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "architecture-specifications.pdf",
        fileType: "PDF",
        fileSize: 4194304, // 4MB
        fileUrl: "https://codematch-shared-bucket.s3.amazonaws.com/architecture-specifications.pdf"
      })
    });
    const data = await fileRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Uploaded file: "${data.data.name}"`);
  } catch (err) {
    console.error("❌ Upload file failed:", err.message);
    process.exit(1);
  }

  // 6. Pin a resource link
  try {
    const resRes = await fetch(`${BASE_URL}/teams/${targetTeamId}/resources`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "GitHub Repository",
        url: "https://github.com/codematch/workspace"
      })
    });
    const data = await resRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Pinned resource: "${data.data.title}"`);
  } catch (err) {
    console.error("❌ Pin resource failed:", err.message);
    process.exit(1);
  }

  // 7. Fetch team details to verify that all these relations are correctly retrieved
  try {
    const res = await fetch(`${BASE_URL}/teams/${targetTeamId}`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    
    const teamDetails = data.data;
    console.log("✓ Successfully retrieved team details containing workspace sub-resources:");
    console.log(`  - Announcements Count: ${teamDetails.announcements.length}`);
    console.log(`  - Tasks Count: ${teamDetails.tasks.length}`);
    console.log(`  - Files Count: ${teamDetails.files.length}`);
    console.log(`  - Pinned Links Count: ${teamDetails.resources.length}`);
    console.log(`  - Activity Timeline Count: ${teamDetails.activities.length}`);

    if (teamDetails.announcements.length !== 1 || teamDetails.tasks.length !== 1 || teamDetails.files.length !== 1 || teamDetails.resources.length !== 1) {
      throw new Error("Failed: Telemetry count mismatch on sub-resources!");
    }
    console.log("✓ Verification Success: Sub-resources match perfectly in database retrieval.");
  } catch (err) {
    console.error("❌ Fetch team details verification failed:", err.message);
    process.exit(1);
  }

  // 8. Cleanup delete team workspace
  try {
    const deleteRes = await fetch(`${BASE_URL}/teams/${targetTeamId}`, {
      method: "DELETE",
      headers
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success) throw new Error("Delete failed");
    console.log("✓ Cleanup: Removed team workspace from database.");
    console.log("=== ALL WORKSPACE TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
  }
};

testWorkspaceSubresources();
