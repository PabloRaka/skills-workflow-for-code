---
name: checkpoint-protocol
description: Save execution state for crash recovery and resumption
---

# Instructions

1. Save a checkpoint after each agent completes execution
2. Check for pending checkpoints when starting a new execution
3. Resume from last checkpoint if recovery is detected
4. Archive checkpoints to episodic-memory after successful completion
5. Expire stale checkpoints after 24 hours

# Auto-Checkpoint Protocol

After each agent completes execution, orchestrator MUST save:

```json
{
  "checkpoint_id": "chk_exec001_step03",
  "execution_id": "exec_001",
  "timestamp": "ISO 8601",
  "status": "in_progress",
  "current_step": 3,
  "total_steps": 5,
  "completed_agents": [
    {
      "agent": "database-agent",
      "status": "success",
      "output_ref": "output_database_001",
      "completed_at": "ISO 8601"
    },
    {
      "agent": "backend-agent",
      "status": "success",
      "output_ref": "output_backend_001",
      "completed_at": "ISO 8601"
    }
  ],
  "pending_agents": ["security-agent", "frontend-agent"],
  "current_agent": "code-reviewer-agent",
  "decision_plan": {},
  "intermediate_outputs": {},
  "context_snapshot": {},
  "expires_at": "ISO 8601 (+24h)"
}
```

# Checkpoint Storage

- Checkpoints are stored in **short-term-memory** under a dedicated `checkpoints` section
- Each execution has at most ONE active checkpoint (latest overwrites previous)
- Checkpoint includes references to agent outputs (not full data, to save space)
- Full agent outputs are stored separately in short-term-memory as artifacts

# Recovery Detection

When orchestrator starts a new execution:

1. **Check**: Query short-term-memory for any `status: "in_progress"` checkpoints
2. **Validate**: Check if checkpoint is expired (`expires_at < now`)
3. **Match**: Compare current task with checkpointed task
4. If match found and not expired:
   - **Prompt user**: "Previous execution for [task] was interrupted at step [N]. Resume? (yes/no)"
   - If **yes** → Resume from checkpoint
   - If **no** → Discard checkpoint, start fresh

# Resume Logic

When resuming from checkpoint:

1. Load `decision_plan` from checkpoint
2. Load `intermediate_outputs` for completed agents
3. Skip all agents in `completed_agents` list
4. Reconstruct context for `current_agent` (the one that was interrupted)
5. Re-execute from `current_agent` onwards
6. Continue normal checkpoint saves for remaining agents

# Checkpoint Lifecycle

```
Agent completes → Save checkpoint → Next agent starts
                                         ↓
                                   Agent completes → Update checkpoint → Next agent
                                                                              ↓
                                                                     All done → Delete checkpoint
```

# Edge Cases

- **Parallel execution**: Save checkpoint only after ALL parallel agents complete
- **Retry in progress**: If agent is retrying, checkpoint saves retry count
- **Rollback triggered**: Checkpoint is invalidated (cannot resume into rollback state)
- **User declines resume**: Checkpoint is deleted, start fresh execution

# Expiration Rules

- Default expiration: **24 hours** from last update
- Expired checkpoints are automatically deleted on next execution
- Rationale: After 24h, codebase may have changed significantly; resuming is unsafe

# Cleanup

After successful execution completion:
1. Move the active checkpoint to episodic-memory as a historical archive
2. Clear all associated artifact references from short-term-memory
3. Log checkpoint lifecycle and archive location in execution metadata for audit
