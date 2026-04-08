---
name: decision-system
description: Analyze user request and determine which agents should be activated
---

# Instructions

1. Analyze user intent
2. Classify request into categories:
   - frontend
   - backend
   - database
   - ai
   - security
   - bug fixing
   - system design
   - code review

3. Determine:
   - Single agent OR multi-agent
   - Execution order (if multiple)
   - Parallel vs sequential execution

4. Check memory systems before deciding:
   - Query episodic-memory for similar past cases
   - Query semantic-memory for applicable rules
   - Use insights to optimize agent selection

5. Output structured plan

# Decision Rules

- UI/UX → frontend-agent
- API / server → backend-agent
- Data structure → database-agent
- ML / AI → ai-engineer-agent
- Vulnerability → security-agent
- Error / crash → bug-analyzer-agent
- Architecture → software-engineer-agent
- Code quality → code-reviewer-agent

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
   - Refer to Agent Priority in shared/SKILL.md
   - If still ambiguous, assign to software-engineer-agent as coordinator

3. Resolution hierarchy:
   - Security constraints (non-negotiable)
   - Episodic evidence (proven results)
   - Semantic rules (established patterns)
   - Default agent priority

# Output Format

```json
{
  "agents": ["backend-agent", "database-agent"],
  "execution_order": ["database-agent", "backend-agent"],
  "execution_mode": "sequential",
  "reasoning": "Need schema before API implementation",
  "memory_insights": {
    "episodic": "Similar case succeeded with this order",
    "semantic": "Rule: always define schema before endpoints"
  },
  "conflicts_detected": [],
  "confidence": 0.85
}
```