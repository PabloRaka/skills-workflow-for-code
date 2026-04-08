---
name: hitl-protocol
description: Human-in-the-Loop approval gates for high-risk agent actions
---

# Instructions

1. Classify every agent action by risk level
2. Enforce approval gates for high-risk and critical actions
3. Auto-proceed for low and medium risk actions
4. Present clear approval requests to user with context
5. Handle approval timeout with safe defaults

# Risk Classification

Every agent action is classified into one of four risk levels:

| Risk Level | Description | Approval Required | Examples |
|:-----------|:------------|:------------------|:---------|
| `low` | Read-only, analysis, review | ❌ No | Code review, analysis, suggestions |
| `medium` | New code generation, non-destructive changes | ❌ No | Generate code, create new files, add features |
| `high` | Modify existing systems, schema changes | ✅ Yes | Modify database schema, change auth system, update configs |
| `critical` | Destructive, irreversible, or security-impacting | ✅ Yes | Delete files/data, deploy to production, modify security rules |

# Risk Classification by Agent

| Agent | Default Risk | Elevated Risk Conditions |
|:------|:-------------|:------------------------|
| code-reviewer-agent | `low` | — |
| bug-analyzer-agent | `low` | `medium` if fix modifies production code |
| ai-engineer-agent | `medium` | `high` if deploying model |
| frontend-agent | `medium` | `high` if modifying auth UI |
| backend-agent | `medium` | `high` if modifying API auth/permissions |
| database-agent | `high` | `critical` if dropping tables/columns |
| security-agent | `high` | `critical` if modifying auth/encryption |
| software-engineer-agent | `medium` | `high` if restructuring architecture |

# Approval Gate Protocol

When orchestrator encounters a `high` or `critical` risk action:

## Step 1: Pause Execution
- Stop the agent execution pipeline
- Do NOT execute the flagged agent yet

## Step 2: Present Approval Request

```json
{
  "approval_request": {
    "request_id": "apr_exec001_step03",
    "execution_id": "exec_001",
    "agent": "database-agent",
    "risk_level": "critical",
    "action_summary": "Drop column 'legacy_email' from users table and add migration",
    "impact_analysis": {
      "files_affected": ["migrations/002_alter_users.sql"],
      "data_at_risk": "legacy_email column data will be permanently deleted",
      "reversible": false,
      "estimated_blast_radius": "All user records (50k+ rows)"
    },
    "alternatives": [
      "Soft-delete: rename column instead of dropping",
      "Archive: backup column data before dropping"
    ],
    "recommended_action": "approve_with_backup",
    "timeout_seconds": 300,
    "timeout_default": "abort"
  }
}
```

## Step 3: Wait for User Response

Valid responses:
- `approve` — Proceed with the action as planned
- `approve_with_conditions` — Proceed but with user-specified modifications
- `reject` — Skip this agent, continue with next (if independent)
- `abort` — Stop entire execution, trigger rollback
- `modify` — User provides alternative instructions

## Step 4: Execute Decision

| Response | Action |
|:---------|:-------|
| `approve` | Resume agent execution normally |
| `approve_with_conditions` | Inject user conditions into agent input, then execute |
| `reject` | Skip agent, mark as `skipped_by_user`, continue pipeline |
| `abort` | Halt execution, trigger rollback protocol |
| `modify` | Re-plan with modified instructions, may re-trigger approval |

# Timeout Handling

- Default timeout: **300 seconds** (5 minutes)
- If user does not respond within timeout:
  - `high` risk → Default to `abort` (safe default)
  - `critical` risk → ALWAYS default to `abort`
- Timeout event is logged for feedback-system

# Approval Log

All approval events are logged:

```json
{
  "approval_log": {
    "request_id": "apr_exec001_step03",
    "risk_level": "critical",
    "decision": "approve",
    "decided_by": "user",
    "decided_at": "ISO 8601",
    "response_time_ms": 12000,
    "conditions": [],
    "timeout_occurred": false
  }
}
```

# Integration Rules

- **Decision System**: Must include `risk_level` for each agent in the execution plan
- **Orchestrator**: Must check risk level BEFORE executing each agent
- **Checkpoint**: Save checkpoint BEFORE entering approval wait (so crash during wait is recoverable)
- **Rollback**: If user chooses `abort`, rollback protocol is triggered automatically
- **Feedback**: Log approval patterns to optimize future risk classification

# Override Rules

- User can set `auto_approve_all: true` to skip ALL approval gates (expert mode)
- User can elevate risk: manually flag any action as `critical`
- Security-agent findings of `critical` risk CANNOT be auto-approved (always require human review)
