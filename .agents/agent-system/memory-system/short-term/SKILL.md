---
name: short-term-memory
description: Store temporary context during current execution
---

# Instructions

1. Store current request context
2. Track active agents and outputs
3. Provide context to orchestrator
4. Detect if current task is a continuation of a previous task
5. Load previous intermediate results if continuing

# Rules

- Clear after execution ends
- High priority, low storage
- Max retention: 1 execution cycle
- If task is multi-turn, persist until final output is delivered

# Output

```json
{
  "current_task": "...",
  "task_type": "new | continuation",
  "active_agents": [],
  "intermediate_results": [],
  "previous_context": null
}
```