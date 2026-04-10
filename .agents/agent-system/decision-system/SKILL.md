---
name: decision-system
description: Analyze user requests, consult memory and registry systems, and select the correct specialist agents with execution order and risk assessment.
---

# Mission

Use this system to classify the user request, consult the shared memory and registry stack, and choose the right execution agent or agent chain.

This system must route work to the most specific capable agent, not to the most generic one.

# Mandatory Inputs Before Routing

Before selecting agents, always consult:

1. `shared/agent-registry/SKILL.md`
2. `memory-system/short-term/SKILL.md`
3. `memory-system/episodic/SKILL.md`
4. `memory-system/semantic/SKILL.md`
5. `memory-system/long-term/SKILL.md`
6. `shared/SKILL.md`
7. `gravity-skill/.agents/rules.md`

# Core Instructions

1. Analyze user intent, desired artifact, and affected layers.
2. Check `short-term-memory` for:
   - active continuation
   - interrupted execution
   - existing checkpoint
   - already-produced artifacts that may change routing
3. Query `episodic-memory` for similar past cases and warnings.
4. Query `semantic-memory` for hard rules, best practices, and anti-patterns.
5. Query `long-term-memory` for proven agent combinations and execution order.
6. Query `agent-registry` to find available specialist agents and their capabilities.
7. Classify the request into one primary category and any supporting categories.
8. Select:
   - primary agent
   - supporting agents
   - execution order
   - execution mode
   - risk level per agent
9. Output a structured decision plan for the orchestrator.

# Primary Routing Rules

Route to the most specific capable agent based on task intent.

| Task Intent | Primary Agent |
|:--|:--|
| UI, page, component, responsive layout, styling, form, dashboard, client UX | `frontend-agent` |
| API, server logic, middleware, webhook, websocket, auth implementation, integration | `backend-agent` |
| Schema, migration, indexing, query design, data integrity, relational structure | `database-agent` |
| AI, ML, LLM, RAG, embeddings, prompt workflow, model eval, inference | `ai-engineer-agent` |
| Security audit, permission review, auth risk, secrets, compliance | `security-agent` |
| Bug triage, reproduction, root-cause analysis | `bug-analyzer-agent` |
| Code review, regression review, findings-first PR review | `code-reviewer-agent` |
| Architecture, module boundaries, migration strategy, CI/CD, system design | `software-engineer-agent` |
| Documentation, README, runbook, walkthrough | `documentation-agent` |

# Routing Constraints

- If the task is clearly frontend, choose `frontend-agent`, not `software-engineer-agent`.
- If the task is clearly backend, choose `backend-agent`, not `software-engineer-agent`.
- If the task changes schema or migration behavior, include `database-agent`.
- If the task touches auth, permissions, secrets, or sensitive data, include `security-agent`.
- If the user asks for review, use `code-reviewer-agent` as primary.
- Use `software-engineer-agent` as primary only for architecture-heavy, system-wide, or ambiguous cross-domain tasks.
- Fallback to `software-engineer-agent` only when no specialist capability match is strong enough.

# Category Classification

Classify the request into one or more categories:

- frontend
- backend
- database
- ai
- security
- bug_fixing
- system_design
- code_review
- documentation

If multiple categories exist:

1. Determine the PRIMARY category by the main deliverable.
2. Determine SUPPORTING categories by dependency or risk.
3. Route dependencies before dependents where possible.

# Multi-Agent Selection Rules

When a task spans multiple domains, compose a chain instead of forcing one agent to own everything.

## Common Patterns

### Frontend feature backed by backend

- Primary: `frontend-agent`
- Supporting: `backend-agent` if API changes are required
- Review: `code-reviewer-agent` for risky changes

Suggested order:
- `backend-agent` → `frontend-agent` → `code-reviewer-agent`

### Backend feature requiring schema work

- Primary: `backend-agent`
- Supporting: `database-agent`
- Add `security-agent` if auth or sensitive data is affected

Suggested order:
- `database-agent` → `backend-agent` → `security-agent` → `code-reviewer-agent`

### Full-stack feature with unclear architecture

- Primary: `software-engineer-agent`
- Supporting as needed:
  - `database-agent`
  - `backend-agent`
  - `frontend-agent`
  - `security-agent`
  - `code-reviewer-agent`
  - `documentation-agent`

### AI-powered feature

- Primary: `ai-engineer-agent`
- Supporting:
  - `backend-agent` for serving or orchestration
  - `frontend-agent` for UX
  - `database-agent` for data/vector storage
  - `security-agent` for sensitive data or access controls

### Bug investigation and fix

- Primary: `bug-analyzer-agent`
- Supporting: owning specialist agent
- Final review: `code-reviewer-agent`

# Agent Selection via Registry

Use the registry, not hardcoded names alone:

1. Extract keywords and task verbs from the user request.
2. Match against agent `capabilities`.
3. Rank matches by:
   - direct capability match
   - description match
   - priority
   - compatibility with expected input/output chaining
4. Use the routing rules in this skill and `gravity-skill/.agents/rules.md` to validate the result.

If registry ranking and routing rules disagree:

- prefer the more specific specialist agent
- document the conflict for orchestrator visibility

# Memory-Aware Routing

Use memory systems to improve routing quality:

- `short-term-memory`
  - detect continuation or recovery
  - reuse existing artifacts and in-progress plans

- `episodic-memory`
  - learn from recent success and failure cases
  - avoid agent combinations that recently failed in similar contexts

- `semantic-memory`
  - apply domain rules and anti-patterns
  - enforce established ordering rules such as schema before API

- `long-term-memory`
  - prefer proven agent chains and optimal ordering when the current case is similar

## Conflict Resolution Between Memory Sources

1. Security and hard rules override everything else.
2. Short-term continuity for the current task takes precedence over generic optimization.
3. Recent episodic failure evidence outweighs abstract best practice when contexts are similar.
4. Long-term proven patterns should influence routing when there is no stronger local evidence.
5. If unresolved, escalate to `software-engineer-agent` as coordinator and mark the plan as lower confidence.

# Risk Level Assessment

For each selected agent:

1. Start with default `risk_level` from registry.
2. Elevate risk if the action:
   - deletes or drops data
   - changes auth or permission behavior
   - modifies production deployment or release flow
   - performs schema migration on existing data
   - exposes security-sensitive or compliance-sensitive surfaces
3. Lower risk if the task is:
   - read-only review
   - analysis only
   - documentation only
4. Mark `requires_approval` for `high` and `critical` actions.

Risk levels:

- `low`
- `medium`
- `high`
- `critical`

# Execution Mode Rules

- `single` when one agent can own the task safely
- `sequential` when dependencies exist
- `parallel` when agents are independent
- `hybrid` when some groups can run in parallel but others depend on prior outputs

Examples:

- frontend-only component task → `single`
- schema then API → `sequential`
- backend and frontend polish on stable contract → `parallel`
- architecture then implementation branches → `hybrid`

# Output Format

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
  "reasoning": "The request primarily asks for backend API work, but the feature depends on schema changes and touches auth-sensitive behavior.",
  "risk_assessment": {
    "database-agent": {
      "risk_level": "high",
      "reason": "Schema migration on existing records",
      "requires_approval": true
    },
    "backend-agent": {
      "risk_level": "medium",
      "reason": "Server-side feature implementation",
      "requires_approval": false
    },
    "security-agent": {
      "risk_level": "medium",
      "reason": "Review of auth-sensitive behavior",
      "requires_approval": false
    },
    "code-reviewer-agent": {
      "risk_level": "low",
      "reason": "Read-focused review pass",
      "requires_approval": false
    }
  },
  "memory_insights": {
    "short_term": "No active checkpoint",
    "episodic": "Similar API task failed when security review was skipped",
    "semantic": "Rule: define schema before backend handlers",
    "long_term": "Proven flow: database -> backend -> security -> review"
  },
  "system_skills_consulted": [
    "shared/SKILL.md",
    "shared/agent-registry/SKILL.md",
    "memory-system/short-term/SKILL.md",
    "memory-system/episodic/SKILL.md",
    "memory-system/semantic/SKILL.md",
    "memory-system/long-term/SKILL.md",
    "gravity-skill/.agents/rules.md"
  ],
  "conflicts_detected": [],
  "registry_source": "auto-discovery",
  "confidence": 0.90
}
```
