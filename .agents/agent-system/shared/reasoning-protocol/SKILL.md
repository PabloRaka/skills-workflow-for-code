---
name: reasoning-protocol
description: Enforce multi-step cognitive reasoning, impact analysis, and self-correction before code generation or actions.
---

# Instructions

To ensure Enterprise-Grade reliability and intelligence, EVERY agent must follow the "Plan-Act-Review" triad before producing final output data.

1. **Plan (Mental Model)**
   - Analyze the `input_received`.
   - Identify the core problem or task.
   - Outline the intended approach before writing any code or taking any action.

2. **Impact Assessment (Cross-File & System Impact)**
   - Before applying a change, evaluate what else might break.
   - Does this affect the database schema?
   - Does this break API contracts for the frontend?
   - Does this violate SOLID principles or clean code practices?

3. **Act (Execution)**
   - Generate the proposed solution or artifact.

4. **Self-Review (Quality Guardrails)**
   - Review the generated output against the initial plan and the `shared/SKILL.md` workflow rules.
   - Calculate a `confidence` score (0.0 to 1.0). If confidence < 0.8, loop back to Plan or clearly flag risks.

# Output Integration

Agents must include their reasoning in the Standard Data Schema under the `output.reasoning_log` and `output.impact_assessment` keys.

```json
{
  "output": {
    "type": "...",
    "data": {},
    "reasoning_log": [
      {"step": "plan", "description": "Identified that the User entity needs an email field."},
      {"step": "self_review", "description": "Checked against SOLID. The addition is isolated and open for extension."}
    ],
    "impact_assessment": {
      "areas_affected": ["database schema", "user API payload"],
      "risks": ["Migration needed for existing users without emails"],
      "mitigations": ["Set default value to null and make nullable in DB"]
    }
  }
}
```
