---
description: Master execution workflow for the Gravity Agent System
version: "2.0"
---

# Agent System Workflow

This is the master execution pipeline for every task processed by the Gravity Agent System. Every non-trivial task MUST follow this pipeline. No agent is invoked ad hoc. No phase is skipped.

---

## Phase 0: System Bootstrap

### 0.1 — Load Global Rules

Load and internalize the rules from `gravity-skill/.agents/rules.md`. These rules govern:

- agent routing policy
- multi-agent composition rules
- mandatory system execution flow
- single-agent rule
- conflict resolution hierarchy
- internal output expectations

Rules take precedence over any agent's local preferences. If a conflict exists between an agent's SKILL.md and the global rules, the rules win.

### 0.2 — Load Shared Protocols

Load all shared skills and subsystems in this order:

1. `shared/SKILL.md` — Standard Data Schema, Error Handling Protocol, Agent Priority, Communication Rule
2. `shared/agent-registry/SKILL.md` — Auto-discovery and capability indexing
3. `shared/reasoning-protocol/SKILL.md` — Plan-Act-Review triad, impact assessment, confidence scoring
4. `shared/context-management/SKILL.md` — Token budgets, summarization strategy, priority pruning
5. `shared/checkpoint-protocol/SKILL.md` — Save/load/resume state, checkpoint lifecycle
6. `shared/hitl-protocol/SKILL.md` — Risk classification, approval gates, timeout handling
7. `shared/rollback-protocol/SKILL.md` — Pre-execution snapshots, rollback triggers, LIFO reversal
8. `shared/user-interaction-protocol/SKILL.md` — Plain-English summaries, proactive intelligence, smart confirmation gates

### 0.3 — Build Agent Registry

Execute the auto-discovery protocol from `shared/agent-registry/SKILL.md`:

1. Scan `agents/` directory for all subdirectories containing `SKILL.md`
2. Parse frontmatter: `name`, `description`, `capabilities`, `input_types`, `output_types`, `risk_level`, `priority`
3. Build capability → agent index for fast matching
4. Validate agents against required frontmatter schema
5. Flag invalid agents with warnings (missing `name` = ERROR, missing `capabilities` = WARNING)
6. Expose registry to decision-system and orchestrator

Registry is rebuilt at the START of every execution cycle. No system restart required when adding or removing agents.

### 0.4 — Checkpoint Recovery Check

Query `memory-system/short-term` for any `has_pending_recovery: true` checkpoints:

```
If checkpoint found AND not expired (< 24h):
  → Present to user: "Previous execution for [task] was interrupted at step [N/total]. Resume?"
  → If YES  → Load checkpoint, skip to Phase 3 (resume from last completed agent)
  → If NO   → Delete checkpoint, proceed normally

If checkpoint found AND expired (> 24h):
  → Auto-delete checkpoint
  → Proceed normally

If no checkpoint found:
  → Proceed normally
```

### Phase 0 Readiness Checklist

Before proceeding to Phase 1, ALL of the following must be true:

```
✅ Global rules loaded from gravity-skill/.agents/rules.md
✅ All 8 shared protocols loaded
✅ Agent registry built and validated
✅ Checkpoint recovery check completed (no pending recovery OR recovery resolved)
✅ Standard Data Schema version confirmed (currently: 2.0)
```

---

## Phase 1: Context Loading — Memory Stack

### 1.1 — Short-Term Memory

Reference: `memory-system/short-term/SKILL.md`

1. Parse user input and identify intent
2. Store as `current_task` in short-term memory with `task_type`:
   - `new` — fresh task, no prior context
   - `continuation` — follow-up to a previous task in the same session
   - `recovery` — resuming from checkpoint
3. If continuation: load previous `intermediate_results` and `active_agents`
4. Initialize `artifact_storage` section for this execution
5. Initialize `checkpoints` section

### 1.2 — Episodic Memory

Reference: `memory-system/episodic/SKILL.md`

1. Search for similar past cases by:
   - keywords and category match
   - agent combination pattern match
   - recency and relevance ranking
2. Extract `similar_cases` with `relevance_score`
3. Extract `lessons` (e.g., "Database schema should be defined before API endpoints")
4. Extract `warnings` (e.g., "Similar case failed when security-agent was skipped")
5. Check if similar tasks triggered **rollbacks** before
6. Check archived checkpoints for cognitive maps from related executions

Priority: Recent + successful cases first. Failed cases with resolution are HIGH PRIORITY to keep.

### 1.3 — Semantic Memory

Reference: `memory-system/semantic/SKILL.md`

1. Load relevant `rules` (hard constraints, immutable unless user overrides)
2. Load relevant `best_practices` (soft guidelines, updatable by feedback-system)
3. Load relevant `anti_patterns` (learned from episodic-memory failures)
4. Cross-reference rules with episodic insights for reinforcement or contradiction
5. Organize by domain: `security`, `database`, `backend`, `frontend`, `architecture`, `general`

### 1.4 — Long-Term Memory

Reference: `memory-system/long-term/SKILL.md`

1. Search for `recommended_patterns` relevant to the current task category
2. Retrieve `optimized_flows` with proven agent chains and execution orders
3. Check pattern lifecycle status:
   - `Candidate` (1-4 successful uses) — consider but do not depend
   - `Proven` (5+ uses, < 30% failure) — prefer
   - `Deprecated` (failure rate > 30%) — avoid
4. Provide recommendations to decision-system

### Memory Conflict Resolution

When memory sources disagree, resolve in this order:

1. **Security and hard rules** override everything else
2. **Short-term continuity** for the current task takes precedence over generic optimization
3. **Recent episodic failure evidence** outweighs abstract best practice when contexts are similar
4. **Long-term proven patterns** should influence routing when there is no stronger local evidence
5. If unresolved → escalate to `software-engineer-agent` as coordinator and mark the plan as lower confidence

---

## Phase 2: Decision & Planning

Reference: `decision-system/SKILL.md`

### 2.1 — Classify The Request

1. Analyze user intent, desired artifact, and affected layers
2. Classify into one PRIMARY category and any SUPPORTING categories:
   - `frontend`, `backend`, `database`, `ai`, `security`, `bug_fixing`, `system_design`, `code_review`, `documentation`
3. Determine the main deliverable to identify the primary category
4. Determine supporting categories by dependency or risk

### 2.2 — Select Agents Via Registry

Use the registry, not hardcoded names alone:

1. Extract keywords and task verbs from the user request
2. Match against agent `capabilities` in the registry
3. Rank matches by:
   - Direct capability match (exact) → score 1.0
   - Partial keyword match → score 0.5
   - Description match → score 0.3
4. If multiple agents match, use `priority` field to break ties
5. Validate selection against routing rules in `rules.md`:
   - If task is clearly frontend → `frontend-agent`, NOT `software-engineer-agent`
   - If task is clearly backend → `backend-agent`, NOT `software-engineer-agent`
   - If task changes schema → MUST include `database-agent`
   - If task touches auth/permissions/secrets → MUST include `security-agent`
   - If user asks for review → use `code-reviewer-agent` as primary

### 2.3 — Memory-Aware Routing Adjustment

Adjust agent selection based on memory insights:

- **Short-term**: Detect continuation or recovery; reuse existing artifacts and in-progress plans
- **Episodic**: Avoid agent combinations that recently failed in similar contexts
- **Semantic**: Apply domain rules and anti-patterns; enforce ordering rules (e.g., schema before API)
- **Long-term**: Prefer proven agent chains when the current case is similar

### 2.4 — Assess Risk Per Agent

For each selected agent:

1. Start with default `risk_level` from registry frontmatter
2. **Elevate** risk if the action:
   - deletes or drops data
   - changes auth or permission behavior
   - modifies production deployment or release flow
   - performs schema migration on existing data
   - exposes security-sensitive or compliance-sensitive surfaces
3. **Lower** risk if the task is:
   - read-only review
   - analysis only
   - documentation only
4. Mark `requires_approval: true` for `high` and `critical` actions

Risk levels: `low` → `medium` → `high` → `critical`

### 2.5 — Determine Execution Mode

- `single` — one agent can own the task safely
- `sequential` — dependencies exist between agents
- `parallel` — agents are independent
- `hybrid` — some groups run in parallel, others depend on prior outputs

### 2.6 — Calculate Context Budget

Using `shared/context-management/SKILL.md`:

1. Determine total tokens available for the execution chain
2. Allocate per-agent budgets:
   - Instructions (SKILL.md): 20%
   - Input Data: 40%
   - Memory Context: 15%
   - Reserved for Output: 25%
3. Apply per-agent overrides from context-management (e.g., `software-engineer-agent` gets 12000 total)
4. Flag if total chain budget is at risk

### 2.7 — Output Decision Plan

Produce a structured decision plan for the orchestrator:

```json
{
  "classification": {
    "primary_category": "backend",
    "supporting_categories": ["database", "security"]
  },
  "primary_agent": "backend-agent",
  "supporting_agents": ["database-agent", "security-agent", "code-reviewer-agent"],
  "agents": ["database-agent", "backend-agent", "security-agent", "code-reviewer-agent"],
  "execution_order": ["database-agent", "backend-agent", "security-agent", "code-reviewer-agent"],
  "execution_mode": "sequential",
  "reasoning": "...",
  "risk_assessment": {
    "database-agent": { "risk_level": "high", "reason": "...", "requires_approval": true },
    "backend-agent": { "risk_level": "medium", "reason": "...", "requires_approval": false }
  },
  "memory_insights": {
    "short_term": "...",
    "episodic": "...",
    "semantic": "...",
    "long_term": "..."
  },
  "context_budget": {
    "total_budget": 32000,
    "per_agent_allocation": {}
  },
  "system_skills_consulted": ["shared/SKILL.md", "shared/agent-registry/SKILL.md", "..."],
  "conflicts_detected": [],
  "registry_source": "auto-discovery",
  "confidence": 0.90
}
```

---

## Phase 3: Execution — Orchestrator Pipeline

Reference: `orchestrator/SKILL.md`

### 3.1 — Validate Decision Plan

Orchestrator receives the decision plan and validates it against `shared/SKILL.md` rules:

- Are all required agents present?
- Is the execution order consistent with dependencies?
- Is the total context budget feasible?
- Are HITL gates properly assigned for `high`/`critical` risk agents?

### 3.2 — Per-Agent Execution Pipeline

For EACH agent in `execution_order`, execute this sub-pipeline:

```
┌───────────────────────────────────────────────────────┐
│  Step A: HITL Gate (shared/hitl-protocol/SKILL.md)    │
│  ─────────────────────────────────────────────────    │
│  Check risk_level from decision plan:                 │
│    low/medium   → auto-proceed                        │
│    high/critical → PAUSE and present approval request: │
│      → Include: action_summary, impact_analysis,      │
│        alternatives, recommended_action                │
│      → Wait for user response (timeout: 300s)         │
│      → Responses: approve, approve_with_conditions,   │
│        reject, abort, modify                           │
│      → On timeout: default to ABORT (safe default)    │
│      → On reject: skip agent, mark skipped_by_user    │
│      → On abort: halt all, trigger full rollback      │
│                                                       │
│  Step B: Pre-Execution Snapshot                       │
│  (shared/rollback-protocol/SKILL.md)                  │
│  ─────────────────────────────────────────────────    │
│  Capture system state BEFORE this agent runs:         │
│    → files_modified, files_created, files_deleted      │
│    → schema_changes, config_changes                    │
│    → state_description                                 │
│  Store snapshot with unique snapshot_id                │
│                                                       │
│  Step C: Context Window Check                         │
│  (shared/context-management/SKILL.md)                 │
│  ─────────────────────────────────────────────────    │
│  Verify input size fits agent's token budget:          │
│    < 60% budget  → Full Pass (pass data as-is)        │
│    >= 60% budget → Smart Summary (summarize, keep key  │
│                    decisions, offload artifacts)        │
│    >= 90% budget → Reference Mode (store full output   │
│                    as artifact_ref, pass ref only)      │
│                                                       │
│  Step D: Reasoning Protocol                           │
│  (shared/reasoning-protocol/SKILL.md)                 │
│  ─────────────────────────────────────────────────    │
│  Agent MUST follow Plan-Act-Review triad:              │
│    1. PLAN: Analyze input, identify core problem,      │
│       outline approach                                 │
│    2. IMPACT: Evaluate cross-file and system impact    │
│    3. ACT: Generate proposed solution                  │
│    4. SELF-REVIEW: Check against plan and shared rules │
│       → Calculate confidence (0.0-1.0)                 │
│       → If confidence < 0.8: loop back to Plan         │
│         or flag risks                                  │
│                                                       │
│  Step E: Execute Agent                                │
│  ─────────────────────────────────────────────────    │
│  Run agent's SKILL.md instructions                    │
│    → Input via Standard Data Schema envelope           │
│    → Output via Standard Data Schema envelope          │
│    → Include reasoning_log and impact_assessment       │
│                                                       │
│  Step F: Save Checkpoint                              │
│  (shared/checkpoint-protocol/SKILL.md)                │
│  ─────────────────────────────────────────────────    │
│  After agent completes successfully:                  │
│    → Save checkpoint with:                             │
│      completed_agents, pending_agents,                 │
│      intermediate_outputs, decision_plan               │
│    → One active checkpoint per execution (overwrites)  │
│    → Checkpoint expires after 24h                      │
│                                                       │
│  Step G: Error Handling                               │
│  ─────────────────────────────────────────────────    │
│  If agent fails:                                      │
│    → Retry (max 2) with simplified prompt              │
│    → If retry fails → Escalate to                     │
│      software-engineer-agent                           │
│    → If escalation fails → Trigger rollback protocol   │
│    → On rollback: revert in LIFO order, invalidate     │
│      checkpoint, notify user via HITL, log to           │
│      episodic-memory as failure case                   │
└───────────────────────────────────────────────────────┘
```

### 3.3 — Data Passing Between Agents

1. Each agent output follows the Standard Data Schema
2. Orchestrator extracts `output.data` from completed Agent A
3. Apply context management: summarize if needed (Step C logic)
4. Inject into `input_received` of the next Agent B
5. Track data flow:

```
database-agent.output.data → [context check] → backend-agent.input_received
backend-agent.output.data  → [context check] → frontend-agent.input_received
```

### 3.4 — Parallel Execution Rules

- Parallel agents execute independently with no shared data during execution
- Checkpoint saves only after ALL parallel agents in a group complete
- If one parallel agent fails, others may continue if they are truly independent
- Merge parallel outputs before passing to the next sequential stage

### 3.5 — Conflict Resolution During Execution

If agent outputs conflict:

1. **Security** — Always wins (non-negotiable)
2. **Architecture** — `software-engineer-agent` decisions take precedence when system-level
3. **Implementation** — Most specific agent wins for its domain
4. **Tie-breaker** — Refer to Agent Priority in registry

When conflict is detected:
- Log conflict in output metadata
- Apply resolution hierarchy
- Document reasoning for audit trail

### 3.6 — User Interaction During Execution

Reference: `shared/user-interaction-protocol/SKILL.md`

- Use plain-English summaries, not raw JSON dumps
- If an agent discovers technical debt, security flaws, or performance issues while executing another task → flag proactively
- If an instruction is highly ambiguous → PAUSE and ask the user for clarification (Smart Ask)
- All final outputs involving significant changes trigger `documentation-agent`

---

## Phase 4: Evaluation & Learning

### 4.1 — Feedback System Evaluation

Reference: `feedback-system/SKILL.md`

Score the execution on 5 dimensions:

| Dimension | Weight | Scale | What It Measures |
|:--|:--|:--|:--|
| Accuracy | 30% | 0-10 | Is the output correct? |
| Cognitive Quality | 20% | 0-10 | Are reasoning logs and impact assessments logical? |
| Clarity | 20% | 0-10 | Is the output understandable? |
| Efficiency | 15% | 0-10 | Was the execution optimal? |
| Schema Compliance | 15% | 0-10 | Did agents follow the Standard Data Schema? |

Overall score = weighted average.

Additional evaluations:

- HITL effectiveness: Were approval gates appropriate?
- Rollback events: Were they necessary? Could they be prevented?
- Context management: Were summarizations accurate?
- Agent selection: Was the right agent used for each part?
- Execution order: Was the dependency order correct?

### 4.2 — Learning Triggers & Memory Routing

Based on the overall score, route feedback to memory systems:

```
If overall_score < 5:
  → Flag for review
  → Store in episodic-memory as "failure_case"
  → Report to user

If overall_score >= 7:
  → Store pattern in long-term-memory as "recommended"
  → Record agent chain and execution order as candidate pattern

If same issue detected 3+ times:
  → Promote fix to semantic-memory as a new rule
  → Update best_practices or add new anti_pattern
```

### 4.3 — Long-Term Memory Update

Reference: `memory-system/long-term/SKILL.md`

1. Store high-quality successful patterns (score >= 7)
2. Store HITL patterns: which risk classifications led to good outcomes
3. Store rollback cases: what triggered rollbacks and how to avoid them
4. Track pattern lifecycle:

```
New Pattern (score >= 7) → Candidate (1-4 uses)
    → Proven (5+ uses, < 30% failure)
    → Deprecated (failure rate > 30%)
```

Max storage: 100 patterns. Evict lowest-score first.

### 4.4 — Episodic Memory Update

Reference: `memory-system/episodic/SKILL.md`

Store as a new case:

- User request summary
- Agents used and execution order
- Outcome (success/partial/failed/rolled_back)
- Errors encountered and resolutions applied
- Archived checkpoint reference
- HITL decisions and their outcomes

Max storage: 50 most recent cases (FIFO eviction). Failed cases with resolution are HIGH PRIORITY to keep.

### 4.5 — Semantic Memory Update

Reference: `memory-system/semantic/SKILL.md`

- If feedback-system detects a consistent pattern (3+ occurrences): promote to a new rule
- If a new anti-pattern is identified from failure: add to anti_patterns
- Update best_practices if feedback data supports an improvement

---

## Phase 5: Post-Execution Cleanup

### 5.1 — Checkpoint Archival

1. Move the active checkpoint to episodic-memory as a historical archive
2. Include the full checkpoint lifecycle and archive location in execution metadata
3. Clear checkpoint from short-term-memory

### 5.2 — Artifact Cleanup

1. Clear artifact references from context management that are no longer needed
2. Clear rollback snapshots (no longer needed after success)
3. Release any held artifact_refs from short-term-memory artifact_storage

### 5.3 — Registry Statistics (Optional)

Update agent registry statistics:

- Track agent success rates per execution
- Track average execution times
- Track common failure modes
- Use statistics for future optimization

### 5.4 — Documentation Handoff

If significant changes occurred during execution:

1. Pass final execution results to `documentation-agent`
2. Generate human-readable walkthrough, README updates, or change log as appropriate
3. Follow `shared/user-interaction-protocol/SKILL.md` for output formatting

---

## Error Recovery Flow — Complete Reference

```
Agent fails during execution
    ↓
Retry with simplified prompt (max 2 retries)
    ↓ fails again
Escalate to software-engineer-agent for coordination
    ↓ fails again
Trigger Rollback Protocol (shared/rollback-protocol/SKILL.md):
    │
    ├─ Determine scope:
    │   ├─ Full Rollback: agent failed after max retries + escalation
    │   ├─ Partial Rollback: agent failed but others are independent
    │   └─ Selective Rollback: user-triggered via HITL
    │
    ├─ Execute rollback in reverse execution order (LIFO):
    │   ├─ Revert files (modified → restore, created → delete, deleted → restore)
    │   ├─ Revert schema changes (undo migrations)
    │   ├─ Revert config changes (restore pre-execution state)
    │   └─ Mark agent output as status: "rolled_back"
    │
    ├─ Invalidate active checkpoint (no resume into rolled-back state)
    │
    ├─ Notify user via HITL with rollback summary
    │
    ├─ Log to episodic-memory as failure case with root cause
    │
    └─ Report to feedback-system with rollback_status
```

### Rollback Order Rules

1. ALWAYS rollback in **reverse execution order** (LIFO)
2. Parallel agents: rollback all agents in the group simultaneously
3. Dependencies: if reverting Agent B, MUST also revert agents that consumed B's output
4. **Never** rollback security-agent fixes unless explicitly overridden by user

---

## Master Flow Diagram

```
                    ┌─────────────────────────┐
                    │    Phase 0: Bootstrap    │
                    │                         │
                    │  ● Load rules.md        │
                    │  ● Load 8 shared        │
                    │    protocols             │
                    │  ● Build agent registry  │
                    │  ● Check for pending     │
                    │    checkpoint recovery   │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │ Phase 1: Memory Loading │
                    │                         │
                    │  ● Short-term memory    │
                    │  ● Episodic memory      │
                    │  ● Semantic memory      │
                    │  ● Long-term memory     │
                    └────────────┬────────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │  Phase 2: Decision &    │
                    │     Planning            │
                    │                         │
                    │  ● Classify request     │
                    │  ● Select agents via    │
                    │    registry             │
                    │  ● Memory-aware routing │
                    │  ● Risk assessment      │
                    │  ● Execution mode       │
                    │  ● Context budget       │
                    │  ● Output decision plan │
                    └────────────┬────────────┘
                                 ↓
          ┌──────────────────────────────────────────┐
          │      Phase 3: Orchestrator Execution     │
          │                                          │
          │   For each agent in execution_order:     │
          │                                          │
          │   ┌────────────────────────────────────┐ │
          │   │ A. HITL Gate (risk check)          │ │
          │   │ B. Pre-Execution Snapshot          │ │
          │   │ C. Context Window Check            │ │
          │   │ D. Reasoning Protocol              │ │
          │   │    (Plan → Impact → Act → Review)  │ │
          │   │ E. Execute Agent                   │ │
          │   │ F. Save Checkpoint                 │ │
          │   │ G. Error Handling / Rollback       │ │
          │   └────────────────────────────────────┘ │
          │                                          │
          │   Data passing between agents:           │
          │   AgentA.output → [context mgmt] →       │
          │                   AgentB.input            │
          └──────────────────┬───────────────────────┘
                             ↓
                ┌─────────────────────────┐
                │ Phase 4: Evaluation &   │
                │    Learning             │
                │                         │
                │  ● Feedback scoring     │
                │    (5 dimensions)       │
                │  ● Learning triggers    │
                │  ● Long-term update     │
                │  ● Episodic update      │
                │  ● Semantic update      │
                └────────────┬────────────┘
                             ↓
                ┌─────────────────────────┐
                │  Phase 5: Cleanup       │
                │                         │
                │  ● Archive checkpoint   │
                │  ● Clear artifacts      │
                │  ● Update registry      │
                │    statistics           │
                │  ● Documentation        │
                │    handoff              │
                └─────────────────────────┘
```

---

## Protocol Cross-Reference

| Protocol | File | Purpose | Used In |
|:---------|:-----|:--------|:--------|
| Global Rules | `gravity-skill/.agents/rules.md` | Routing policy, execution flow, conflict resolution | Phase 0, Phase 2 |
| Standard Data Schema | `shared/SKILL.md` | Agent communication envelope, error handling | All Phases |
| Agent Registry | `shared/agent-registry/SKILL.md` | Auto-discover and index agents | Phase 0, Phase 2 |
| Reasoning Protocol | `shared/reasoning-protocol/SKILL.md` | Plan-Act-Review triad, confidence scoring | Phase 3 |
| Context Management | `shared/context-management/SKILL.md` | Token budgets, summarization, pruning | Phase 2, Phase 3 |
| Checkpoint Protocol | `shared/checkpoint-protocol/SKILL.md` | Save/load execution state, crash recovery | Phase 0, Phase 3, Phase 5 |
| HITL Protocol | `shared/hitl-protocol/SKILL.md` | Approval gates for risky actions | Phase 3 |
| Rollback Protocol | `shared/rollback-protocol/SKILL.md` | Undo changes on failure | Phase 3 |
| User Interaction | `shared/user-interaction-protocol/SKILL.md` | Human-friendly outputs, proactive flagging | Phase 3, Phase 5 |
| Decision System | `decision-system/SKILL.md` | Task classification, agent selection, risk assessment | Phase 2 |
| Orchestrator | `orchestrator/SKILL.md` | Multi-agent coordination, execution pipeline | Phase 3 |
| Feedback System | `feedback-system/SKILL.md` | Quality evaluation, learning triggers | Phase 4 |
| Short-Term Memory | `memory-system/short-term/SKILL.md` | Active task state, checkpoints, artifacts | Phase 1, Phase 3 |
| Episodic Memory | `memory-system/episodic/SKILL.md` | Past cases, lessons, warnings | Phase 1, Phase 4 |
| Semantic Memory | `memory-system/semantic/SKILL.md` | Rules, best practices, anti-patterns | Phase 1, Phase 4 |
| Long-Term Memory | `memory-system/long-term/SKILL.md` | Proven patterns, optimized flows | Phase 1, Phase 4 |

---

## Common Execution Patterns — Quick Reference

| Task Type | Agent Chain | Mode |
|:----------|:------------|:-----|
| Frontend-only (UI, component, page) | `frontend-agent` | single |
| Backend-only (API, middleware) | `backend-agent` | single |
| Schema/migration change | `database-agent` | single |
| Frontend + API | `backend-agent` → `frontend-agent` → `code-reviewer-agent` | sequential |
| Backend + schema | `database-agent` → `backend-agent` → `security-agent` → `code-reviewer-agent` | sequential |
| Full-stack (unclear scope) | `software-engineer-agent` → `database-agent` → `backend-agent` → `frontend-agent` → `security-agent` → `code-reviewer-agent` → `documentation-agent` | sequential |
| AI-powered feature | `ai-engineer-agent` → `backend-agent` → `frontend-agent` → `database-agent` → `security-agent` → `code-reviewer-agent` | hybrid |
| Bug fix | `bug-analyzer-agent` → specialist agent → `code-reviewer-agent` | sequential |
| Code review | `code-reviewer-agent` | single |
| Documentation | `documentation-agent` | single |

---

## Version History

| Version | Date | Changes |
|:--------|:-----|:--------|
| 1.0 | 2026-04-10 | Initial workflow pipeline |
| 2.0 | 2026-04-10 | Comprehensive upgrade: integrated rules.md alignment, full memory stack, reasoning protocol, context management, detailed per-agent pipeline, decision-system integration, conflict resolution, documentation handoff, master flow diagram |