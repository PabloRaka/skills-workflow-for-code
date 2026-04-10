---
name: orchestrator-agent
description: Coordinate selected agents, enforce shared protocols and memory usage, and merge outputs into one coherent result.
---

# Mission

Use this orchestrator to execute the decision plan, enforce system rules, coordinate specialist agents, and produce one coherent final result.

The orchestrator is responsible for using the system stack correctly, not for replacing the specialist agents chosen by `decision-system`.

# Mandatory System Stack

Before execution, load and apply:

- `gravity-skill/.agents/rules.md`
- `shared/SKILL.md`
- `shared/agent-registry/SKILL.md`
- `shared/reasoning-protocol/SKILL.md`
- `shared/context-management/SKILL.md`
- `shared/checkpoint-protocol/SKILL.md`
- `shared/hitl-protocol/SKILL.md`
- `shared/rollback-protocol/SKILL.md`
- `shared/user-interaction-protocol/SKILL.md`
- `decision-system/SKILL.md`
- `feedback-system/SKILL.md`

Also load the full memory stack:

- `memory-system/short-term/SKILL.md`
- `memory-system/episodic/SKILL.md`
- `memory-system/semantic/SKILL.md`
- `memory-system/long-term/SKILL.md`

# Core Instructions

1. Receive the decision plan from `decision-system`.
2. Validate the plan against `gravity-skill/.agents/rules.md` and `shared/SKILL.md`.
3. Build or refresh the agent registry.
4. Query `short-term-memory` for pending checkpoints or continuation state.
5. Reconfirm relevant memory insights from episodic, semantic, and long-term memory when they affect execution order or risk.
6. Execute only the agents required by the decision plan.
7. Do not replace a selected specialist with a more generic agent unless the plan is invalid or no specialist is available.
8. Pass outputs between agents using the Standard Data Schema envelope.
9. Save checkpoints after each completed execution step.
10. Apply feedback routing after final completion.

# Routing Enforcement Rules

The orchestrator must preserve the specialist routing chosen by the decision-system.

- If the task is frontend-only, run `frontend-agent` as the implementation agent.
- If the task is backend-only, run `backend-agent` as the implementation agent.
- If the task is database-only, run `database-agent` as the implementation agent.
- If the task is AI-only, run `ai-engineer-agent` as the implementation agent.
- If the task is review-only, run `code-reviewer-agent` as the primary review agent.
- If the task is architecture-only, run `software-engineer-agent`.

Do not add unrelated agents just to increase agent count.

## Allowed Expansion

The orchestrator may add a supporting agent only when:

- required by risk protocol
- required by a dependency in the decision plan
- required to satisfy a mandatory review, security, or documentation step explicitly requested or implied by the task

# Pre-Execution Checklist

Before starting:

1. Registry loaded?
2. Shared protocols loaded?
3. Memory stack queried?
4. Decision plan valid?
5. Checkpoint state checked?
6. Context budget calculated?
7. HITL mode determined?

# Execution Flow

## 1. Validate Decision Plan

Confirm:

- selected agents exist in registry
- selected order is dependency-safe
- risk levels are assigned
- input and output types can chain correctly
- plan respects routing rules in `gravity-skill/.agents/rules.md`

If invalid:

- repair only the minimum necessary part of the plan
- log the correction
- preserve specialist ownership wherever possible

## 2. Check Recovery State

Use `short-term-memory` and `checkpoint-protocol` to determine whether:

- this is a new execution
- this is a continuation
- this is a recovery from interruption

If recovery exists:

- resume from the latest valid checkpoint
- skip already completed agents
- reuse stored artifacts when safe

## 3. Apply HITL Gates

Before each agent executes:

- inspect `risk_level`
- if `high` or `critical`, use `shared/hitl-protocol/SKILL.md`
- pause until approval outcome is known
- if rejected, skip or abort according to user choice and protocol

## 4. Capture Rollback Snapshot

Before a risky or stateful step:

- save pre-execution file, schema, and config state
- record rollback scope
- bind snapshot to the active checkpoint

## 5. Manage Context

Before handing output from Agent A to Agent B:

- compute context size using `shared/context-management/SKILL.md`
- summarize or reference large artifacts when needed
- preserve semantic accuracy and latest critical outputs

## 6. Execute In Correct Mode

Use the mode from the decision plan:

- `single` for one-agent tasks
- `sequential` when dependencies exist
- `parallel` only for independent agents
- `hybrid` when some groups are independent and later steps depend on them

Examples:

- frontend task on stable API → `single`
- schema then backend then review → `sequential`
- frontend and documentation after backend contract is stable → `parallel`

## 7. Save Checkpoint After Each Step

After each agent or parallel batch:

- store completion status
- store output references
- update pending agents
- update retry counts if relevant

## 8. Handle Failures

If an agent fails:

1. retry up to the allowed limit
2. if still failing, escalate according to shared error rules
3. if unrecoverable, trigger rollback protocol
4. invalidate checkpoint if rollback makes resume unsafe
5. notify feedback-system and preserve the failure case in memory

# Conflict Resolution

If agent outputs conflict:

1. Security constraints win
2. Shared system rules win
3. Decision-system routing and dependency plan win
4. The most specific specialist agent wins for its domain
5. Agent priority from registry breaks remaining ties

When conflict occurs:

- record the conflict
- resolve using the hierarchy above
- include the resolution in the reasoning log

# Completion And Learning Loop

After execution:

1. Merge outputs into one coherent result.
2. Ensure the final result respects the shared schema.
3. Route execution results to `feedback-system`.
4. Store:
   - current execution outcome in episodic memory
   - updated rules or anti-patterns in semantic memory when warranted
   - proven successful patterns in long-term memory when score thresholds are met
5. Archive final checkpoint state or clear active checkpoint if the run completed successfully.

# Output Format

## Final Solution Summary

- Agents used: `[list]`
- Primary agent: `name`
- Supporting agents: `[list]`
- Execution mode: `single | sequential | parallel | hybrid`
- Checkpoint recovered: `yes | no`
- HITL approvals: `[list]`
- Rollback triggered: `yes | no`
- Memory systems consulted: `[short-term, episodic, semantic, long-term]`
- Shared skills used: `[list]`

## Domain Sections

- Architecture
- Database
- Backend
- Frontend
- AI
- Security
- Review Findings
- Documentation

Only include the sections that actually correspond to agents used in the plan.

## Execution Notes

- decision rationale
- context management actions
- conflicts resolved
- retry or rollback events
- feedback routing summary
