const http = require("http");

const runTests = async () => {
  console.log("=== STARTING PHASE 5 AUTOMATED VERIFICATION TEST SUITE ===");
  const host = "http://localhost:5000";

  const get = (path, headers = {}) => {
    return new Promise((resolve, reject) => {
      http.get(`${host}${path}`, { headers }, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          try {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: JSON.parse(data)
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data
            });
          }
        });
      }).on("error", reject);
    });
  };

  try {
    // Test 1: Health endpoint
    console.log("Test 1: Health check endpoint...");
    const health = await get("/health");
    console.log(`✓ Status: ${health.statusCode}, Response: ${JSON.stringify(health.body)}`);
    if (health.body.status !== "healthy") throw new Error("Health status mismatch");

    // Test 2: Standardized error format check
    console.log("\nTest 2: Standardized error output check...");
    const missingRoute = await get("/api/invalid-route-name-path");
    console.log(`✓ Status: ${missingRoute.statusCode}, Body: ${JSON.stringify(missingRoute.body)}`);
    if (missingRoute.body.success !== false) throw new Error("Success indicator should be false");
    if (!missingRoute.body.message) throw new Error("Error message required");

    // Test 3: Unauthorized admin route block check
    console.log("\nTest 3: Authorization protect check on /api/admin/stats...");
    const adminStats = await get("/api/admin/stats");
    console.log(`✓ Status: ${adminStats.statusCode}, Response: ${JSON.stringify(adminStats.body)}`);
    if (adminStats.statusCode !== 401) throw new Error("Unauthenticated request should return 401");

    // Test 4: Rate Limiter response headers
    console.log("\nTest 4: Rate Limiter header audit...");
    const apiRes = await get("/api/users");
    console.log("Returned Headers:", Object.keys(apiRes.headers));
    const limitHeader = apiRes.headers["x-ratelimit-limit"] || apiRes.headers["ratelimit-limit"];
    const remainingHeader = apiRes.headers["x-ratelimit-remaining"] || apiRes.headers["ratelimit-remaining"];
    console.log(`✓ Rate Limit Limit Header: ${limitHeader}, Remaining: ${remainingHeader}`);
    if (!limitHeader) throw new Error("Rate limit headers are missing from response");

    console.log("\n=== ALL SECURITY AND HEALTH QUALITY TESTS PASSED ===");
  } catch (err) {
    console.error("\n❌ QUALITY TEST SUITE FAILED:", err.message);
    process.exit(1);
  }
};

runTests();
