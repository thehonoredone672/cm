const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const BASE_URL = "http://localhost:5000/api";

const testAdminDashboard = async () => {
  console.log("=== STARTING ADMIN DASHBOARD INTEGRATION TEST ===");

  // 1. Fetch an ADMIN user from PostgreSQL
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (!adminUser) {
    console.error("❌ No admin user found in database. Seed the database first.");
    process.exit(1);
  }

  console.log(`✓ Found admin user: ${adminUser.email}`);

  // 2. Generate a valid JWT token for this admin using decoded.userId
  const token = jwt.sign(
    { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
    process.env.JWT_SECRET || "supersecretjwtkey",
    { expiresIn: "1h" }
  );

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // 3. Fetch platform statistics
  try {
    const res = await fetch(`${BASE_URL}/admin-dashboard/stats`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Admin statistics retrieved successfully.");
    console.log(`  - Total Users: ${data.data.users.total}`);
    console.log(`  - Total Problems: ${data.data.problems.total}`);
  } catch (err) {
    console.error("❌ Fetch stats failed:", err.message);
    process.exit(1);
  }

  // 4. Fetch system health status
  try {
    const res = await fetch(`${BASE_URL}/admin-dashboard/health`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ System health status: DB ${data.data.database.status}, Server ${data.data.backend.status}`);
  } catch (err) {
    console.error("❌ Fetch health failed:", err.message);
    process.exit(1);
  }

  // 5. Log audit activity
  try {
    const res = await fetch(`${BASE_URL}/admin-dashboard/activities`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "CREATE_PROBLEM",
        moduleName: "problems",
        status: "SUCCESS"
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log("✓ Admin activity logged successfully.");
  } catch (err) {
    console.error("❌ Log activity failed:", err.message);
    process.exit(1);
  }

  // 6. Fetch activities log
  try {
    const res = await fetch(`${BASE_URL}/admin-dashboard/activities?page=1&limit=5`, { headers });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    console.log(`✓ Audit activities logs retrieved. Count: ${data.data.length}`);
  } catch (err) {
    console.error("❌ Fetch activities failed:", err.message);
    process.exit(1);
  }

  console.log("=== ALL ADMIN DASHBOARD TESTS PASSED SUCCESSFULLY ===");
};

testAdminDashboard()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
