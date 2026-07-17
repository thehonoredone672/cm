const BASE_URL = "http://localhost:5000/api";

const testSettingsWorkflows = async () => {
  console.log("=== STARTING SETTINGS INTEGRATION TEST ===");

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

  // 2. Fetch Profile Settings
  try {
    const res = await fetch(`${BASE_URL}/settings/profile`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Profile settings fetched. Name: "${data.data.name}"`);
  } catch (err) {
    console.error("❌ Fetch profile settings failed:", err.message);
    process.exit(1);
  }

  // 3. Update Profile Settings
  try {
    const updRes = await fetch(`${BASE_URL}/settings/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: "Student One Upgraded",
        bio: "Senior backend developer",
        college: "MIT University"
      })
    });
    const data = await updRes.json();
    if (!data.success || data.data.name !== "Student One Upgraded") {
      throw new Error(`Failed to update profile settings: ${data.message}`);
    }
    console.log("✓ Profile settings updated successfully.");
  } catch (err) {
    console.error("❌ Update profile settings failed:", err.message);
    process.exit(1);
  }

  // 4. Fetch Preferences Settings
  try {
    const res = await fetch(`${BASE_URL}/settings/preferences`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Preferences settings fetched. Theme: "${data.data.theme}"`);
  } catch (err) {
    console.error("❌ Fetch preferences failed:", err.message);
    process.exit(1);
  }

  // 5. Update Preferences Settings
  try {
    const updRes = await fetch(`${BASE_URL}/settings/preferences`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        theme: "light",
        editorLanguage: "python",
        editorFontSize: 16
      })
    });
    const data = await updRes.json();
    if (!data.success || data.data.theme !== "light") {
      throw new Error(`Failed to update preferences: ${data.message}`);
    }
    console.log("✓ Preferences settings updated successfully.");
  } catch (err) {
    console.error("❌ Update preferences failed:", err.message);
    process.exit(1);
  }

  // 6. Fetch Privacy Settings
  try {
    const res = await fetch(`${BASE_URL}/settings/privacy`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Privacy settings fetched. publicProfile: ${data.data.publicProfile}`);
  } catch (err) {
    console.error("❌ Fetch privacy settings failed:", err.message);
    process.exit(1);
  }

  // 7. Update Privacy Settings
  try {
    const updRes = await fetch(`${BASE_URL}/settings/privacy`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        publicProfile: false,
        showEmail: false
      })
    });
    const data = await updRes.json();
    if (!data.success || data.data.publicProfile !== false) {
      throw new Error(`Failed to update privacy settings: ${data.message}`);
    }
    console.log("✓ Privacy settings updated successfully.");
  } catch (err) {
    console.error("❌ Update privacy settings failed:", err.message);
    process.exit(1);
  }

  // 8. Fetch Active Sessions
  try {
    const sessRes = await fetch(`${BASE_URL}/settings/sessions`, { headers });
    const data = await sessRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Active sessions retrieved. count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Fetch sessions failed:", err.message);
    process.exit(1);
  }

  // 9. Fetch Login History
  try {
    const histRes = await fetch(`${BASE_URL}/settings/login-history`, { headers });
    const data = await histRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Login history logs retrieved. count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Fetch login history failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL SETTINGS TESTS PASSED SUCCESSFULLY ===");
};

testSettingsWorkflows();
