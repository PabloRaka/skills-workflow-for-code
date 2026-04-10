# Antigravity Rules of Engagement for `.agents` System

As an AI assistant in this workspace, I must execute work through the logic defined in `gravity-skill/.agents/agent-system/`. I do not choose agents ad hoc. I use the system stack, memory stack, and specialized agents deliberately.

## Core Mandates

1. **Bootstrap Check**
   - At the beginning of a session, check `gravity-skill/.agents/agent-system/` for system updates.

2. **Decision-System First**
   - Every non-trivial task must be classified by `decision-system` before selecting execution agents.
   - Do not default to `software-engineer-agent` for everything.
   - Use the most specific capable agent for the task category.

3. **Mandatory Shared Skill Stack**
   - For complex executions, the system must consult and apply these shared skills and subsystems:
     - `shared/SKILL.md`
     - `shared/agent-registry/SKILL.md`
     - `shared/reasoning-protocol/SKILL.md`
     - `shared/context-management/SKILL.md`
     - `shared/checkpoint-protocol/SKILL.md`
     - `shared/hitl-protocol/SKILL.md`
     - `shared/rollback-protocol/SKILL.md`
     - `shared/user-interaction-protocol/SKILL.md`
     - `decision-system/SKILL.md`
     - `orchestrator/SKILL.md`
     - `feedback-system/SKILL.md`

4. **Mandatory Memory Stack**
   - The system must use the memory stack as part of agent planning and execution:
     - `memory-system/short-term/SKILL.md` for active task state, checkpoints, and artifact refs
     - `memory-system/episodic/SKILL.md` for similar past cases and lessons learned
     - `memory-system/semantic/SKILL.md` for reusable rules, best practices, and anti-patterns
     - `memory-system/long-term/SKILL.md` for proven execution patterns and optimized flows

5. **Orchestrator Enforcement**
   - Complex tasks must run through `orchestrator-agent`.
   - Single-domain tasks may execute only one specialized agent, but the task must still pass through decision logic, shared rules, and memory checks.

6. **Standard Data Schema**
   - All internal reasoning and inter-agent handoff must conform to the envelope defined in `shared/SKILL.md`.

7. **HITL Gates**
   - High and critical risk actions require explicit user approval via `shared/hitl-protocol/SKILL.md`.

8. **Checkpoint, Rollback, and Feedback**
   - Checkpoints must be created and updated through `shared/checkpoint-protocol/SKILL.md`.
   - Failures must follow `shared/rollback-protocol/SKILL.md`.
   - Completed executions must be evaluated by `feedback-system` and routed back into memory systems.

## Agent Routing Policy

The system must route work to the most appropriate specialist agent based on the actual task.

### Direct Routing Rules

- **Frontend work** → `frontend-agent`
  - Use for UI, UX, pages, components, styling, responsiveness, forms, client-side state, dashboards, tables, and accessibility.

- **Backend work** → `backend-agent`
  - Use for APIs, server logic, auth implementation, middleware, queues, websockets, webhooks, integrations, and runtime behavior.

- **Database work** → `database-agent`
  - Use for schema design, migrations, indexing, query optimization, normalization, constraints, and data integrity changes.

- **AI or ML work** → `ai-engineer-agent`
  - Use for AI features, ML pipelines, LLM workflows, prompts, RAG, embeddings, model evaluation, and inference systems.

- **Security work** → `security-agent`
  - Use for audits, permission systems, auth architecture review, secrets handling, vulnerability checks, and compliance-sensitive changes.

- **Bug investigation** → `bug-analyzer-agent`
  - Use for reproduction, root-cause analysis, failure triage, and narrowing problem scope before implementation.

- **Code review** → `code-reviewer-agent`
  - Use for PR review, regression analysis, findings-first implementation review, and test gap detection.

- **Architecture or system design** → `software-engineer-agent`
  - Use for module boundaries, architecture, migration strategy, CI/CD, system decomposition, and cross-domain planning.

- **Documentation work** → `documentation-agent`
  - Use for README, guides, runbooks, architecture walkthroughs, and human-facing documentation.

### Routing Constraints

- Do not use `software-engineer-agent` for pure frontend implementation when `frontend-agent` is the correct specialist.
- Do not use `software-engineer-agent` for pure backend implementation when `backend-agent` is the correct specialist.
- Do not skip `database-agent` when the task changes schema, migrations, or data integrity rules.
- Do not skip `security-agent` when auth, permissions, secrets, or sensitive data flows are in scope.
- Do not skip `code-reviewer-agent` when the user asks for review or when a risky multi-agent change needs a review pass.

## Multi-Agent Composition Rules

When a task spans multiple domains, use the primary agent plus supporting agents in dependency order.

### Common Execution Patterns

- **Build frontend feature backed by API**
  - `backend-agent` → `frontend-agent` → `code-reviewer-agent`

- **Build backend feature requiring schema changes**
  - `database-agent` → `backend-agent` → `security-agent` if auth or sensitive data is involved → `code-reviewer-agent`

- **Build full-stack feature from unclear requirements**
  - `software-engineer-agent` for system plan
  - then `database-agent` if schema changes are needed
  - then `backend-agent`
  - then `frontend-agent`
  - then `security-agent` when risk warrants it
  - then `code-reviewer-agent`
  - then `documentation-agent` if docs are requested or needed

- **Build AI-powered feature**
  - `ai-engineer-agent` as primary
  - add `backend-agent` for serving or integration
  - add `frontend-agent` for UI
  - add `database-agent` for vector or data storage
  - add `security-agent` when sensitive data or model access controls exist
  - end with `code-reviewer-agent` for risky changes

- **Investigate and fix a bug**
  - `bug-analyzer-agent` first
  - then the specialist agent that owns the failing layer
  - then `code-reviewer-agent`

## Mandatory System Execution Flow

For every non-trivial task:

1. Load global rules from `gravity-skill/.agents/rules.md`
2. Load shared schema and protocols from `shared/`
3. Build registry via `shared/agent-registry/SKILL.md`
4. Consult memory systems:
   - `short-term-memory`
   - `episodic-memory`
   - `semantic-memory`
   - `long-term-memory`
5. Run `decision-system` to select:
   - primary agent
   - supporting agents
   - execution order
   - execution mode
   - risk level per agent
6. Execute through `orchestrator-agent`
7. Apply:
   - HITL gates
   - checkpointing
   - context management
   - rollback if needed
8. Pass result to `feedback-system`
9. Store outcomes and lessons back into memory systems

## Single-Agent Rule

If the task clearly belongs to one domain:

- Use only the correct specialist agent for execution.
- Still apply decision-system classification.
- Still apply memory lookup, reasoning protocol, and shared schema.
- Do not involve unrelated agents just to "use more agents."

Example:

- "Create a responsive dashboard page" → `frontend-agent`
- "Create REST API endpoint for orders" → `backend-agent`
- "Add migration for users table" → `database-agent`
- "Review this PR" → `code-reviewer-agent`

## Conflict Resolution Hierarchy

When instructions, memory, or agents disagree:

1. Security constraints
2. Shared schema and system protocols
3. Decision-system routing
4. Specialist agent ownership
5. Agent priority from registry
6. Long-term and episodic evidence
7. Semantic best practices

If conflict remains unresolved:

- escalate to `software-engineer-agent` for coordination
- document the conflict in the reasoning log

## Internal Output Expectations

When responding as an agent within this system, internal outputs should make it visible that the system stack was used.

Recommended internal trace fields:

- `rules_loaded`
- `shared_skills_used`
- `memory_sources_used`
- `selected_agents`
- `execution_order`
- `risk_assessment`

Example:

```json
{
  "agent_name": "Antigravity",
  "status": "success",
  "output": {
    "type": "logic | documentation | analysis | review | code | design",
    "data": "...",
    "reasoning_log": [
      "checked .agents bootstrap",
      "loaded shared schema and protocols",
      "queried memory systems",
      "used decision-system for routing",
      "executed selected specialist agents"
    ]
  }
}
```

---
*Updated on 2026-04-10*
