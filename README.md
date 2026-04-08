<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/status-Active-brightgreen?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/agents-8-orange?style=for-the-badge" alt="Agents"/>
</p>

# 🤖 Multi-Agent System Framework

> A cognitive-inspired multi-agent orchestration framework with memory systems, decision engine, and self-learning feedback loop.

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

---

## 🏗️ Architecture

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

---

## 📂 Project Structure

```
.agents/
├── agent-system/
│   ├── agents/                    # 🤖 Specialized agents
│   │   ├── ai-engineer-agent/     # AI/ML model design & deployment
│   │   ├── backend-agent/         # Backend systems & API development
│   │   ├── bug-analyzer-agent/    # Bug detection & root cause analysis
│   │   ├── code-reviewer-agent/   # Code quality & best practices review
│   │   ├── database-agent/        # Database design & optimization
│   │   ├── frontend-agent/        # Frontend UI development
│   │   ├── security-agent/        # Vulnerability scanning & security
│   │   └── software-engineer-agent/ # System architecture & design
│   │
│   ├── decision-system/           # 🎯 Agent selection & task routing
│   ├── orchestrator/              # 🔄 Multi-agent coordination
│   ├── feedback-system/           # 📊 Performance evaluation & learning
│   ├── memory-system/             # 🧠 Cognitive memory layers
│   │   ├── short-term/            # Current execution context
│   │   ├── episodic/              # Past execution cases
│   │   ├── semantic/              # Rules & best practices
│   │   └── long-term/             # Optimized strategies
│   │
│   └── shared/                    # 📋 Global rules & data schema
│
└── workflows/
    └── workflow.md                # 📝 Execution pipeline definition
```

---

## 🤖 Agents

| Agent | Responsibility |
|:------|:---------------|
| **AI Engineer** | Design & implement AI/ML models and pipelines |
| **Backend** | Build scalable backend systems and APIs |
| **Bug Analyzer** | Detect, trace, and fix bugs with prevention |
| **Code Reviewer** | Review code quality, performance, and standards |
| **Database** | Design, optimize, and manage database systems |
| **Frontend** | Build modern, responsive frontend UIs |
| **Security** | Identify vulnerabilities and harden systems (OWASP) |
| **Software Engineer** | End-to-end architecture and system design |

---

## 🧠 Memory System

The memory architecture is inspired by human cognitive science:

| Memory Type | Purpose | Retention |
|:------------|:--------|:----------|
| **Short-Term** | Current task context & active agents | 1 execution cycle |
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

## 🔄 Workflow Pipeline

The system follows a **4-phase execution pipeline**:

### Phase 1: Context Loading
Load user request → Retrieve past cases → Load rules & practices

### Phase 2: Decision & Planning
Classify task → Select agents → Determine execution order → Resolve conflicts

### Phase 3: Execution
Initialize agents → Execute in order → Pass data via Standard Schema → Handle errors

### Phase 4: Evaluation & Learning
Score results → Detect issues → Route feedback → Store learnings

---

## 📋 Standard Data Schema

All agents communicate using a unified envelope format:

```json
{
  "agent_name": "backend-agent",
  "timestamp": "2026-04-08T15:45:00Z",
  "status": "success",
  "confidence": 0.92,
  "input_received": {
    "from_agent": "database-agent",
    "task_summary": "Implement REST API for user management"
  },
  "output": {
    "type": "code",
    "data": {},
    "artifacts": []
  },
  "dependencies": {
    "requires": ["database-agent"],
    "provides_to": ["frontend-agent"]
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
Abort → Report to feedback-system → Log in episodic-memory
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
