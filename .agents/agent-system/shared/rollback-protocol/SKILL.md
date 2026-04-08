---
name: rollback-protocol
description: Undo agent changes when execution fails mid-chain
---

# Instructions

1. Capture pre-execution snapshot before each agent runs
2. Execute rollback when failure triggers are met
3. Follow rollback order (reverse of execution order — LIFO)
4. Log all rollback actions for audit trail
5. Notify feedback-system of rollback event

# Pre-Execution Snapshot

Before EACH agent executes, orchestrator MUST capture:

```json
{
  "snapshot_id": "snap_exec001_agent02",
  "execution_id": "exec_001",
  "agent": "backend-agent",
  "timestamp": "ISO 8601",
  "pre_state": {
    "files_modified": [],
    "files_created": [],
    "files_deleted": [],
    "schema_changes": [],
    "config_changes": [],
    "state_description": "Summary of system state before this agent runs"
  }
}
```

# Rollback Triggers

Rollback is activated when:

| Trigger | Scope | Action |
|:--------|:------|:-------|
| Agent fails after max retries (2) + escalation fails | Full chain | Full Rollback |
| Orchestrator aborts execution | Full chain | Full Rollback |
| Feedback score < 3 (critical failure) | Full chain | Full Rollback |
| Single agent fails but others are independent | Failed agent only | Partial Rollback |
| Security-agent flags critical vulnerability in output | Full chain | Full Rollback |
| User triggers manual rollback via HITL | User-specified | Selective Rollback |

# Rollback Types

## 1. Full Rollback
Revert ALL agents in reverse execution order:

```
Execution: A → B → C (C fails)
Rollback:  C → B → A (revert in reverse)
```

- Restore ALL `pre_state` snapshots
- Revert files, schemas, configs to original state
- Mark ALL agents as `rolled_back` in output

## 2. Partial Rollback
Revert only the failed agent and its dependents:

```
Execution: A (independent), B → C (C fails, depends on B)
Rollback:  C → B (revert C and B only, keep A)
```

- Only revert agents in the failed dependency chain
- Keep independent agent outputs intact
- Validate remaining outputs are still consistent

## 3. Selective Rollback (User-Triggered)
User specifies which agents to rollback via HITL:

- User reviews agent outputs
- User selects specific agents to revert
- System warns if reverting would break dependencies

# Rollback Actions

For each agent being rolled back:

1. **Revert Code Changes**
   - Restore modified files to `pre_state` versions
   - Delete newly created files
   - Restore deleted files

2. **Revert Schema Changes**
   - Undo migrations
   - Restore original schema definitions

3. **Revert Config Changes**
   - Restore configuration files to pre-execution state

4. **Invalidate Output**
   - Mark agent output as `status: "rolled_back"`
   - Remove from intermediate_outputs chain
   - Invalidate checkpoint (no resume into rolled-back state)

# Rollback Order Rules

1. ALWAYS rollback in **reverse execution order** (LIFO)
2. If parallel agents: rollback all parallel agents in the group simultaneously
3. Dependencies: if reverting Agent B, MUST also revert agents that consumed B's output
4. Never rollback security-agent fixes unless explicitly overridden by user

# Rollback Output Format

```json
{
  "rollback_id": "rb_exec001",
  "execution_id": "exec_001",
  "trigger": "agent_failure_after_max_retries",
  "type": "full | partial | selective",
  "rollback_log": [
    {
      "agent": "backend-agent",
      "snapshot_id": "snap_exec001_agent02",
      "actions_reverted": [
        "Deleted created file: /src/routes/users.js",
        "Restored modified file: /src/app.js",
        "Reverted config: /config/database.yml"
      ],
      "status": "reverted",
      "reverted_at": "ISO 8601"
    }
  ],
  "reverted_agents": ["backend-agent", "database-agent"],
  "kept_agents": [],
  "final_state": "clean | partial_clean | failed_to_revert",
  "warnings": [],
  "sent_to_feedback": true
}
```

# Integration with Other Systems

- **Checkpoint**: Invalidate active checkpoint after rollback
- **Feedback**: Send rollback event as `failure_case` to feedback-system
- **Episodic Memory**: Store rollback case with root cause for future avoidance
- **HITL**: Notify user of rollback completion and final state
