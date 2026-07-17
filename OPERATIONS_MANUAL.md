# CodeMatch Operations Manual

This operations manual details the procedures, checklists, commands, and disaster recovery strategies required to run the CodeMatch platform in production environments.

---

## 1. Daily Operations

```mermaid
graph TD;
    CheckHealth[Check Service Health] --> ReviewReports[Review Abuse Reports]
    ReviewReports --> MonitorContests[Monitor Live Contests]
    MonitorContests --> ClearLogs[Flush Temp Logs]
```

### Operational Checklists
- [ ] Verify Express server responds to `/health` with `status: 200`.
- [ ] Inspect Judge0 service telemetry to confirm execution queue size is zero.
- [ ] Query database logs for high frequency query alerts or deadlocks.
- [ ] Review pending flags queue on student profiles and comment channels.

---

## 2. User Management Operations

### roles Assignment
Administrators can update user roles via PostgreSQL:
```sql
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'operator@codematch.com';
```

### Account Suspensions
To suspend or lock an abusive user account:
```sql
UPDATE "User" SET "isBlocked" = true WHERE "id" = 'user-uuid-string';
```

---

## 3. Database Maintenance

### Schema Migrations Strategy
All database structural modifications must be executed using Prisma migrations:
```powershell
npx prisma migrate dev --name add_new_fields
```

### Backups & Restores Procedures
To perform a live database backup:
```powershell
pg_dump -h localhost -U postgres -d codematch -F c -b -v -f "C:\backups\codematch_backup.bak"
```

To restore the database:
```powershell
pg_restore -h localhost -U postgres -d codematch -v "C:\backups\codematch_backup.bak"
```

---

## 4. Environment Variables Reference

| Variable Key | Scope | Example Values | Purpose |
|---|---|---|---|
| `DATABASE_URL` | DB Connection | `postgresql://user:pass@host:5432/db` | Connection pooling endpoint. |
| `JWT_SECRET` | Auth Token | `a9018bc2...` | Signature key for authorization tokens. |
| `JUDGE0_API_URL` | Compilation | `http://judge0-server:2358` | API base path for sandboxed runs. |

---

## 5. Disaster Recovery Plan

### Scenario 1: Primary Database Loss
1. Provision a new PostgreSQL instance immediately.
2. Retrieve the latest nightly backup from the cloud bucket.
3. run the pg_restore command.
4. Verify server reconnects and launches with zero schema offsets.

### Scenario 2: Memory exhaustion on Sandbox Server
1. Terminate dangling Node compilers processes.
2. Flush temp directories.
3. Restart Judge0 daemon.
