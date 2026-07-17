const BASE_URL = "http://localhost:5000/api";

const testCodeEditorWorkflows = async () => {
  console.log("=== STARTING CODE EDITOR INTEGRATION TEST ===");

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
    console.log("⚠️ No problems in database. Skipping editor checks.");
    console.log("=== CODE EDITOR TEST COMPLETED WITH BYPASS ===");
    process.exit(0);
  }

  console.log(`✓ Target problem selected for validation: ${testProblemId}`);

  // 2. Save CodeDraft
  try {
    const saveRes = await fetch(`${BASE_URL}/submissions/draft`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        problemId: testProblemId,
        language: "javascript",
        code: "function solve(input) { return input; }"
      })
    });
    const data = await saveRes.json();
    if (!data.success || data.data.code !== "function solve(input) { return input; }") {
      throw new Error(`Failed to save draft: ${data.message}`);
    }
    console.log("✓ CodeDraft saved successfully.");
  } catch (err) {
    console.error("❌ Save draft failed:", err.message);
    process.exit(1);
  }

  // 3. Get CodeDraft
  try {
    const getRes = await fetch(`${BASE_URL}/submissions/draft?problemId=${testProblemId}&language=javascript`, { headers });
    const data = await getRes.json();
    if (!data.success || data.data.code !== "function solve(input) { return input; }") {
      throw new Error(`Failed to retrieve draft: ${data.message}`);
    }
    console.log("✓ CodeDraft retrieved successfully.");
  } catch (err) {
    console.error("❌ Get draft failed:", err.message);
    process.exit(1);
  }

  // 4. Save EditorSettings
  try {
    const setRes = await fetch(`${BASE_URL}/submissions/settings`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        theme: "vs-dark",
        fontSize: 16,
        wordWrap: "on",
        minimap: false,
        autoSave: true
      })
    });
    const data = await setRes.json();
    if (!data.success || data.data.fontSize !== 16 || data.data.wordWrap !== "on") {
      throw new Error(`Failed to save settings: ${data.message}`);
    }
    console.log("✓ EditorSettings saved successfully.");
  } catch (err) {
    console.error("❌ Save settings failed:", err.message);
    process.exit(1);
  }

  // 5. Get EditorSettings
  try {
    const getRes = await fetch(`${BASE_URL}/submissions/settings`, { headers });
    const data = await getRes.json();
    if (!data.success || data.data.fontSize !== 16) {
      throw new Error(`Failed to retrieve settings: ${data.message}`);
    }
    console.log("✓ EditorSettings retrieved successfully.");
  } catch (err) {
    console.error("❌ Get settings failed:", err.message);
    process.exit(1);
  }

  // 6. Save LanguagePreference
  try {
    const prefRes = await fetch(`${BASE_URL}/submissions/pref`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language: "javascript"
      })
    });
    const data = await prefRes.json();
    if (!data.success || data.data.language !== "javascript") {
      throw new Error(`Failed to save preference: ${data.message}`);
    }
    console.log("✓ LanguagePreference saved successfully.");
  } catch (err) {
    console.error("❌ Save preference failed:", err.message);
    process.exit(1);
  }

  // 7. Get LanguagePreference
  try {
    const getRes = await fetch(`${BASE_URL}/submissions/pref`, { headers });
    const data = await getRes.json();
    if (!data.success || data.data.language !== "javascript") {
      throw new Error(`Failed to retrieve preference: ${data.message}`);
    }
    console.log("✓ LanguagePreference retrieved successfully.");
  } catch (err) {
    console.error("❌ Get preference failed:", err.message);
    process.exit(1);
  }

  // 8. Execute code run
  try {
    console.log("✓ Executing dry run against test cases...");
    const runRes = await fetch(`${BASE_URL}/submissions/run`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        problemId: testProblemId,
        language: "javascript",
        code: "function solve(input) { return input; }"
      })
    });
    const data = await runRes.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Code execution completed. Results count: ${data.data.results.length}`);
  } catch (err) {
    console.error("❌ Code execution dry run failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL CODE EDITOR TESTS PASSED SUCCESSFULLY ===");
};

testCodeEditorWorkflows();
