# Example 1: Microservices Architecture for Fintech Platform

## Mission
Design a scalable fintech platform architecture using microservices pattern with event-driven communication, API gateway, and deployment strategy.

## Requirements
- Process 10,000+ transactions/minute
- 99.9% uptime SLA
- PCI DSS compliance consideration
- Multi-region deployment capability

## Architecture Design

```
                    ┌─────────────────┐
                    │   CDN / WAF     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Kong / Nginx) │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  Auth Service │  │ Payment Service │  │ Account Service │
│  (Node.js)    │  │  (Go / gRPC)    │  │  (Node.js)      │
└───────┬───────┘  └────────┬────────┘  └────────┬────────┘
        │                   │                    │
        │          ┌────────▼────────┐           │
        │          │  Kafka / Events │           │
        │          └────────┬────────┘           │
        │                   │                    │
┌───────▼───────┐  ┌────────▼────────┐  ┌────────▼────────┐
│  Auth DB      │  │  Payment DB     │  │  Account DB     │
│  (PostgreSQL) │  │  (PostgreSQL)   │  │  (PostgreSQL)   │
└───────────────┘  └─────────────────┘  └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Notification    │
                    │ Service (async) │
                    └─────────────────┘
```

## Service Breakdown

| Service | Language | DB | Communication | Purpose |
|:--------|:---------|:---|:-------------|:--------|
| API Gateway | — | — | HTTP/REST | Route, rate limit, auth verify |
| Auth Service | Node.js | PostgreSQL | REST | JWT auth, OAuth, 2FA |
| Payment Service | Go | PostgreSQL | gRPC + Kafka | Process transactions |
| Account Service | Node.js | PostgreSQL | REST + Kafka | User accounts, balances |
| Notification | Python | Redis | Kafka (consumer) | Email, SMS, push |

## Key Design Decisions

```yaml
Communication:
  sync: REST (read operations), gRPC (payment processing - low latency)
  async: Kafka (event-driven for side effects)

Data Strategy:
  pattern: Database-per-service (no shared DB)
  consistency: Eventual consistency via Saga pattern
  transactions: Saga with compensating transactions

Deployment:
  container: Docker
  orchestration: Kubernetes (EKS/GKE)
  ci_cd: GitHub Actions → Build → Test → Deploy
  environments: dev → staging → production

Observability:
  logging: ELK Stack (Elasticsearch, Logstash, Kibana)
  metrics: Prometheus + Grafana
  tracing: Jaeger (distributed tracing)
  alerting: PagerDuty
```

## Saga Pattern for Money Transfer

```
1. Account Service: Debit sender (reserve funds)
   → Event: funds_reserved

2. Payment Service: Process payment
   → Event: payment_processed

3. Account Service: Credit receiver
   → Event: transfer_completed

Compensation (if step 3 fails):
   → Reverse step 2: refund payment
   → Reverse step 1: unreserve sender funds
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "software-engineer-agent",
  "timestamp": "2026-04-08T10:00:00Z",
  "status": "success",
  "confidence": 0.91,
  "input_received": {
    "from_agent": null,
    "task_summary": "Design scalable fintech platform with microservices architecture",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "design",
    "data": {
      "architecture": "microservices",
      "services": ["api-gateway", "auth-service", "payment-service", "account-service", "notification-service"],
      "total_services": 5,
      "tech_stack": {
        "languages": ["Node.js", "Go", "Python"],
        "databases": ["PostgreSQL (per-service)", "Redis (caching)"],
        "messaging": "Apache Kafka",
        "api_protocols": ["REST", "gRPC"],
        "deployment": "Kubernetes (EKS/GKE)"
      },
      "patterns": ["API Gateway", "Database-per-service", "Event-driven", "Saga (compensating transactions)", "CQRS"],
      "testing_strategy": "unit + integration + contract + e2e",
      "observability": ["ELK logging", "Prometheus metrics", "Jaeger tracing"],
      "development_plan": [
        {"phase": 1, "scope": "Auth + Account services", "weeks": 3},
        {"phase": 2, "scope": "Payment service + Kafka", "weeks": 4},
        {"phase": 3, "scope": "Notification + Monitoring", "weeks": 2},
        {"phase": 4, "scope": "E2E testing + Deployment", "weeks": 2}
      ]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["architecture-diagram.md", "service-specs/", "deployment/k8s-manifests/"]
  },
  "context_info": {
    "input_tokens": 500,
    "output_tokens": 3800,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 4500,
    "tokens_used": 4300,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": "chk_exec008_step01"
  }
}
```

## Trade-offs Considered
- **Microservices vs Monolith**: Chose microservices for independent scaling of payment service
- **REST vs gRPC**: gRPC for payment (low latency), REST for general APIs (simplicity)
- **Eventual vs Strong consistency**: Eventual consistency via Saga for cross-service transactions
- **Kafka vs RabbitMQ**: Kafka for event log persistence and replay capability