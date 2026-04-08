# Example 2: Query Optimization & Performance Tuning

## Mission
Analyze slow database queries, identify bottlenecks using EXPLAIN ANALYZE, and apply optimization techniques.

## Input — Slow Query

```sql
-- Takes 3.2 seconds on 500k rows
SELECT o.id, o.total, u.email, u.full_name,
       COUNT(oi.id) as item_count
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'delivered'
  AND o.created_at > NOW() - INTERVAL '30 days'
GROUP BY o.id, o.total, u.email, u.full_name
ORDER BY o.created_at DESC
LIMIT 50;
```

## EXPLAIN ANALYZE Results (Before)

```
Sort (cost=45230..45232 rows=50)
  -> HashAggregate (cost=45100..45200 rows=50)
     -> Hash Join (cost=40000..44000 rows=12000)
        -> Seq Scan on orders o (cost=0..25000 rows=12000)
             Filter: status = 'delivered' AND created_at > ...
             Rows Removed by Filter: 488000
        -> Hash (cost=15000..15000 rows=500000)
             -> Seq Scan on users u
Planning Time: 2.1ms
Execution Time: 3200ms  ❌
```

**Problems identified:**
1. Sequential scan on `orders` — no index on `status + created_at`
2. Full table scan on `users` — hash join on all 500k users
3. No composite index for the WHERE + ORDER BY pattern

## Optimization Applied

```sql
-- 1. Composite index for the exact query pattern
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC)
  WHERE status IN ('delivered', 'shipped');

-- 2. Covering index to avoid table lookup
CREATE INDEX idx_orders_covering ON orders(status, created_at DESC)
  INCLUDE (id, total, user_id);

-- 3. Index on order_items for join acceleration
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 4. Rewritten query with CTE for better plan
WITH recent_orders AS (
  SELECT id, total, user_id, created_at
  FROM orders
  WHERE status = 'delivered'
    AND created_at > NOW() - INTERVAL '30 days'
  ORDER BY created_at DESC
  LIMIT 50
)
SELECT ro.id, ro.total, u.email, u.full_name,
       COUNT(oi.id) as item_count
FROM recent_orders ro
JOIN users u ON u.id = ro.user_id
JOIN order_items oi ON oi.order_id = ro.id
GROUP BY ro.id, ro.total, ro.created_at, u.email, u.full_name
ORDER BY ro.created_at DESC;
```

## EXPLAIN ANALYZE Results (After)

```
Sort (cost=320..322 rows=50)
  -> HashAggregate (cost=280..310 rows=50)
     -> Nested Loop (cost=12..250 rows=150)
        -> Index Scan on orders (idx_orders_covering)
             Index Cond: status = 'delivered' AND created_at > ...
             Rows: 50
        -> Index Scan on users (users_pkey)
             Rows: 1 per loop
Planning Time: 0.8ms
Execution Time: 12ms  ✅ (266x faster)
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "database-agent",
  "timestamp": "2026-04-08T11:00:00Z",
  "status": "success",
  "confidence": 0.93,
  "input_received": {
    "from_agent": null,
    "task_summary": "Optimize slow query on orders table (3.2s on 500k rows)",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "analysis",
    "data": {
      "optimization_type": "query_performance",
      "before": {"execution_time_ms": 3200, "scan_type": "sequential", "rows_scanned": 500000},
      "after": {"execution_time_ms": 12, "scan_type": "index", "rows_scanned": 50},
      "improvement": "266x faster",
      "changes_applied": [
        "Added composite index on (status, created_at DESC)",
        "Added covering index with INCLUDE clause",
        "Rewrote query using CTE for LIMIT push-down",
        "Leveraged nested loop join instead of hash join"
      ],
      "indexes_created": 3
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["migrations/003_add_performance_indexes.sql", "reports/query-analysis.md"]
  },
  "context_info": {
    "input_tokens": 800,
    "output_tokens": 2200,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 2000,
    "tokens_used": 3000,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Best Practices Applied
- Always use EXPLAIN ANALYZE before and after optimization
- Composite indexes must match WHERE + ORDER BY column order
- Covering indexes (INCLUDE) eliminate table lookups
- CTE with LIMIT pushes the filter down before joins
- Partial indexes for known high-cardinality values
