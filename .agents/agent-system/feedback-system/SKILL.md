---
name: feedback-system
description: Evaluate results and improve system performance
---

# Instructions

1. Analyze final output quality:
   - correctness
   - completeness
   - efficiency

2. Detect issues:
   - missing steps
   - wrong agent selection
   - poor execution order
   - data schema violations
   - conflict resolution failures

3. Generate feedback:
   - what worked
   - what failed
   - what to improve

4. Route feedback to appropriate systems:
   - **episodic-memory**: Store this execution as a case
   - **semantic-memory**: Update rules if pattern is consistent (3+ occurrences)
   - **long-term-memory**: Store optimization if score >= 7
   - **decision-system**: Adjust agent selection weights

# Evaluation Criteria

- Accuracy (0-10): Is the output correct?
- Efficiency (0-10): Was the execution optimal?
- Clarity (0-10): Is the output understandable (documentation-agent quality)?
- Cognitive Quality (0-10): Are the reasoning logs and impact assessments logical and helpful?
- Schema Compliance (0-10): Did agents follow the Standard Data Schema?
- Overall Score: weighted average (Accuracy 30%, Cognitive Quality 20%, Clarity 20%, Efficiency 15%, Schema 15%)

# Learning Triggers

- If overall_score < 5: Flag for review, store in episodic as "failure case"
- If overall_score >= 7: Store pattern in long-term as "recommended"
- If same issue detected 3+ times: Promote fix to semantic-memory as new rule

# Output Format

```json
{
  "score": {
    "accuracy": 8,
    "efficiency": 7,
    "clarity": 9,
    "schema_compliance": 8,
    "overall": 7.95
  },
  "issues": [],
  "improvements": [],
  "routing": {
    "to_episodic": true,
    "to_semantic": false,
    "to_long_term": true,
    "to_decision": false
  },
  "status": "success"
}
```