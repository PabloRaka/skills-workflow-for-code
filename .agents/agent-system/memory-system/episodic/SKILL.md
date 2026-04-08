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
      "relevance_score": 0.85
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