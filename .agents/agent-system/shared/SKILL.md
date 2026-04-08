# Workflow Rules

1. Always validate dependencies before execution
2. Do not skip required agents
3. Ensure output consistency across agents
4. Avoid duplicate logic
5. Prioritize:
   Security > Stability > Performance > UX

# Agent Priority

1. security-agent
2. software-engineer-agent
3. backend-agent
4. database-agent
5. frontend-agent
6. others

# Communication Rule

- Each agent must produce structured output
- Output must be reusable by next agent

# Standard Data Schema

All agents MUST communicate using this unified envelope format:

```json
{
  "agent_name": "string",
  "timestamp": "ISO 8601",
  "status": "success | partial | failed",
  "confidence": 0.0-1.0,
  "input_received": {
    "from_agent": "string | null",
    "task_summary": "string"
  },
  "output": {
    "type": "code | analysis | design | review | fix",
    "data": {},
    "artifacts": []
  },
  "dependencies": {
    "requires": ["agent-name"],
    "provides_to": ["agent-name"]
  },
  "metadata": {
    "execution_time_ms": 0,
    "tokens_used": 0,
    "retry_count": 0
  }
}
```

# Error Handling Protocol

1. If an agent fails:
   - Report error with `status: "failed"` and include `error_detail`
   - Orchestrator decides: retry (max 2), skip, or abort
2. If an agent returns `status: "partial"`:
   - Next agent should handle missing data gracefully
   - Flag incomplete sections in output
3. Fallback chain:
   - Primary agent fails → Retry with simplified prompt
   - Second failure → Escalate to software-engineer-agent
   - Third failure → Abort and report to feedback-system

# Version

schema_version: "1.0"