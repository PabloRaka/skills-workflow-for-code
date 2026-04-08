# Example 2: Monolithic to Modular Monolith Migration

## Mission
Plan and execute a migration strategy from a legacy monolith to a modular monolith architecture, with a clear path to future microservices extraction.

## Context
- Existing Node.js Express monolith: 50k+ lines
- Everything in one codebase, one database, one deployment
- Growing team (3 → 8 developers), frequent merge conflicts
- Increasing deployment risk (small change = full redeploy)

## Migration Strategy

### Phase 1: Identify Bounded Contexts

```
Legacy Monolith Analysis:
├── /routes          → Mixed concerns across 40+ files
├── /controllers     → Business logic mixed with HTTP handling
├── /models          → Shared database models (tight coupling)
├── /services        → Some service layer but inconsistent
└── /utils           → 200+ utility functions (dump drawer)

Identified Bounded Contexts:
1. 👤 User Management (auth, profiles, roles)
2. 📦 Product Catalog (products, categories, search)
3. 🛒 Order Processing (cart, checkout, payment)
4. 📧 Communications (email, notifications, templates)
5. 📊 Analytics (tracking, reports, dashboards)
```

### Phase 2: Module Structure

```
src/
├── modules/
│   ├── user/
│   │   ├── user.module.ts        # Module definition (exports, deps)
│   │   ├── user.controller.ts    # HTTP layer
│   │   ├── user.service.ts       # Business logic
│   │   ├── user.repository.ts    # Data access
│   │   ├── user.entity.ts        # Domain model
│   │   ├── user.dto.ts           # Input/Output DTOs
│   │   ├── user.events.ts        # Domain events
│   │   └── __tests__/
│   │       ├── user.service.test.ts
│   │       └── user.controller.test.ts
│   │
│   ├── product/
│   │   ├── product.module.ts
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   └── ...
│   │
│   ├── order/
│   │   └── ...
│   │
│   └── shared/                   # Cross-cutting concerns
│       ├── database/
│       ├── events/               # Internal event bus
│       ├── middleware/
│       └── utils/
│
├── app.ts                        # Compose modules
└── server.ts                     # Entry point
```

### Phase 3: Module Boundaries Implementation

```typescript
// modules/user/user.module.ts
export interface UserModule {
  // Public API — only these are accessible to other modules
  controller: UserController;
  service: {
    findById(id: string): Promise<User>;
    validateCredentials(email: string, password: string): Promise<User | null>;
  };
  events: {
    onUserCreated: EventEmitter<UserCreatedEvent>;
    onUserDeleted: EventEmitter<UserDeletedEvent>;
  };
}

// ❌ FORBIDDEN: Other modules cannot access UserRepository directly
// ❌ FORBIDDEN: Other modules cannot import from user/internal/
```

```typescript
// modules/order/order.service.ts
import { UserModule } from "../user/user.module"; // ✅ Import module interface

export class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private userModule: UserModule  // ✅ Depend on module, not internal classes
  ) {}

  async createOrder(userId: string, items: CartItem[]) {
    // ✅ Access user through module's public API
    const user = await this.userModule.service.findById(userId);
    if (!user) throw new Error("User not found");

    const order = await this.orderRepo.create({ userId, items });

    // ✅ Communicate via events, not direct calls
    this.eventBus.emit("order.created", { orderId: order.id, userId });

    return order;
  }
}
```

### Phase 4: Internal Event Bus

```typescript
// shared/events/event-bus.ts
type EventHandler<T> = (payload: T) => Promise<void>;

class InternalEventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  subscribe<T>(event: string, handler: EventHandler<T>) {
    const existing = this.handlers.get(event) || [];
    existing.push(handler);
    this.handlers.set(event, existing);
  }

  async emit<T>(event: string, payload: T) {
    const handlers = this.handlers.get(event) || [];
    await Promise.allSettled(handlers.map(h => h(payload)));
  }
}

// Usage: When order is created, notify communications module
eventBus.subscribe("order.created", async ({ orderId, userId }) => {
  await communicationsModule.sendOrderConfirmation(orderId, userId);
});
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "software-engineer-agent",
  "timestamp": "2026-04-08T13:00:00Z",
  "status": "success",
  "confidence": 0.88,
  "input_received": {
    "from_agent": null,
    "task_summary": "Plan migration from legacy monolith to modular monolith",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "design",
    "data": {
      "architecture": "modular_monolith",
      "modules": ["user", "product", "order", "communications", "analytics"],
      "migration_phases": 4,
      "key_patterns": [
        "Bounded Contexts from DDD",
        "Module interface contracts",
        "Internal event bus for loose coupling",
        "Repository pattern for data isolation"
      ],
      "constraints": [
        "No cross-module direct database access",
        "All inter-module communication via public API or events",
        "Each module has independent test suite"
      ],
      "future_extraction_path": "Any module can be extracted to microservice by replacing event bus with Kafka",
      "development_plan": [
        {"phase": 1, "scope": "Identify bounded contexts and dependencies", "weeks": 1},
        {"phase": 2, "scope": "Create module structure and boundaries", "weeks": 3},
        {"phase": 3, "scope": "Implement event bus and migration", "weeks": 4},
        {"phase": 4, "scope": "Testing and validation", "weeks": 2}
      ]
    },
    "reasoning_log": [{"step": "plan", "description": "Selected modular monolith over microservices due to team size constraints."}],
    "impact_assessment": {"areas_affected": ["team workflow", "deployment CI/CD"], "risks": ["initial learning curve for event bus"]},
    "artifacts": ["migration-plan.md", "module-specs/", "dependency-graph.md"]
  },
  "metadata": {
    "execution_time_ms": 5200,
    "tokens_used": 5000,
    "retry_count": 0,
    "risk_level": "high",
    "approval_status": "approved",
    "checkpoint_id": "chk_exec009_step01"
  }
}
```

## Trade-offs Considered
- **Microservices now vs Modular monolith first**: Chose modular monolith to reduce operational complexity while gaining clear boundaries
- **Event bus vs direct calls**: Event bus adds latency but enables future extraction
- **Shared DB vs DB-per-module**: Keep shared DB for now, logical separation via schemas/namespaces
