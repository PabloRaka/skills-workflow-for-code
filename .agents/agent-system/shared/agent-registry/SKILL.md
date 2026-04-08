---
name: agent-registry
description: Auto-discover and index all available agents and their capabilities
---

# Instructions

1. Scan `agents/` directory for all subdirectories containing `SKILL.md`
2. Parse frontmatter from each `SKILL.md` to extract agent metadata
3. Build a capability index for fast matching
4. Validate that all agents conform to the required frontmatter schema
5. Provide query interface for decision-system to find agents by capability

# Auto-Discovery Protocol

1. **Scan**: Read all `agents/*/SKILL.md` files
2. **Parse**: Extract frontmatter fields: `name`, `description`, `capabilities`, `input_types`, `output_types`, `risk_level`, `priority`
3. **Index**: Build capability → agent mapping
4. **Validate**: Flag any agent with missing required frontmatter
5. **Expose**: Make registry available to decision-system and orchestrator

# Required Agent Frontmatter Schema

Every agent's `SKILL.md` MUST include this frontmatter:

```yaml
---
name: agent-name                    # Unique identifier
description: What this agent does   # Human-readable description
capabilities:                       # What tasks this agent can handle
  - capability_keyword_1
  - capability_keyword_2
input_types:                        # What data this agent accepts
  - type_1
output_types:                       # What data this agent produces
  - type_1
risk_level: low | medium | high | critical   # Default risk for this agent's actions
priority: 1-10                      # Lower = higher priority (1 is highest)
---
```

# Capability Matching

When decision-system queries "which agent handles X?":

1. Search `capabilities` field across all registered agents
2. Rank matches by:
   - Direct keyword match (exact) → score 1.0
   - Partial keyword match → score 0.5
   - Description match → score 0.3
3. If multiple agents match, use `priority` field to break ties
4. Return ranked list of matching agents

# Validation Rules

- Missing `name` → ERROR: Agent cannot be registered
- Missing `capabilities` → WARNING: Agent will not appear in capability searches
- Missing `risk_level` → DEFAULT: Assume `medium`
- Missing `priority` → DEFAULT: Assume `6` (below core agents)
- Duplicate `name` → ERROR: Must be unique across all agents

# Registry Output Format

```json
{
  "registry_version": "1.0",
  "total_agents": 8,
  "agents": [
    {
      "name": "backend-agent",
      "description": "Design and implement scalable backend systems and APIs",
      "capabilities": ["api", "backend", "server", "rest", "graphql", "auth"],
      "input_types": ["requirements", "database_schema"],
      "output_types": ["code", "api_structure", "endpoints"],
      "risk_level": "medium",
      "priority": 3,
      "path": "agents/backend-agent/SKILL.md",
      "status": "valid"
    }
  ],
  "capability_index": {
    "api": ["backend-agent"],
    "security": ["security-agent"],
    "database": ["database-agent"],
    "ui": ["frontend-agent"],
    "ml": ["ai-engineer-agent"],
    "bug": ["bug-analyzer-agent"],
    "review": ["code-reviewer-agent"],
    "architecture": ["software-engineer-agent"]
  },
  "validation_errors": [],
  "validation_warnings": []
}
```

# Hot-Reload

- Registry is rebuilt at the START of every execution cycle
- No system restart required when adding/removing agents
- New agents placed in `agents/` folder are automatically detected
- Removed agents are automatically de-registered
