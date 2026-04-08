---
name: semantic-memory
description: Store structured knowledge and best practices
---

# Instructions

1. Store:
   - rules (hard constraints)
   - best practices (soft guidelines)
   - patterns (reusable solutions)
   - anti-patterns (things to avoid)

2. Provide knowledge to agents on request
3. Accept new rules from feedback-system (when pattern detected 3+ times)

# Categories

Rules and practices are organized by domain:

- **security**: "JWT should expire within 15 minutes", "Never store passwords in plain text"
- **database**: "Use indexing for large tables", "Normalize to 3NF unless performance requires denormalization"
- **backend**: "Always validate input server-side", "Use middleware for cross-cutting concerns"
- **frontend**: "Mobile-first responsive design", "Lazy load below-the-fold content"
- **architecture**: "Separate concerns into layers", "Prefer composition over inheritance"
- **general**: "DRY - Don't Repeat Yourself", "KISS - Keep It Simple, Stupid"

# Rules

- Rules are immutable unless explicitly overridden by user
- Best practices can be updated by feedback-system
- Anti-patterns are learned from episodic-memory failures

# Output

```json
{
  "rules": [
    {"domain": "security", "rule": "JWT expires in 15 min", "priority": "high"}
  ],
  "best_practices": [
    {"domain": "database", "practice": "Use indexing for large tables", "source": "manual"}
  ],
  "anti_patterns": [
    {"domain": "backend", "pattern": "Catching all exceptions silently", "learned_from": "episodic"}
  ]
}
```