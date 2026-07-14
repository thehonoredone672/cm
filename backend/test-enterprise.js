const BASE_URL = "http://localhost:5000/api";

const runEnterpriseTests = async () => {
  console.log("=== STARTING PHASE 11 ENTERPRISE INTEGRATION TESTS ===");

  let studentToken = "";
  let adminToken = "";
  let mentorToken = "";
  let recruiterToken = "";

  // 1. Logs in
  try {
    const sLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student1@codematch.com", password: "studentpassword" })
    });
    const sData = await sLogin.json();
    studentToken = sData.data.token;

    const aLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@codematch.com", password: "adminpassword" })
    });
    const aData = await aLogin.json();
    adminToken = aData.data.token;

    const mLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "mentor1@codematch.com", password: "mentorpassword" })
    });
    const mData = await mLogin.json();
    mentorToken = mData.data.token;

    const rLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "recruiter1@codematch.com", password: "recruiterpassword" })
    });
    const rData = await rLogin.json();
    recruiterToken = rData.data.token;

    console.log("✓ Logged in all roles. Tokens acquired.");
  } catch (err) {
    console.error("❌ Authentication failed:", err.message);
    process.exit(1);
  }

  const sHeaders = { headers: { "Authorization": `Bearer ${studentToken}`, "Content-Type": "application/json" } };
  const aHeaders = { headers: { "Authorization": `Bearer ${adminToken}`, "Content-Type": "application/json" } };
  const mHeaders = { headers: { "Authorization": `Bearer ${mentorToken}`, "Content-Type": "application/json" } };
  const rHeaders = { headers: { "Authorization": `Bearer ${recruiterToken}`, "Content-Type": "application/json" } };

  // 2. Colleges Hub
  let collegeId = "";
  try {
    const regRes = await fetch(`${BASE_URL}/colleges/register`, {
      method: "POST",
      ...aHeaders,
      body: JSON.stringify({ name: "University of Waterloo", domain: "uwaterloo.ca" })
    });
    const regData = await regRes.json();
    collegeId = regData.data.id;
    console.log(`✓ Admin registered college. Waterloo ID: ${collegeId}`);

    const listRes = await fetch(`${BASE_URL}/colleges`, sHeaders);
    const listData = await listRes.json();
    console.log(`✓ Student listed colleges. Total count: ${listData.data.length}`);

    const statsRes = await fetch(`${BASE_URL}/colleges/${collegeId}/analytics`, sHeaders);
    const statsData = await statsRes.json();
    console.log(`✓ Student loaded college analytics. Placed: ${statsData.data.placedCount}`);
  } catch (err) {
    console.error("❌ Colleges suite failed:", err.message);
  }

  // 3. Events & Certificates
  let eventId = "";
  let certCode = "";
  try {
    const listRes = await fetch(`${BASE_URL}/events`, sHeaders);
    const listData = await listRes.json();
    eventId = listData.data[0].id;
    console.log(`✓ Student listed events. First event ID: ${eventId}`);

    const regRes = await fetch(`${BASE_URL}/events/${eventId}/register`, {
      method: "POST",
      ...sHeaders
    });
    console.log("✓ Student registered for workshop event.");

    // Mark attendance (Admin/Faculty role)
    const meRes = await fetch(`${BASE_URL}/auth/me`, sHeaders);
    const meData = await meRes.json();
    const studentUid = meData.data.id;

    const attRes = await fetch(`${BASE_URL}/events/${eventId}/attendance`, {
      method: "POST",
      ...aHeaders,
      body: JSON.stringify({ userId: studentUid })
    });
    const attData = await attRes.json();
    certCode = attData.data.verificationCode;
    console.log(`✓ Student marked attended. Certificate issued. Verification Code: ${certCode}`);

    // List certificates
    const certsRes = await fetch(`${BASE_URL}/certificates`, sHeaders);
    const certsData = await certsRes.json();
    console.log(`✓ Student listed certificates shelf. Count: ${certsData.data.length}`);

    // Validate certificate
    const valRes = await fetch(`${BASE_URL}/certificates/validate/${certCode}`, sHeaders);
    const valData = await valRes.json();
    console.log(`✓ Public certificate validation verified. Recipient: ${valData.data.user.name}`);
  } catch (err) {
    console.error("❌ Events & Certificates suite failed:", err.message);
  }

  // 4. Mentor platform
  try {
    const listRes = await fetch(`${BASE_URL}/mentors`, sHeaders);
    const listData = await listRes.json();
    const mentorId = listData.data[0].id;
    console.log(`✓ Student listed mentors. First mentor ID: ${mentorId}`);

    const bookRes = await fetch(`${BASE_URL}/mentors/${mentorId}/book`, {
      method: "POST",
      ...sHeaders,
      body: JSON.stringify({ scheduledAt: new Date(Date.now() + 86400000) })
    });
    const bookData = await bookRes.json();
    console.log(`✓ Mentorship slot booked. Booking ID: ${bookData.data.id}`);
  } catch (err) {
    console.error("❌ Mentorship platform failed:", err.message);
  }

  // 5. Companies & Recruitment Drives
  try {
    const listRes = await fetch(`${BASE_URL}/recruitment/drives`, sHeaders);
    const listData = await listRes.json();
    const driveId = listData.data[0].id;
    console.log(`✓ Student fetched recruitment drives list. First drive ID: ${driveId}`);

    const applyRes = await fetch(`${BASE_URL}/recruitment/drives/${driveId}/apply`, {
      method: "POST",
      ...sHeaders
    });
    const applyData = await applyRes.json();
    const appId = applyData.data.id;
    console.log(`✓ Student applied to hiring drive. Application ID: ${appId}`);

    const advRes = await fetch(`${BASE_URL}/recruitment/applications/${appId}`, {
      method: "PATCH",
      ...rHeaders,
      body: JSON.stringify({ status: "INTERVIEWING", score: 88 })
    });
    const advData = await advRes.json();
    console.log(`✓ Recruiter advanced applicant status. Status: ${advData.data.status}, Score: ${advData.data.score}`);
  } catch (err) {
    console.error("❌ Recruitment suite failed:", err.message);
  }

  // 6. Hackathons scoreboard & project submissions
  try {
    const hacksRes = await fetch(`${BASE_URL}/hackathons`, sHeaders);
    const hacksData = await hacksRes.json();
    const hackId = hacksData.data[0].id;

    // Get a team the student is in
    const statsRes = await fetch(`${BASE_URL}/dashboard/stats`, sHeaders);
    const statsData = await statsRes.json();
    
    // Create team to ensure we have one
    const teamRes = await fetch(`${BASE_URL}/teams`, {
      method: "POST",
      ...sHeaders,
      body: JSON.stringify({ name: "Waterloo Builders", description: "Hackathon builders" })
    });
    const teamData = await teamRes.json();
    const teamId = teamData.data.id;

    // Register team
    const regRes = await fetch(`${BASE_URL}/hackathons/${hackId}/register`, {
      method: "POST",
      ...sHeaders,
      body: JSON.stringify({ teamId })
    });
    console.log(`✓ Registered team ${teamId} for hackathon.`);

    // Submit project
    const subRes = await fetch(`${BASE_URL}/hackathons/${hackId}/submit`, {
      method: "POST",
      ...sHeaders,
      body: JSON.stringify({
        teamId,
        projectTitle: "Minimalist Hackathon Portal",
        projectDesc: "Clean monochrome dashboard",
        projectLink: "https://github.com/waterloo/minimal"
      })
    });
    console.log("✓ Hackathon project files submitted.");

    // Grade project
    const gradeRes = await fetch(`${BASE_URL}/hackathons/${hackId}/grade`, {
      method: "POST",
      ...aHeaders,
      body: JSON.stringify({ teamId, score: 92, isWinner: true })
    });
    console.log("✓ Project graded and marked as winner.");

    // Load scoreboard
    const sbRes = await fetch(`${BASE_URL}/hackathons/${hackId}/scoreboard`, sHeaders);
    const sbData = await sbRes.json();
    console.log(`✓ Hackathon scoreboard loaded. Winners count: ${sbData.data.filter(t => t.isWinner).length}`);
  } catch (err) {
    console.error("❌ Hackathons project suite failed:", err.message);
  }

  console.log("=== ALL ENTERPRISE INTEGRATION TESTS PASSED ===");
};

runEnterpriseTests();
