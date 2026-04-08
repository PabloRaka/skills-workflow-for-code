---
name: context-management
description: Manage context window size and prevent token overflow across agent chains
---

# Instructions

1. Track total token usage across the agent execution chain
2. Apply summarization when context exceeds threshold
3. Use reference system for large data payloads
4. Enforce per-agent token budgets
5. Prioritize data preservation during pruning

# Context Budget Allocation

Each agent execution has a total context budget. Allocate as follows:

| Component | Budget % | Description |
|:----------|:---------|:------------|
| Instructions (SKILL.md) | 20% | Agent's own skill instructions |
| Input Data | 40% | Data received from previous agent |
| Memory Context | 15% | Episodic + semantic insights |
| Reserved for Output | 25% | Space for agent's response |

# Summarization Strategy

When passing output from Agent A to Agent B:

1. **Full Pass** — If `output.data` size < 60% of Agent B's input budget → pass as-is
2. **Smart Summary** — If size >= 60% → summarize:
   - Keep all `type`, `status`, `agent_name` fields intact
   - Summarize `output.data` into key decisions and structures only
   - Move detailed code/artifacts to reference storage
   - Add `"summarized": true` flag
3. **Reference Mode** — If size >= 90% → store full output as artifact reference:
   - Replace inline data with `"artifact_ref": "output_agent-a_001"`
   - Store full data in short-term memory as retrievable artifact
   - Agent B can request full data for specific sections if needed

# Priority Pruning Order

When context must be reduced, prune in this order (lowest priority first):

1. **Drop first**: `metadata.execution_time_ms`, `metadata.tokens_used`, `metadata.retry_count`
2. **Drop second**: `dependencies` block (already resolved by orchestrator)
3. **Drop third**: `input_received` from 2+ agents ago (stale context)
4. **Drop fourth**: `artifacts` list (keep references only)
5. **Never drop**: `output.data`, `status`, `agent_name`, `confidence`

# Per-Agent Limits

```json
{
  "default_limits": {
    "max_input_tokens": 4000,
    "max_output_tokens": 4000,
    "max_total_context": 8000
  },
  "override_by_agent": {
    "software-engineer-agent": {
      "max_input_tokens": 6000,
      "max_output_tokens": 6000,
      "max_total_context": 12000
    },
    "code-reviewer-agent": {
      "max_input_tokens": 6000,
      "max_output_tokens": 4000,
      "max_total_context": 10000
    }
  }
}
```

# Context Tracking Schema

Orchestrator must track context size using this format:

```json
{
  "context_tracking": {
    "execution_id": "exec_001",
    "total_tokens_used": 0,
    "total_budget": 32000,
    "per_agent": [
      {
        "agent": "database-agent",
        "input_tokens": 1200,
        "output_tokens": 2300,
        "summarized": false,
        "pruned_fields": []
      }
    ],
    "warnings": [],
    "overflow_prevented": 0
  }
}
```

# Rules

- NEVER truncate `output.data` without summarization (no blind cutting)
- Always preserve the LATEST agent's output in full
- Summarization must maintain semantic accuracy
- Log all pruning/summarization actions for audit trail
- If total chain exceeds budget, prioritize the PRIMARY agent's context
