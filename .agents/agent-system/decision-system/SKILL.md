---
name: decision-system
description: Analyze user request and determine which agents should be activated
---

# Instructions

1. Analyze user intent
2. **Query agent-registry** — Get available agents and their capabilities
3. Classify request into categories:
   - frontend
   - backend
   - database
   - ai
   - security
   - bug fixing
   - system design
   - code review

4. Determine:
   - Single agent OR multi-agent
   - Execution order (if multiple)
   - Parallel vs sequential execution
   - **Risk level per agent** (from agent-registry metadata + action analysis)

5. Check memory systems before deciding:
   - Query episodic-memory for similar past cases
   - Query semantic-memory for applicable rules
   - Use insights to optimize agent selection

6. Output structured plan

# Agent Selection via Registry

Instead of hardcoded rules, decision-system queries the agent-registry:

1. Extract keywords from user request
2. Match keywords against agent `capabilities` in registry
3. Rank matching agents by `priority` (lower = higher priority)
4. Verify selected agents have compatible `input_types` / `output_types` for chaining
5. Fallback: if no capability match, route to `software-engineer-agent` as coordinator

## Dynamic Matching Example

```
User: "Build a secure API with database"
Keywords: [api, secure, database]

Registry query:
  "api" → backend-agent (priority 3)
  "secure" → security-agent (priority 1)  
  "database" → database-agent (priority 4)

Result: [database-agent, backend-agent, security-agent]
```

# Risk Level Assessment

For each selected agent, determine risk level:

1. Start with agent's `risk_level` from registry (default)
2. **Elevate** risk if:
   - Action involves DELETE, DROP, or REMOVE operations → +1 level
   - Action modifies auth/security systems → +1 level
   - Action targets production environment → set to `critical`
   - Action involves schema migration on existing data → +1 level
3. **Lower** risk if:
   - Action is read-only or analysis → set to `low`
   - Action only generates new code (no modification) → keep or lower 1 level

Risk levels: `low` → `medium` → `high` → `critical`

# Multi-Category Handling

When a request spans multiple categories:

1. Identify the PRIMARY category (main goal)
2. Identify SUPPORTING categories (dependencies)
3. Order execution: dependencies FIRST, then primary
4. Example: "Build a secure API with database"
   - PRIMARY: backend (API)
   - SUPPORTING: database (schema), security (auth)
   - ORDER: database → backend → security

# Conflict Resolution

When memory sources disagree:

1. Semantic Memory says rule A, but Episodic Memory shows rule A failed before:
   - **Prioritize Episodic** if failure was recent (< 5 interactions ago)
   - **Prioritize Semantic** if episodic case was edge-case or context-specific
   - **Flag conflict** in output for orchestrator awareness

2. Multiple agents claim ownership of a task:
   - Refer to `priority` field in agent-registry
   - If still ambiguous, assign to software-engineer-agent as coordinator

3. Resolution hierarchy:
   - Security constraints (non-negotiable)
   - Episodic evidence (proven results)
   - Semantic rules (established patterns)
   - Agent registry priority

# Output Format

```json
{
  "agents": ["backend-agent", "database-agent"],
  "execution_order": ["database-agent", "backend-agent"],
  "execution_mode": "sequential",
  "reasoning": "Need schema before API implementation",
  "risk_assessment": {
    "database-agent": {
      "risk_level": "high",
      "reason": "Creating new schema with migrations",
      "requires_approval": true
    },
    "backend-agent": {
      "risk_level": "medium",
      "reason": "Generating new API code, no existing code modified",
      "requires_approval": false
    }
  },
  "memory_insights": {
    "episodic": "Similar case succeeded with this order",
    "semantic": "Rule: always define schema before endpoints"
  },
  "conflicts_detected": [],
  "registry_source": "auto-discovery",
  "confidence": 0.85
}
```