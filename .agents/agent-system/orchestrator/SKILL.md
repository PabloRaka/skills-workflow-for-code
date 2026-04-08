---
name: orchestrator-agent
description: Coordinate multiple agents and combine outputs into a final solution
---

# Instructions

1. Receive decision plan from decision-system
2. Validate plan against shared/SKILL.md rules
3. **Build agent registry** — Scan agents/ and load agent-registry index
4. **Check for pending checkpoints** — Query short-term-memory for interrupted executions
   - If checkpoint found → prompt user to resume or start fresh
   - If resuming → skip completed agents, continue from last checkpoint
5. Initialize required agents
6. For EACH agent, before execution:
   a. **HITL Gate** — Check `risk_level` from decision plan and agent registry
      - If `high` or `critical` → pause and request user approval (see shared/hitl-protocol)
      - If user rejects → skip agent or abort (based on user choice)
      - If timeout → default to abort (safe default)
   b. **Capture rollback snapshot** — Save pre-execution state (see shared/rollback-protocol)
   c. **Context window check** — Verify input size fits agent's token budget (see shared/context-management)
      - If exceeds budget → apply summarization before passing
7. Execute agents based on order and mode (sequential/parallel)
8. Pass output between agents using Standard Data Schema envelope
9. **Save checkpoint** after each agent completes (see shared/checkpoint-protocol)
10. Monitor agent health:
    - Track execution time per agent
    - Track token usage per agent
    - Detect timeouts or failures
    - Apply Error Handling Protocol from shared/SKILL.md
11. **On failure** — Apply rollback:
    - If agent fails after max retries + escalation → trigger rollback protocol
    - Determine rollback scope: full, partial, or selective
    - Execute rollback in reverse order (LIFO)
12. Merge all outputs into one coherent result
13. Ensure consistency and completeness
14. **Archive checkpoint** — Move checkpoint to episodic-memory for record-keeping after successful completion
15. Pass final execution results to documentation-agent for walkthrough/README generating
16. Send final result to feedback-system

# Execution Logic

- Sequential execution if dependencies exist
- Parallel execution if independent
- Hybrid: group independent agents in parallel, then sequential for dependents

# Pre-Execution Checklist

Before starting the execution pipeline:

```
1. ✅ Registry loaded? (agent-registry scanned)
2. ✅ Checkpoint check? (no pending recovery)
3. ✅ Decision plan validated? (against shared/SKILL.md)
4. ✅ Context budget calculated? (total available tokens)
5. ✅ HITL mode determined? (auto_approve_all or gate mode)
```

# Per-Agent Execution Flow

For each agent in the execution plan:

```
┌─────────────────────────────────────────────┐
│ 1. Check risk_level (HITL Gate)             │
│    → high/critical? Wait for user approval  │
│                                             │
│ 2. Capture pre-execution snapshot           │
│    → Save files, schema, config state       │
│                                             │
│ 3. Check context size                       │
│    → Summarize if over budget               │
│                                             │
│ 4. Execute agent                            │
│    → Pass input via Standard Data Schema    │
│                                             │
│ 5. Save checkpoint                          │
│    → Store completed agent + output ref     │
│                                             │
│ 6. On failure → Retry / Escalate / Rollback │
└─────────────────────────────────────────────┘
```

# Data Passing Protocol

1. Each agent output follows the Standard Data Schema
2. Orchestrator extracts `output.data` from Agent A
3. **Apply context management**: summarize if needed
4. Injects it into `input_received` of Agent B
5. Example flow:

```
database-agent.output.data → [context check] → backend-agent.input_received
backend-agent.output.data → [context check] → frontend-agent.input_received
```

# Conflict Resolution

If agent outputs conflict:

1. **Security** — Always wins (non-negotiable)
2. **Architecture** — software-engineer-agent decisions take precedence
3. **Implementation** — Most specific agent wins for its domain
4. **Tie-breaker** — Refer to Agent Priority in agent-registry

When conflict is detected:
- Log conflict in output metadata
- Apply resolution hierarchy
- Document reasoning for audit trail

# Error Handling + Rollback Integration

```
Agent fails → Retry (max 2)
    ↓ fails again
Escalate to software-engineer-agent
    ↓ fails again
Trigger Rollback Protocol:
    1. Determine scope (full/partial)
    2. Execute rollback in reverse order
    3. Invalidate checkpoint
    4. Log to feedback-system
    5. Store in episodic-memory as failure case
    6. Notify user via HITL
```

# Output Format

## Final Solution

### Decision Summary
- Agents used: [list]
- Agents skipped (HITL rejected): [list]
- Execution mode: sequential | parallel | hybrid
- Total execution time: Xms
- Total tokens used: X
- Rollback triggered: yes | no
- Checkpoint recovered: yes | no
- HITL approvals: [list]

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

### Context Management Report
- Total context across chain: X tokens
- Summarizations applied: X
- Overflow prevented: X times

### Notes
- Trade-offs considered
- Conflicts resolved
- HITL decisions made
- Rollback events (if any)
- Improvements for next iteration