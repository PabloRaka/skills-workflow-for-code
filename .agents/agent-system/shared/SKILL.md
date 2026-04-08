# Workflow Rules

1. Always validate dependencies before execution
2. Do not skip required agents
3. Ensure output consistency across agents
4. Avoid duplicate logic
5. Prioritize:
   Security > Stability > Performance > UX

# Agent Priority

Agent priority is managed dynamically by the **agent-registry** system.
See: `shared/agent-registry/SKILL.md`

Priority is defined in each agent's SKILL.md frontmatter (`priority` field).
Lower number = higher priority:

1. security-agent (priority: 1)
2. software-engineer-agent (priority: 2)
3. backend-agent (priority: 3)
4. database-agent (priority: 4)
5. frontend-agent (priority: 5)
6. ai-engineer-agent (priority: 6)
7. bug-analyzer-agent (priority: 7)
8. code-reviewer-agent (priority: 8)
9. documentation-agent (priority: 9)

> New agents added to `agents/` folder are automatically registered.
> Priority is read from frontmatter — no manual update needed here.

# Communication Rule

- Each agent must produce structured output
- Output must be reusable by next agent
- Context management rules apply (see `shared/context-management/SKILL.md`)

# Standard Data Schema

All agents MUST communicate using this unified envelope format:

```json
{
  "agent_name": "string",
  "timestamp": "ISO 8601",
  "status": "success | partial | failed | rolled_back | skipped_by_user",
  "confidence": 0.0-1.0,
  "input_received": {
    "from_agent": "string | null",
    "task_summary": "string",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "code | analysis | design | review | fix | documentation",
    "data": {},
    "reasoning_log": [],
    "impact_assessment": {},
    "artifacts": []
  },
  "dependencies": {
    "requires": ["agent-name"],
    "provides_to": ["agent-name"]
  },
  "pre_execution_snapshot": {
    "snapshot_id": "string",
    "files_modified": [],
    "files_created": [],
    "files_deleted": [],
    "schema_changes": [],
    "config_changes": []
  },
  "rollback_actions": {
    "revert_files": [],
    "revert_schemas": [],
    "revert_configs": [],
    "rollback_status": "not_needed | pending | completed | failed"
  },
  "context_info": {
    "input_tokens": 0,
    "output_tokens": 0,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 0,
    "tokens_used": 0,
    "retry_count": 0,
    "risk_level": "low | medium | high | critical",
    "approval_status": "not_required | pending | approved | rejected | timeout",
    "checkpoint_id": "string | null"
  }
}
```

# Error Handling Protocol

1. If an agent fails:
   - Report error with `status: "failed"` and include `error_detail`
   - Orchestrator decides: retry (max 2), skip, or abort
2. If an agent returns `status: "partial"`:
   - Next agent should handle missing data gracefully
   - Flag incomplete sections in output
3. Fallback chain:
   - Primary agent fails → Retry with simplified prompt
   - Second failure → Escalate to software-engineer-agent
   - Third failure → **Trigger rollback protocol** → Abort and report to feedback-system
4. Rollback on abort:
   - Execute rollback in reverse execution order (LIFO)
   - Invalidate any active checkpoint
   - Report rollback result to feedback-system

# Cross-Reference Protocols

| Protocol | Location | Purpose |
|:---------|:---------|:--------|
| Agent Registry | `shared/agent-registry/SKILL.md` | Auto-discover and index agents |
| HITL Protocol | `shared/hitl-protocol/SKILL.md` | Approval gates for risky actions |
| Rollback Protocol | `shared/rollback-protocol/SKILL.md` | Undo changes on failure |
| Context Management | `shared/context-management/SKILL.md` | Prevent token overflow |
| Checkpoint Protocol | `shared/checkpoint-protocol/SKILL.md` | Crash recovery |
| Reasoning Protocol | `shared/reasoning-protocol/SKILL.md` | Multi-step cognition and self-correction |
| User Interaction Protocol | `shared/user-interaction-protocol/SKILL.md` | Human-friendly outputs and walkthroughs |

# Version

schema_version: "2.0"