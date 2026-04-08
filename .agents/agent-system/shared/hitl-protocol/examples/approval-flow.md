# Example: HITL Approval Flow — Critical Database Migration

## Scenario
User requested "Refactor user table — drop legacy_email column and merge data into email column." The decision-system flagged database-agent as `critical` risk because it involves dropping a column with live user data.

## Step 1: Decision System Risk Assessment

```json
{
  "agents": ["database-agent", "backend-agent"],
  "execution_order": ["database-agent", "backend-agent"],
  "risk_assessment": {
    "database-agent": {
      "risk_level": "critical",
      "reason": "DROP COLUMN on production table with 50k+ rows — data loss is irreversible",
      "requires_approval": true
    },
    "backend-agent": {
      "risk_level": "low",
      "reason": "Update API to use email column instead of legacy_email — code change only",
      "requires_approval": false
    }
  }
}
```

## Step 2: Orchestrator Pauses — HITL Approval Request

Orchestrator reaches database-agent but detects `risk_level: critical`. Execution is **paused**.

```json
{
  "approval_request": {
    "request_id": "apr_exec015_step01",
    "execution_id": "exec_015",
    "agent": "database-agent",
    "risk_level": "critical",
    "action_summary": "Drop column 'legacy_email' from users table after merging data into 'email' column",
    "impact_analysis": {
      "files_affected": ["migrations/005_drop_legacy_email.sql"],
      "data_at_risk": "legacy_email column data for 50,247 user records",
      "reversible": false,
      "estimated_blast_radius": "All user records in production database"
    },
    "alternatives": [
      "Option A: Soft-deprecate — rename column to '_deprecated_legacy_email' instead of dropping",
      "Option B: Archive — backup legacy_email data to separate archive table before dropping",
      "Option C: Proceed — drop column (data already merged, column is redundant)"
    ],
    "recommended_action": "approve_with_conditions",
    "recommended_conditions": "Create backup of legacy_email data before drop",
    "timeout_seconds": 300,
    "timeout_default": "abort"
  }
}
```

## Step 3: User Responds

User reviews the approval request and responds:

```json
{
  "approval_response": {
    "request_id": "apr_exec015_step01",
    "decision": "approve_with_conditions",
    "conditions": [
      "Backup legacy_email data to users_archive table before dropping",
      "Add migration rollback script that can restore the column"
    ],
    "decided_by": "user",
    "decided_at": "2026-04-08T10:05:30Z"
  }
}
```

## Step 4: Orchestrator Resumes with Conditions

The orchestrator injects user conditions into the database-agent's input:

```json
{
  "input_received": {
    "from_agent": null,
    "task_summary": "Drop legacy_email column from users table",
    "user_conditions": [
      "Backup legacy_email data to users_archive table before dropping",
      "Add migration rollback script that can restore the column"
    ]
  }
}
```

## Step 5: Agent Executes with Conditions

database-agent generates migration that includes the backup:

```sql
-- migrations/005_drop_legacy_email.sql

-- Step 1: Backup (user condition)
CREATE TABLE users_archive AS
SELECT id, legacy_email, NOW() as archived_at FROM users;

-- Step 2: Drop column
ALTER TABLE users DROP COLUMN legacy_email;

-- Rollback script (user condition)
-- ALTER TABLE users ADD COLUMN legacy_email TEXT;
-- UPDATE users u SET legacy_email = a.legacy_email FROM users_archive a WHERE u.id = a.id;
```

## Step 6: Approval Logged

```json
{
  "approval_log": {
    "request_id": "apr_exec015_step01",
    "risk_level": "critical",
    "decision": "approve_with_conditions",
    "decided_by": "user",
    "decided_at": "2026-04-08T10:05:30Z",
    "response_time_ms": 45000,
    "conditions": ["backup before drop", "include rollback script"],
    "timeout_occurred": false
  }
}
```

## Key Takeaway
The HITL protocol prevented a potentially dangerous column drop from being executed automatically. The user's conditions (backup + rollback script) added safety measures that the AI agent might not have included by default.
