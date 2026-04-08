---
description: Workflow agent
---

# Agent System Workflow

Follow this pipeline for every task execution.

## Phase 1: Context Loading

1. **Short-Term Memory** — Load current request context
   - Parse user input, identify intent
   - Store as `current_task` in short-term memory
   - If continuation of previous task, load previous intermediate results

2. **Episodic Memory** — Retrieve past experiences  
   - Search for similar past cases (by keywords, category, agent patterns)
   - Extract `lessons` and `similar_cases`
   - Flag any past failures related to this type of request

3. **Semantic Memory** — Retrieve rules & best practices
   - Load relevant `rules` and `best_practices`
   - Cross-reference with episodic insights

## Phase 2: Decision & Planning

4. **Decision System** — Determine agent selection
   - Input: user request + episodic insights + semantic rules
   - Classify request category
   - Select agents and execution order
   - Resolve any conflicts between memory sources
   - Output: structured decision plan (JSON)

## Phase 3: Execution

5. **Orchestrator** — Coordinate execution
   - Receive decision plan
   - Initialize agents in specified order
   - Pass data between agents using Standard Data Schema (see shared/SKILL.md)
   - Handle errors per Error Handling Protocol:
     - Retry failed agents (max 2)
     - Escalate if retry fails
     - Abort and report if escalation fails

6. **Agent Execution** — Run selected agents
   - Each agent executes its SKILL.md instructions
   - Each agent outputs using the Standard Data Schema envelope
   - Sequential agents receive output from previous agent
   - Parallel agents execute independently

## Phase 4: Evaluation & Learning

7. **Feedback System** — Evaluate results
   - Score: accuracy, efficiency, clarity (0-10 each)
   - Detect issues: missing steps, wrong agent selection, poor ordering
   - Generate improvement suggestions
   - Send feedback to memory systems

8. **Long-Term Memory** — Store learnings
   - Store successful patterns (score >= 7)
   - Update optimized flows
   - Discard noisy or low-score results
   - Build recommended patterns for future use

## Error Recovery Flow

```
Agent fails → Retry (simplified prompt)
    ↓ fails again
Escalate to software-engineer-agent
    ↓ fails again  
Abort → Report to feedback-system → Log in episodic-memory
```

## Quick Reference

```
User Input → [Short-Term] → [Episodic] → [Semantic]
                                ↓
                        [Decision System]
                                ↓
                         [Orchestrator]
                                ↓
                     [Agent 1] → [Agent 2] → [Agent N]
                                ↓
                        [Feedback System]
                                ↓
                       [Long-Term Memory]
```