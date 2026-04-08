<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/status-Active-brightgreen?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/agents-8-orange?style=for-the-badge" alt="Agents"/>
  <img src="https://img.shields.io/badge/protocols-5-purple?style=for-the-badge" alt="Protocols"/>
</p>

# 🤖 Multi-Agent System Framework

> A cognitive-inspired multi-agent orchestration framework with memory systems, decision engine, self-learning feedback loop, and enterprise-grade safety protocols.

---

## 📖 Overview

This framework implements an intelligent multi-agent system inspired by cognitive architecture. It coordinates **8 specialized AI agents** through an orchestration layer, with a memory system that enables learning from past executions.

### Key Features

- 🧠 **4-Layer Memory System** — Short-term, Episodic, Semantic, and Long-term memory
- 🎯 **Intelligent Decision Engine** — Auto-selects and orders agents based on task analysis
- 🔄 **Self-Learning Feedback Loop** — Evaluates performance and improves over time
- 📦 **Standard Data Schema** — Unified communication format across all agents
- ⚡ **Hybrid Execution** — Sequential, parallel, or hybrid agent execution
- 🛡️ **Error Recovery** — Retry, escalate, and abort protocols built-in
- 🛑 **Human-in-the-Loop (HITL)** — Approval gates for high-risk actions
- ⏪ **Rollback Strategy** — Automatic undo when agents fail mid-execution
- 📐 **Context Window Management** — Prevent token overflow across agent chains
- 💾 **State Checkpointing** — Crash recovery and execution resumption
- 📋 **Agent Discovery & Registry** — Auto-detect new agents without manual config

---

## 🏗️ Architecture

```
               ┌──────────────────┐
               │  Agent Registry  │ ← Auto-discover agents
               │  Checkpoint Check│ ← Resume if interrupted
               └────────┬─────────┘
                        ↓
User Input → [Short-Term] → [Episodic] → [Semantic]
                        ↓
                [Decision System]  (+ risk assessment)
                        ↓
                 [Orchestrator]
                        ↓
    ┌───────────────────────────────────────┐
    │  For each agent:                      │
    │  [HITL Gate] → [Snapshot] →           │
    │  [Context Check] → [Execute] →        │
    │  [Checkpoint] → [Error/Rollback]      │
    └───────────────────┬───────────────────┘
                        ↓
                [Feedback System]
                        ↓
               [Long-Term Memory]
                        ↓
                   [Cleanup]
```

---

## 📂 Project Structure

```
.agents/
├── agent-system/
│   ├── agents/                        # 🤖 Specialized agents (auto-discovered)
│   │   ├── ai-engineer-agent/         # AI/ML model design & deployment
│   │   ├── backend-agent/             # Backend systems & API development
│   │   ├── bug-analyzer-agent/        # Bug detection & root cause analysis
│   │   ├── code-reviewer-agent/       # Code quality & best practices review
│   │   ├── database-agent/            # Database design & optimization
│   │   ├── frontend-agent/            # Frontend UI development
│   │   ├── security-agent/            # Vulnerability scanning & security
│   │   └── software-engineer-agent/   # System architecture & design
│   │
│   ├── decision-system/               # 🎯 Agent selection & task routing
│   ├── orchestrator/                  # 🔄 Multi-agent coordination
│   ├── feedback-system/               # 📊 Performance evaluation & learning
│   ├── memory-system/                 # 🧠 Cognitive memory layers
│   │   ├── short-term/                # Current context + checkpoints
│   │   ├── episodic/                  # Past execution cases
│   │   ├── semantic/                  # Rules & best practices
│   │   └── long-term/                 # Optimized strategies
│   │
│   └── shared/                        # 📋 Global rules, schema & protocols
│       ├── SKILL.md                   # Standard Data Schema & rules
│       ├── agent-registry/            # 📋 Auto-discovery & capability index
│       ├── hitl-protocol/             # 🛑 Human-in-the-Loop approval gates
│       ├── rollback-protocol/         # ⏪ Undo strategy on failure
│       ├── context-management/        # 📐 Token budget & summarization
│       └── checkpoint-protocol/       # 💾 Crash recovery & state persistence
│
└── workflows/
    └── workflow.md                    # 📝 Execution pipeline definition
```

---

## 🤖 Agents

All agents are **auto-discovered** via the Agent Registry. Each agent's `SKILL.md` includes frontmatter metadata for automatic registration.

| Agent | Responsibility | Risk Level | Priority |
|:------|:---------------|:-----------|:---------|
| **Security** | Identify vulnerabilities and harden systems (OWASP) | 🔴 High | 1 |
| **Software Engineer** | End-to-end architecture and system design | 🟡 Medium | 2 |
| **Backend** | Build scalable backend systems and APIs | 🟡 Medium | 3 |
| **Database** | Design, optimize, and manage database systems | 🔴 High | 4 |
| **Frontend** | Build modern, responsive frontend UIs | 🟡 Medium | 5 |
| **AI Engineer** | Design & implement AI/ML models and pipelines | 🟡 Medium | 6 |
| **Bug Analyzer** | Detect, trace, and fix bugs with prevention | 🟢 Low | 7 |
| **Code Reviewer** | Review code quality, performance, and standards | 🟢 Low | 8 |

> **Adding a new agent?** Just create a new folder in `agents/` with a `SKILL.md` — it's automatically registered!

---

## 🧠 Memory System

The memory architecture is inspired by human cognitive science:

| Memory Type | Purpose | Retention |
|:------------|:--------|:----------|
| **Short-Term** | Current task context, checkpoints & active agents | 1 execution cycle |
| **Episodic** | Past cases, outcomes, and lessons learned | 50 most recent (FIFO) |
| **Semantic** | Rules, best practices, and anti-patterns | Permanent (rule-based) |
| **Long-Term** | Proven strategies and optimized flows | 100 patterns (score-based) |

### Pattern Lifecycle

```
New Pattern (score ≥ 7) → Candidate (1-4 uses)
    → Proven (5+ uses, < 30% failure)
    → Deprecated (failure rate > 30%)
```

---

## 🔒 Safety Protocols

### 🛑 Human-in-the-Loop (HITL)

Every agent action is classified by risk level. High-risk and critical actions require explicit user approval before execution.

| Risk Level | Approval Required | Examples |
|:-----------|:------------------|:---------|
| 🟢 Low | ❌ Auto-proceed | Code review, analysis |
| 🟡 Medium | ❌ Auto-proceed | Generate new code |
| 🔴 High | ✅ Required | Modify schema, change auth |
| ⚫ Critical | ✅ Required | Delete data, deploy to prod |

- Timeout default: **abort** (safe default)
- Expert mode: `auto_approve_all: true` to skip gates

### ⏪ Rollback Strategy

If an agent fails mid-execution, the system automatically reverts changes:

- **Full Rollback** — Revert all agents in reverse order (LIFO)
- **Partial Rollback** — Revert only failed dependency chain
- **Selective Rollback** — User picks which agents to revert

```
Agent C fails → Rollback C → Rollback B → Rollback A
(reverse execution order, restore snapshots)
```

### 💾 State Checkpointing

Progress is saved after each agent completes. If execution is interrupted:

- Automatically detected on next run
- User is prompted to resume or start fresh
- Checkpoints expire after 24 hours

### 📐 Context Window Management

Prevents token overflow in multi-agent chains:

- **Smart Summarization** — Large outputs summarized before passing
- **Reference Mode** — Very large data stored as retrievable artifacts
- **Priority Pruning** — Metadata dropped first, core data kept intact
- **Per-Agent Budgets** — Token limits enforced per agent

---

## 🔄 Workflow Pipeline

The system follows a **6-phase execution pipeline**:

### Phase 0: Initialization
Agent registry scan → Checkpoint recovery check

### Phase 1: Context Loading
Load user request → Retrieve past cases → Load rules & practices

### Phase 2: Decision & Planning
Classify task → Query registry → Select agents → Assess risk → Calculate context budget

### Phase 3: Execution
For each agent: HITL gate → Snapshot → Context check → Execute → Checkpoint → Error handling

### Phase 4: Evaluation & Learning
Score results → Detect issues → Evaluate protocols → Store learnings

### Phase 5: Cleanup
Delete checkpoint → Clear artifacts → Clear snapshots

---

## 📋 Standard Data Schema

All agents communicate using a unified envelope format (v2.0):

```json
{
  "agent_name": "backend-agent",
  "timestamp": "2026-04-08T15:45:00Z",
  "status": "success",
  "confidence": 0.92,
  "input_received": {
    "from_agent": "database-agent",
    "task_summary": "Implement REST API for user management",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "code",
    "data": {},
    "artifacts": []
  },
  "pre_execution_snapshot": {
    "snapshot_id": "snap_001",
    "files_modified": [],
    "files_created": []
  },
  "context_info": {
    "input_tokens": 1200,
    "output_tokens": 2300,
    "summarized": false
  },
  "metadata": {
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": "chk_001"
  }
}
```

---

## ⚠️ Error Recovery

```
Agent fails → Retry with simplified prompt
    ↓ fails again
Escalate to software-engineer-agent
    ↓ fails again
Trigger Rollback (reverse order) → Notify user → Report to feedback-system
```

---

## 🚀 Getting Started

### Prerequisites

- An AI coding assistant that supports `.agents/` directory structure (e.g., Gemini, Cursor, etc.)

### Usage

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. Place the `.agents/` directory in your project root.

3. Your AI assistant will automatically pick up the agent system configuration.

4. Invoke the workflow by referencing `/workflow` in your AI assistant.

### Adding a New Agent

1. Create a new folder: `agents/your-agent-name/`
2. Add a `SKILL.md` with required frontmatter:
   ```yaml
   ---
   name: your-agent-name
   description: What this agent does
   capabilities:
     - keyword1
     - keyword2
   input_types:
     - type1
   output_types:
     - type1
   risk_level: low | medium | high | critical
   priority: 1-10
   ---
   ```
3. The agent registry will auto-discover it on next execution!

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contribution

- Add new specialized agents
- Improve memory retrieval algorithms
- Add agent performance benchmarks
- Create example use-case templates
- Improve rollback granularity
- Add HITL notification integrations
- Optimize context summarization strategies

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Pabloraka**

---

<p align="center">
  <i>Built with 🧠 cognitive architecture principles</i>
</p>
