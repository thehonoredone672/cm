const BASE_URL = "http://localhost:5000/api";

const testDeveloperProfileWorkflow = async () => {
  console.log("=== STARTING DEVELOPER PROFILE INTEGRATION TEST ===");

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

  // 2. Fetch profile info
  try {
    const res = await fetch(`${BASE_URL}/users/profile`, { headers });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(`API returned success=false: ${data.message}`);
    }

    console.log(`✓ Fetched profile successfully. Email: ${data.data.email}`);

    // 3. Update profile fields
    const updatedBio = "Verification Test Bio: Passionate developer.";
    const updatedProfession = "Software Architect";
    
    const updateRes = await fetch(`${BASE_URL}/users/me`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        bio: updatedBio,
        profession: updatedProfession,
        educationType: "COLLEGE",
        college: "University of Toronto"
      })
    });
    const updateData = await updateRes.json();

    if (!updateData.success) {
      throw new Error(`Profile update failed: ${updateData.message}`);
    }

    console.log("✓ Profile updated successfully.");

    // Verify updated values
    if (updateData.data.bio !== updatedBio) {
      throw new Error(`Failed: Bio was not updated! Got ${updateData.data.bio}`);
    }
    if (updateData.data.profession !== updatedProfession) {
      throw new Error(`Failed: Profession was not updated! Got ${updateData.data.profession}`);
    }
    console.log("✓ Verified updated values in response:");
    console.log(`  - Profession: ${updateData.data.profession}`);
    console.log(`  - Bio: ${updateData.data.bio}`);

    console.log("=== ALL PROFILE TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Profile integration test failed:", err.message);
    process.exit(1);
  }
};

testDeveloperProfileWorkflow();
