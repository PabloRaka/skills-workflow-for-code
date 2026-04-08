---
name: orchestrator-agent
description: Coordinate multiple agents and combine outputs into a final solution
---

# Instructions

1. Receive decision plan from decision-system
2. Validate plan against shared/SKILL.md rules
3. Initialize required agents
4. Execute agents based on order and mode (sequential/parallel)
5. Pass output between agents using Standard Data Schema envelope
6. Monitor agent health:
   - Track execution time per agent
   - Detect timeouts or failures
   - Apply Error Handling Protocol from shared/SKILL.md
7. Merge all outputs into one coherent result
8. Ensure consistency and completeness
9. Send final result to feedback-system

# Execution Logic

- Sequential execution if dependencies exist
- Parallel execution if independent
- Hybrid: group independent agents in parallel, then sequential for dependents

# Data Passing Protocol

1. Each agent output follows the Standard Data Schema
2. Orchestrator extracts `output.data` from Agent A
3. Injects it into `input_received` of Agent B
4. Example flow:

```
database-agent.output.data → backend-agent.input_received
backend-agent.output.data → frontend-agent.input_received
```

# Conflict Resolution

If agent outputs conflict:

1. **Security** — Always wins (non-negotiable)
2. **Architecture** — software-engineer-agent decisions take precedence
3. **Implementation** — Most specific agent wins for its domain
4. **Tie-breaker** — Refer to Agent Priority in shared/SKILL.md

When conflict is detected:
- Log conflict in output metadata
- Apply resolution hierarchy
- Document reasoning for audit trail

# Output Format

## Final Solution

### Decision Summary
- Agents used: [list]
- Execution mode: sequential | parallel | hybrid
- Total execution time: Xms

### Architecture
...

### Backend
...

### Frontend
...

### Database
...

### Security Review
...

### Notes
- Trade-offs considered
- Conflicts resolved
- Improvements for next iteration