---
name: episodic-memory
description: Store past execution cases and experiences
---

# Instructions

1. Store:
   - user request (summary)
   - agents used
   - execution order
   - outcome (success/partial/failed)
   - errors encountered
   - resolution applied
   - archived checkpoints (raw cognitive maps and system snapshots)

2. Retrieve similar past cases:
   - Match by keywords and category
   - Match by agent combination pattern
   - Rank by recency and relevance

3. Provide lessons learned to decision-system

# Rules

- Prioritize recent + successful cases
- Cluster similar problems by category
- Max storage: 50 most recent cases (FIFO eviction)
- Failed cases with resolution are HIGH PRIORITY to keep

# Output

```json
{
  "similar_cases": [
    {
      "request_summary": "...",
      "agents_used": [],
      "outcome": "success",
      "relevance_score": 0.85,
      "archived_checkpoint_ref": "chk_exec009_final"
    }
  ],
  "lessons": [
    "Database schema should be defined before API endpoints"
  ],
  "warnings": [
    "Similar case failed when security-agent was skipped"
  ]
}
```