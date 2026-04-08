---
description: Workflow agent
---

# Agent System Workflow

Follow this pipeline for every task execution.

## Phase 0: System Initialization

1. **Agent Registry** — Auto-discover available agents
   - Scan `agents/` directory for all `SKILL.md` files
   - Parse frontmatter: `name`, `capabilities`, `risk_level`, `priority`
   - Build capability index for decision-system
   - Validate all agents have required frontmatter fields
   - Flag invalid agents with warnings

2. **Checkpoint Recovery** — Check for interrupted executions
   - Query short-term-memory for `has_pending_recovery: true`
   - If found and not expired (< 24h):
     - Present to user: "Previous execution interrupted. Resume?"
     - If **yes** → Load checkpoint, skip to Phase 3 (resume point)
     - If **no** → Delete checkpoint, proceed normally
   - If expired → Auto-delete, proceed normally

## Phase 1: Context Loading

3. **Short-Term Memory** — Load current request context
   - Parse user input, identify intent
   - Store as `current_task` in short-term memory
   - If continuation of previous task, load previous intermediate results

4. **Episodic Memory** — Retrieve past experiences  
   - Search for similar past cases (by keywords, category, agent patterns)
   - Extract `lessons` and `similar_cases`
   - Flag any past failures related to this type of request
   - **Include rollback cases** — Check if similar tasks triggered rollbacks before

5. **Semantic Memory** — Retrieve rules & best practices
   - Load relevant `rules` and `best_practices`
   - Cross-reference with episodic insights

## Phase 2: Decision & Planning

6. **Decision System** — Determine agent selection
   - Input: user request + episodic insights + semantic rules + **agent registry**
   - **Query registry** for matching agents by capability (not hardcoded list)
   - Select agents and execution order
   - **Assess risk level** per agent (low/medium/high/critical)
   - Determine **HITL gates** — which agents need user approval
   - **Calculate context budget** — allocate tokens across agent chain
   - Resolve any conflicts between memory sources
   - Output: structured decision plan (JSON) with `risk_assessment`

## Phase 3: Execution

7. **Orchestrator** — Coordinate execution
   - Receive decision plan
   - Initialize agents in specified order
   - **For each agent**, execute this sub-pipeline:

   ### Per-Agent Pipeline
   ```
   a. HITL Gate → Check risk_level
      → high/critical? Pause for user approval
      → approved? Continue. Rejected? Skip or abort.

   b. Rollback Snapshot → Capture pre-execution state
      → Record files, schema, config state

   c. Context Check → Verify input fits token budget
      → Over budget? Apply summarization
      → Way over? Use reference mode (artifact_ref)

   d. Execute Agent → Run SKILL.md instructions
      → Output via Standard Data Schema

   e. Save Checkpoint → Store progress in short-term memory
      → Record completed agents + intermediate outputs

   f. Error Handling:
      → Retry (max 2) → Escalate → Rollback → Abort
   ```

   - Handle errors per Error Handling Protocol:
     - Retry failed agents (max 2)
     - Escalate if retry fails
     - **Trigger rollback** if escalation fails
     - Abort and report if rollback fails

8. **Agent Execution** — Run selected agents
   - Each agent executes its SKILL.md instructions
   - Each agent outputs using the Standard Data Schema envelope
   - Sequential agents receive output from previous agent (**context-managed**)
   - Parallel agents execute independently

## Phase 4: Evaluation & Learning

9. **Feedback System** — Evaluate results
    - Score: accuracy, efficiency, clarity, schema compliance (0-10 each)
    - Detect issues: missing steps, wrong agent selection, poor ordering
    - **Evaluate HITL effectiveness**: were approval gates appropriate?
    - **Evaluate rollback events**: were they necessary? Could they be prevented?
    - **Evaluate context management**: were summarizations accurate?
    - Generate improvement suggestions
    - Send feedback to memory systems

10. **Long-Term Memory** — Store learnings
    - Store successful patterns (score >= 7)
    - **Store HITL patterns** — which risk classifications led to good outcomes
    - **Store rollback cases** — what triggered rollbacks and how to avoid
    - Update optimized flows
    - Discard noisy or low-score results
    - Build recommended patterns for future use

## Phase 5: Cleanup

11. **Post-Execution Cleanup**
    - Delete active checkpoint from short-term memory
    - Clear artifact references from context management
    - Clear rollback snapshots (no longer needed after success)
    - Update agent registry statistics (optional: track agent success rates)

## Error Recovery Flow

```
Agent fails → Retry (simplified prompt)
    ↓ fails again
Escalate to software-engineer-agent
    ↓ fails again  
Trigger Rollback (reverse execution order):
    → Revert completed agents (LIFO)
    → Invalidate checkpoint
    → Notify user via HITL
    → Log in episodic-memory as failure case
    → Report to feedback-system
```

## Quick Reference

```
               ┌──────────────────┐
               │  Agent Registry  │ ← Phase 0: Auto-discover agents
               │  Checkpoint Check│ ← Phase 0: Resume if interrupted
               └────────┬─────────┘
                        ↓
User Input → [Short-Term] → [Episodic] → [Semantic]  ← Phase 1
                        ↓
                [Decision System]  ← Phase 2 (+ risk assessment)
                        ↓
                 [Orchestrator]    ← Phase 3
                        ↓
    ┌───────────────────────────────────────┐
    │  For each agent:                      │
    │  [HITL Gate] → [Snapshot] →           │
    │  [Context Check] → [Execute] →        │
    │  [Checkpoint] → [Error/Rollback]      │
    └───────────────────┬───────────────────┘
                        ↓
                [Feedback System]  ← Phase 4
                        ↓
               [Long-Term Memory]  ← Phase 4
                        ↓
                   [Cleanup]       ← Phase 5
```

## Protocol Reference

| Protocol | File | Purpose |
|:---------|:-----|:--------|
| Agent Registry | `shared/agent-registry/SKILL.md` | Auto-discover agents |
| HITL | `shared/hitl-protocol/SKILL.md` | Approval gates |
| Rollback | `shared/rollback-protocol/SKILL.md` | Undo on failure |
| Context Mgmt | `shared/context-management/SKILL.md` | Token management |
| Checkpoint | `shared/checkpoint-protocol/SKILL.md` | Crash recovery |