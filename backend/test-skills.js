const BASE_URL = "http://localhost:5000/api";

const testSkillsProficiencyWorkflow = async () => {
  console.log("=== STARTING SKILLS PROFICIENCY WORKFLOW INTEGRATION TEST ===");

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

  let targetSkillId = "";

  // 2. Fetch all skills to select one
  try {
    const res = await fetch(`${BASE_URL}/skills`, { headers });
    const data = await res.json();
    if (!data.success || data.data.length === 0) {
      throw new Error("No available skills returned in database seeding.");
    }
    // Select first skill
    targetSkillId = data.data[0].id;
    console.log(`✓ Fetched skills. Target Skill selected: ${data.data[0].name} (${targetSkillId})`);
  } catch (err) {
    console.error("❌ Fetch skills failed:", err.message);
    process.exit(1);
  }

  // 3. Remove skill if already added (pre-cleanup)
  try {
    await fetch(`${BASE_URL}/skills/user/${targetSkillId}`, {
      method: "DELETE",
      headers
    });
  } catch (e) {
    // Ignore
  }

  // 4. Add skill to user with ADVANCED and yearsOfExperience: 3
  try {
    const addRes = await fetch(`${BASE_URL}/skills/user`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        skillId: targetSkillId,
        proficiency: "ADVANCED",
        yearsOfExperience: 3
      })
    });
    const addData = await addRes.json();
    if (!addData.success) {
      throw new Error(`Failed to add skill: ${addData.message}`);
    }
    console.log(`✓ Added skill to user. Proficiency: ${addData.data.proficiency}, Experience: ${addData.data.yearsOfExperience}`);
  } catch (err) {
    console.error("❌ Add skill failed:", err.message);
    process.exit(1);
  }

  // 5. Update skill to EXPERT and yearsOfExperience: 5
  try {
    const updateRes = await fetch(`${BASE_URL}/skills/user/${targetSkillId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        proficiency: "EXPERT",
        yearsOfExperience: 5
      })
    });
    const updateData = await updateRes.json();
    if (!updateData.success) {
      throw new Error(`Failed to update skill: ${updateData.message}`);
    }
    console.log(`✓ Updated skill. Proficiency: ${updateData.data.proficiency}, Experience: ${updateData.data.yearsOfExperience}`);
  } catch (err) {
    console.error("❌ Update skill failed:", err.message);
    process.exit(1);
  }

  // 6. Verify My Skills retrieval
  try {
    const res = await fetch(`${BASE_URL}/skills/user`, { headers });
    const data = await res.json();
    const verified = data.data.find(s => s.skillId === targetSkillId);
    if (!verified) {
      throw new Error("Failed: Skill is not present in my skills list!");
    }
    if (verified.proficiency !== "EXPERT" || verified.yearsOfExperience !== 5) {
      throw new Error(`Failed: Verification values mismatch! Got ${verified.proficiency}, ${verified.yearsOfExperience} years`);
    }
    console.log(`✓ Verification Success: Persisted values in database match: EXPERT, 5 years.`);
  } catch (err) {
    console.error("❌ Verification failed:", err.message);
    process.exit(1);
  }

  // 7. Cleanup delete skill
  try {
    const deleteRes = await fetch(`${BASE_URL}/skills/user/${targetSkillId}`, {
      method: "DELETE",
      headers
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success) throw new Error("Delete failed");
    console.log("✓ Cleanup: Removed skill from user database registry.");
    console.log("=== ALL SKILLS TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
  }
};

testSkillsProficiencyWorkflow();
