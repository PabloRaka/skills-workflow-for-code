# Example 3: CI/CD Pipeline Design with Testing Strategy

## Mission
Design a comprehensive CI/CD pipeline with a multi-level testing strategy for a full-stack application.

## Requirements
- GitHub Actions for automation
- Docker containerization
- Multi-environment deployment (dev → staging → production)
- Automated testing at every level
- Rollback capability

## Pipeline Architecture

```
Developer Push → PR Created
        ↓
┌─────────────────────────────────────────┐
│  Stage 1: Quality Gates (2 min)         │
│  ├── Lint (ESLint, Prettier)            │
│  ├── Type Check (TypeScript)            │
│  └── Security Scan (npm audit)          │
└──────────────────┬──────────────────────┘
                   ↓ pass
┌─────────────────────────────────────────┐
│  Stage 2: Unit Tests (3 min)            │
│  ├── Backend unit tests (Jest)          │
│  ├── Frontend unit tests (Vitest)       │
│  └── Coverage check (>80%)             │
└──────────────────┬──────────────────────┘
                   ↓ pass
┌─────────────────────────────────────────┐
│  Stage 3: Integration Tests (5 min)     │
│  ├── API integration tests              │
│  ├── Database integration tests         │
│  └── Service contract tests             │
└──────────────────┬──────────────────────┘
                   ↓ pass (PR merged to main)
┌─────────────────────────────────────────┐
│  Stage 4: Build & Deploy Staging (3 min)│
│  ├── Docker build (multi-stage)         │
│  ├── Push to container registry         │
│  └── Deploy to staging (K8s)            │
└──────────────────┬──────────────────────┘
                   ↓ deployed
┌─────────────────────────────────────────┐
│  Stage 5: E2E Tests on Staging (8 min)  │
│  ├── Playwright browser tests           │
│  ├── API smoke tests                    │
│  └── Performance baseline check         │
└──────────────────┬──────────────────────┘
                   ↓ pass + manual approval
┌─────────────────────────────────────────┐
│  Stage 6: Production Deploy (5 min)     │
│  ├── Blue-green deployment              │
│  ├── Health check verification          │
│  ├── Smoke test on production           │
│  └── Rollback if health check fails     │
└─────────────────────────────────────────┘
```

## GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm audit --production

  unit-tests:
    needs: quality-gates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports: ["6379:6379"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  deploy-staging:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: integration-tests
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t $REGISTRY/$IMAGE_NAME:staging-${{ github.sha }} .
      - name: Push to registry
        run: docker push $REGISTRY/$IMAGE_NAME:staging-${{ github.sha }}
      - name: Deploy to staging
        run: kubectl set image deployment/app app=$REGISTRY/$IMAGE_NAME:staging-${{ github.sha }}

  e2e-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: https://staging.example.com

  deploy-production:
    needs: e2e-tests
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      - name: Blue-green deploy
        run: |
          kubectl set image deployment/app-green app=$REGISTRY/$IMAGE_NAME:staging-${{ github.sha }}
          kubectl rollout status deployment/app-green --timeout=120s
          kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'
      - name: Health check
        run: |
          for i in {1..10}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.example.com/health)
            if [ "$STATUS" = "200" ]; then echo "Health check passed"; exit 0; fi
            sleep 5
          done
          echo "Health check failed — rolling back"
          kubectl patch service app -p '{"spec":{"selector":{"version":"blue"}}}'
          exit 1
```

## Testing Strategy Summary

| Level | Tool | Scope | Coverage Target |
|:------|:-----|:------|:---------------|
| Unit | Jest / Vitest | Functions, components | 80%+ |
| Integration | Jest + Testcontainers | API + DB + Redis | Critical paths |
| Contract | Pact | Service interfaces | All API contracts |
| E2E | Playwright | User journeys | Top 10 flows |
| Performance | k6 | Load testing | P95 < 200ms |

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "software-engineer-agent",
  "timestamp": "2026-04-08T15:00:00Z",
  "status": "success",
  "confidence": 0.92,
  "input_received": {
    "from_agent": null,
    "task_summary": "Design CI/CD pipeline with multi-level testing strategy",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "design",
    "data": {
      "ci_cd_platform": "GitHub Actions",
      "pipeline_stages": 6,
      "total_estimated_time": "26 minutes",
      "deployment_strategy": "blue-green",
      "testing_levels": ["unit", "integration", "contract", "e2e", "performance"],
      "environments": ["dev", "staging", "production"],
      "rollback_mechanism": "Automatic on health check failure",
      "containerization": "Docker (multi-stage build)",
      "orchestration": "Kubernetes"
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": [".github/workflows/ci-cd.yml", "Dockerfile", "k8s/deployment.yml", "playwright.config.ts"]
  },
  "metadata": {
    "execution_time_ms": 4000,
    "tokens_used": 4500,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": "chk_exec010_step01"
  }
}
```

## Trade-offs Considered
- **Speed vs Thoroughness**: Parallel where possible, sequential only when dependencies exist
- **Blue-green vs Canary**: Blue-green for simplicity, canary for future consideration
- **Manual approval for prod**: Required for safety, adds small delay
- **E2E on staging**: Catches integration issues before production, adds 8 min to pipeline
