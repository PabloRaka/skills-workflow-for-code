# Example: Checkpoint Recovery — Resuming Interrupted Execution

## Scenario
User requested "Build a full-stack blog platform." The decision-system planned a 4-agent chain: `database-agent → backend-agent → frontend-agent → security-agent`. After database-agent and backend-agent completed successfully, the system was interrupted (connection lost) during frontend-agent execution.

## Last Saved Checkpoint (before crash)

```json
{
  "checkpoint_id": "chk_exec020_step03",
  "execution_id": "exec_020",
  "timestamp": "2026-04-08T14:35:00Z",
  "status": "in_progress",
  "current_step": 3,
  "total_steps": 4,
  "completed_agents": [
    {
      "agent": "database-agent",
      "status": "success",
      "output_ref": "output_database_020",
      "completed_at": "2026-04-08T14:28:00Z"
    },
    {
      "agent": "backend-agent",
      "status": "success",
      "output_ref": "output_backend_020",
      "completed_at": "2026-04-08T14:33:00Z"
    }
  ],
  "pending_agents": ["security-agent"],
  "current_agent": "frontend-agent",
  "decision_plan": {
    "agents": ["database-agent", "backend-agent", "frontend-agent", "security-agent"],
    "execution_mode": "sequential"
  },
  "intermediate_outputs": {
    "output_database_020": {
      "tables": ["posts", "users", "comments", "categories"],
      "migration_files": ["001_create_blog_schema.sql"]
    },
    "output_backend_020": {
      "endpoints": [
        {"method": "GET", "path": "/api/posts"},
        {"method": "POST", "path": "/api/posts"},
        {"method": "GET", "path": "/api/posts/:slug"},
        {"method": "PUT", "path": "/api/posts/:id"},
        {"method": "DELETE", "path": "/api/posts/:id"}
      ],
      "framework": "Express.js"
    }
  },
  "expires_at": "2026-04-09T14:35:00Z"
}
```

## Recovery Flow

### Step 1: New execution starts

User returns and makes a new request (or same request).  
Orchestrator checks short-term-memory for pending checkpoints.

```
Orchestrator: Checking for pending checkpoints...
→ Found: chk_exec020_step03
→ Task: "Build a full-stack blog platform"
→ Status: in_progress (interrupted at step 3/4)
→ Expired: No (expires 2026-04-09T14:35:00Z)
```

### Step 2: Prompt user for recovery

```
🔄 Previous execution was interrupted:
   Task: "Build a full-stack blog platform"
   Progress: 2/4 agents completed (database ✅, backend ✅)
   Interrupted: frontend-agent (in progress)
   Remaining: frontend-agent, security-agent

   Resume from checkpoint? (yes/no)
```

User responds: **yes**

### Step 3: Orchestrator resumes

```
Resume sequence:
1. ⏭ SKIP database-agent (completed, output loaded from checkpoint)
2. ⏭ SKIP backend-agent (completed, output loaded from checkpoint)
3. 🔄 RE-EXECUTE frontend-agent (was interrupted, restart from beginning)
4. ⏳ PENDING security-agent (not yet started)

Loading intermediate outputs from checkpoint...
→ output_database_020: loaded (4 tables, 1 migration)
→ output_backend_020: loaded (5 endpoints, Express.js)

Injecting backend-agent output into frontend-agent input...
→ Context check: 1800 tokens (within budget ✅)

Executing frontend-agent...
```

### Step 4: Execution continues normally

```
3. frontend-agent → ✅ SUCCESS
   → Checkpoint updated: chk_exec020_step04
   → Components: BlogList, BlogPost, Editor, Sidebar

4. security-agent → ✅ SUCCESS  
   → Checkpoint updated: chk_exec020_step05 (final)
   → Findings: 2 medium-risk issues fixed

Execution complete!
→ Checkpoint deleted (cleanup)
→ Results sent to feedback-system
```

### Final Checkpoint State (before cleanup)

```json
{
  "checkpoint_id": "chk_exec020_step05",
  "status": "completed",
  "completed_agents": [
    {"agent": "database-agent", "status": "success", "source": "recovered_from_checkpoint"},
    {"agent": "backend-agent", "status": "success", "source": "recovered_from_checkpoint"},
    {"agent": "frontend-agent", "status": "success", "source": "re_executed"},
    {"agent": "security-agent", "status": "success", "source": "fresh_execution"}
  ],
  "pending_agents": [],
  "recovery_stats": {
    "agents_skipped": 2,
    "agents_re_executed": 1,
    "agents_fresh": 1,
    "time_saved_ms": 11000,
    "checkpoint_age_minutes": 25
  }
}
```

## Key Takeaway
Without checkpointing, the entire 4-agent chain would have to restart from scratch after the interruption. The checkpoint protocol saved ~11 seconds of execution time and preserved the work of 2 completed agents. The interrupted agent (frontend) was re-executed from scratch for safety, as its partial output could not be trusted.
