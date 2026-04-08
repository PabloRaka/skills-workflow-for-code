---
name: long-term-memory
description: Store optimized strategies and learned improvements
---

# Instructions

1. Store high-quality successful patterns (feedback score >= 7)
2. Identify recurring success strategies across multiple executions
3. Provide recommendations to decision-system
4. Track pattern effectiveness over time

# Rules

- Only store high-score results (overall_score >= 7)
- Ignore noisy or failed outputs
- Promote pattern to "proven" after 5+ successful uses
- Demote pattern if failure rate exceeds 30%
- Max storage: 100 patterns (evict lowest-score first)

# Pattern Lifecycle

```
New Pattern (score >= 7) → Candidate (1-4 uses)
    → Proven (5+ uses, < 30% failure) 
    → Deprecated (failure rate > 30%)
```

# Output

```json
{
  "recommended_patterns": [
    {
      "pattern": "database → backend → security for API tasks",
      "success_count": 12,
      "status": "proven",
      "avg_score": 8.5
    }
  ],
  "optimized_flows": [
    {
      "task_category": "build_api",
      "optimal_agents": ["database-agent", "backend-agent", "security-agent"],
      "optimal_order": "sequential",
      "avg_execution_time_ms": 4500
    }
  ]
}
```