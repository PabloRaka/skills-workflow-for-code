---
name: short-term-memory
description: Store temporary context, active checkpoints, and intermediate state during execution
---

# Instructions

1. Store current request context
2. Track active agents and outputs
3. Provide context to orchestrator
4. Detect if current task is a continuation of a previous task
5. Load previous intermediate results if continuing
6. **Store and manage execution checkpoints** (see shared/checkpoint-protocol)
7. **Store artifact references** for context management (large data offloading)

# Rules

- Clear after execution ends (except unexpired checkpoints)
- High priority, low storage
- Max retention: 1 execution cycle
- If task is multi-turn, persist until final output is delivered
- **Checkpoints** persist until expired (24h) or manually cleared
- **Artifact references** persist until associated checkpoint is cleared

# Output

```json
{
  "current_task": "...",
  "task_type": "new | continuation | recovery",
  "active_agents": [],
  "intermediate_results": [],
  "previous_context": null,
  "checkpoints": {
    "active_checkpoint": {
      "checkpoint_id": "chk_exec001_step03",
      "execution_id": "exec_001",
      "status": "in_progress",
      "current_step": 3,
      "total_steps": 5,
      "completed_agents": [],
      "pending_agents": [],
      "decision_plan": {},
      "created_at": "ISO 8601",
      "expires_at": "ISO 8601"
    },
    "has_pending_recovery": false
  },
  "artifact_storage": {
    "stored_artifacts": [
      {
        "ref_id": "output_database_001",
        "agent": "database-agent",
        "size_tokens": 2300,
        "stored_at": "ISO 8601"
      }
    ],
    "total_stored_tokens": 0
  }
}
```

# Checkpoint Management

1. **Save**: Orchestrator calls `save_checkpoint(data)` after each agent completes
2. **Load**: On startup, check `has_pending_recovery`
3. **Delete**: Remove checkpoint after successful execution or expiration
4. **Update**: Overwrite with latest state (one active checkpoint per execution)

# Artifact Storage

When context-management offloads large data:
1. Store full agent output as artifact with unique `ref_id`
2. Return `ref_id` to orchestrator for reference-based passing
3. Agent can request full artifact by `ref_id` when needed
4. Clean up artifacts when checkpoint is cleared