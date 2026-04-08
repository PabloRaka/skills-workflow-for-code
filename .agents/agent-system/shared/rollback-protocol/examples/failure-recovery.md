# Example: Failure Recovery — Database Migration Rollback

## Scenario
User requested "Build a secure API with user management." The decision-system planned: `database-agent → backend-agent → security-agent`. The database-agent succeeded, but the backend-agent failed after max retries.

## Execution Timeline

### Step 1: database-agent ✅ SUCCESS
```json
{
  "agent_name": "database-agent",
  "status": "success",
  "pre_execution_snapshot": {
    "snapshot_id": "snap_exec012_step01",
    "files_created": ["migrations/001_create_users.sql"],
    "schema_changes": ["CREATE TABLE users (id UUID, email TEXT, password_hash TEXT)"],
    "config_changes": []
  },
  "output": {
    "type": "design",
    "data": {
      "tables_created": ["users"],
      "migration_file": "migrations/001_create_users.sql"
    }
  }
}
```

### Step 2: backend-agent ❌ FAILED (after 2 retries + escalation)
```json
{
  "agent_name": "backend-agent",
  "status": "failed",
  "metadata": {
    "retry_count": 2,
    "error_detail": "Unable to generate valid Express routes — circular dependency in middleware chain",
    "escalated_to": "software-engineer-agent",
    "escalation_result": "failed"
  }
}
```

### Step 3: Rollback Triggered

**Trigger:** Agent failure after max retries + escalation failure  
**Scope:** Full Rollback (dependency chain: database → backend)  
**Order:** Reverse execution (LIFO): backend → database

```json
{
  "rollback_id": "rb_exec012",
  "execution_id": "exec_012",
  "trigger": "agent_failure_after_max_retries",
  "type": "full",
  "rollback_log": [
    {
      "agent": "backend-agent",
      "snapshot_id": "snap_exec012_step02",
      "actions_reverted": [],
      "status": "nothing_to_revert",
      "reason": "Agent failed before producing output",
      "reverted_at": "2026-04-08T10:15:00Z"
    },
    {
      "agent": "database-agent",
      "snapshot_id": "snap_exec012_step01",
      "actions_reverted": [
        "Deleted file: migrations/001_create_users.sql",
        "Reverted schema: DROP TABLE users (if applied)"
      ],
      "status": "reverted",
      "reverted_at": "2026-04-08T10:15:02Z"
    }
  ],
  "reverted_agents": ["database-agent"],
  "kept_agents": [],
  "final_state": "clean",
  "warnings": [],
  "sent_to_feedback": true
}
```

### Step 4: Feedback System Records Failure

```json
{
  "score": {
    "accuracy": 0,
    "efficiency": 3,
    "clarity": 5,
    "schema_compliance": 8,
    "overall": 2.65
  },
  "issues": [
    "backend-agent failed: circular dependency in middleware chain",
    "Rollback triggered: full rollback of database changes"
  ],
  "routing": {
    "to_episodic": true,
    "to_semantic": false,
    "to_long_term": false,
    "to_decision": true
  }
}
```

## Key Takeaway
The rollback protocol ensured that the codebase returned to a clean state after the backend failure. Without rollback, the database migration would have been left orphaned — tables created but no API to use them.
