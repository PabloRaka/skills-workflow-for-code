# Example: Full-Stack E-commerce Deployment — End-to-End Orchestration

## Scenario
User requested: "Build a complete e-commerce API with product management, user authentication, and security hardening."

This example shows the complete orchestration flow using ALL protocols: Registry, Decision, HITL, Context Management, Checkpointing, and Rollback (not triggered as all agents succeed).

---

## Phase 0: System Initialization

### Agent Registry Scan
```json
{
  "registry_version": "1.0",
  "total_agents": 8,
  "agents_relevant": [
    {"name": "database-agent", "capabilities": ["database", "schema"], "risk_level": "high", "priority": 4},
    {"name": "backend-agent", "capabilities": ["api", "backend"], "risk_level": "medium", "priority": 3},
    {"name": "security-agent", "capabilities": ["security", "vulnerability"], "risk_level": "high", "priority": 1}
  ]
}
```

### Checkpoint Check
```
No pending checkpoints found. Starting fresh execution.
```

---

## Phase 2: Decision & Planning

```json
{
  "agents": ["database-agent", "backend-agent", "security-agent"],
  "execution_order": ["database-agent", "backend-agent", "security-agent"],
  "execution_mode": "sequential",
  "reasoning": "Schema must exist before API, security reviews API output",
  "risk_assessment": {
    "database-agent": {"risk_level": "high", "requires_approval": true, "reason": "Creating new tables with migrations"},
    "backend-agent": {"risk_level": "medium", "requires_approval": false, "reason": "Generating new API code"},
    "security-agent": {"risk_level": "low", "requires_approval": false, "reason": "Read-only analysis of code"}
  },
  "context_budget": {
    "total_available": 24000,
    "per_agent": {"database-agent": 8000, "backend-agent": 8000, "security-agent": 8000}
  },
  "confidence": 0.91
}
```

---

## Phase 3: Execution

### Agent 1: database-agent

**HITL Gate:** `risk_level: high` → Approval required
```json
{
  "approval_request": {
    "agent": "database-agent",
    "risk_level": "high",
    "action_summary": "Create 5 tables (users, products, categories, orders, order_items) with indexes and constraints",
    "data_at_risk": "None (creating new schema)",
    "reversible": true
  }
}
```
**User response:** `approve` ✅

**Snapshot captured:** `snap_exec025_step01`

**Execution result:**
```json
{
  "agent_name": "database-agent",
  "status": "success",
  "confidence": 0.95,
  "output": {
    "type": "design",
    "data": {
      "db_type": "PostgreSQL",
      "tables": ["users", "products", "categories", "orders", "order_items"],
      "indexes": 9,
      "constraints": ["FK", "CHECK", "UNIQUE"]
    }
  },
  "context_info": {"input_tokens": 600, "output_tokens": 3200, "summarized": false}
}
```

**Checkpoint saved:** `chk_exec025_step01`

---

### Agent 2: backend-agent

**HITL Gate:** `risk_level: medium` → Auto-proceed ✅

**Context check:** database-agent output = 3200 tokens. Backend budget = 8000. Fits. ✅

**Snapshot captured:** `snap_exec025_step02`

**Execution result:**
```json
{
  "agent_name": "backend-agent",
  "status": "success",
  "confidence": 0.92,
  "input_received": {
    "from_agent": "database-agent",
    "task_summary": "Build REST API for e-commerce with the provided schema",
    "summarized": false
  },
  "output": {
    "type": "code",
    "data": {
      "framework": "Express.js + Prisma",
      "endpoints": 15,
      "auth_strategy": "JWT",
      "features": ["CRUD", "pagination", "filtering", "auth middleware"]
    }
  },
  "context_info": {"input_tokens": 3800, "output_tokens": 4200, "summarized": false}
}
```

**Checkpoint saved:** `chk_exec025_step02`

---

### Agent 3: security-agent

**HITL Gate:** `risk_level: low` → Auto-proceed ✅

**Context check:** Combined previous outputs = 7400 tokens. Security budget = 8000.  
⚠️ Near limit (92.5%). Apply priority pruning: drop `metadata` and `dependencies` from previous outputs.  
After pruning: 5800 tokens ✅

**Snapshot captured:** `snap_exec025_step03`

**Execution result:**
```json
{
  "agent_name": "security-agent",
  "status": "success",
  "confidence": 0.94,
  "input_received": {
    "from_agent": "backend-agent",
    "task_summary": "Security audit of e-commerce API",
    "summarized": false
  },
  "output": {
    "type": "analysis",
    "data": {
      "vulnerabilities": [
        {"type": "Missing Rate Limiting", "risk": "medium", "fix": "Add express-rate-limit to auth endpoints"},
        {"type": "No CORS Configuration", "risk": "medium", "fix": "Configure allowed origins"}
      ],
      "overall_risk": "medium",
      "critical_count": 0,
      "recommendations": ["Add helmet.js", "Enable HTTPS only", "Add request ID for tracing"]
    }
  },
  "context_info": {"input_tokens": 5800, "output_tokens": 1800, "summarized": false, "pruned_fields": ["metadata", "dependencies"]}
}
```

**Checkpoint saved:** `chk_exec025_step03`

---

## Phase 4: Final Output Assembly

```json
{
  "execution_id": "exec_025",
  "status": "success",
  "decision_summary": {
    "agents_used": ["database-agent", "backend-agent", "security-agent"],
    "agents_skipped": [],
    "execution_mode": "sequential",
    "total_execution_time_ms": 11500,
    "total_tokens_used": 19600
  },
  "hitl_summary": {
    "approvals_requested": 1,
    "approvals_granted": 1,
    "approvals_rejected": 0,
    "auto_proceeded": 2
  },
  "context_summary": {
    "summarizations_applied": 0,
    "pruning_applied": 1,
    "overflow_prevented": 1
  },
  "rollback_summary": {
    "triggered": false,
    "snapshots_captured": 3,
    "snapshots_cleaned": true
  },
  "checkpoint_summary": {
    "checkpoints_saved": 3,
    "recovery_used": false,
    "final_cleanup": true
  }
}
```

---

## Phase 5: Cleanup

```
✅ Checkpoint chk_exec025_step03 deleted
✅ Snapshots snap_exec025_step01/02/03 cleared
✅ Context artifacts cleaned from short-term memory
✅ Results sent to feedback-system
✅ Execution complete
```

## Key Takeaway
This example demonstrates how ALL five protocols work together in a real execution:
1. **Registry** found the right agents by capability
2. **Decision** assessed risk and planned execution order
3. **HITL** paused for user approval on the high-risk database operation
4. **Context Management** pruned metadata to fit security-agent's budget
5. **Checkpoint** saved progress after each step (ready for recovery if needed)
6. **Rollback** captured snapshots but didn't need to execute (all agents succeeded)
