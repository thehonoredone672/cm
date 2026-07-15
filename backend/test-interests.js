const BASE_URL = "http://localhost:5000/api";

const testInterestsMatchingWeightsWorkflow = async () => {
  console.log("=== STARTING INTERESTS WEIGHTS INTEGRATION TEST ===");

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

  let targetInterestId = "";

  // 2. Fetch all interests
  try {
    const res = await fetch(`${BASE_URL}/interests`, { headers });
    const data = await res.json();
    if (!data.success || data.data.length === 0) {
      throw new Error("No available interests returned in database seeding.");
    }
    // Select first interest
    targetInterestId = data.data[0].id;
    console.log(`✓ Fetched interests. Target Interest selected: ${data.data[0].name} (${targetInterestId})`);
  } catch (err) {
    console.error("❌ Fetch interests failed:", err.message);
    process.exit(1);
  }

  // 3. Remove interest if already added (pre-cleanup)
  try {
    await fetch(`${BASE_URL}/interests/user/${targetInterestId}`, {
      method: "DELETE",
      headers
    });
  } catch (e) {
    // Ignore
  }

  // 4. Add interest to user with matchingWeight: 4
  try {
    const addRes = await fetch(`${BASE_URL}/interests/user`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        interestId: targetInterestId,
        matchingWeight: 4
      })
    });
    const addData = await addRes.json();
    if (!addData.success) {
      throw new Error(`Failed to add interest: ${addData.message}`);
    }
    console.log(`✓ Added interest to user. Weight: ${addData.data.matchingWeight}`);
  } catch (err) {
    console.error("❌ Add interest failed:", err.message);
    process.exit(1);
  }

  // 5. Update interest matchingWeight to 5
  try {
    const updateRes = await fetch(`${BASE_URL}/interests/user/${targetInterestId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        matchingWeight: 5
      })
    });
    const updateData = await updateRes.json();
    if (!updateData.success) {
      throw new Error(`Failed to update interest: ${updateData.message}`);
    }
    console.log(`✓ Updated interest. Weight: ${updateData.data.matchingWeight}`);
  } catch (err) {
    console.error("❌ Update interest failed:", err.message);
    process.exit(1);
  }

  // 6. Verify My Interests retrieval
  try {
    const res = await fetch(`${BASE_URL}/interests/user`, { headers });
    const data = await res.json();
    const verified = data.data.find(i => i.interestId === targetInterestId);
    if (!verified) {
      throw new Error("Failed: Interest is not present in my interests list!");
    }
    if (verified.matchingWeight !== 5) {
      throw new Error(`Failed: Verification weight mismatch! Got ${verified.matchingWeight}`);
    }
    console.log(`✓ Verification Success: Persisted values in database match: weight = 5.`);
  } catch (err) {
    console.error("❌ Verification failed:", err.message);
    process.exit(1);
  }

  // 7. Cleanup delete interest
  try {
    const deleteRes = await fetch(`${BASE_URL}/interests/user/${targetInterestId}`, {
      method: "DELETE",
      headers
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success) throw new Error("Delete failed");
    console.log("✓ Cleanup: Removed interest from user database registry.");
    console.log("=== ALL INTERESTS TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exit(1);
  }
};

testInterestsMatchingWeightsWorkflow();
