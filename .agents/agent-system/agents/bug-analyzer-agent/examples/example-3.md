# Example 3: N+1 Query Problem in ORM

## Mission
Identify and fix an N+1 query problem causing severe database performance degradation in a REST API endpoint.

## Input — Buggy Code

```javascript
// ❌ BUGGY: N+1 query — 1 query for posts + N queries for authors
app.get("/api/posts", async (req, res) => {
  const posts = await prisma.post.findMany({ take: 50 });

  const result = [];
  for (const post of posts) {
    // ❌ This runs 50 separate queries!
    const author = await prisma.user.findUnique({ where: { id: post.authorId } });
    result.push({ ...post, author });
  }

  res.json(result);
});
```

## Root Cause Analysis

```
Database queries executed:

Query 1: SELECT * FROM posts LIMIT 50
Query 2: SELECT * FROM users WHERE id = 'user_001'
Query 3: SELECT * FROM users WHERE id = 'user_002'
Query 4: SELECT * FROM users WHERE id = 'user_003'
...
Query 51: SELECT * FROM users WHERE id = 'user_050'

Total: 51 queries for 50 posts! (1 + N = 1 + 50)
With 1000 posts: 1001 queries → ~5 seconds response time
```

**Root Cause:** Lazy loading pattern — fetching related data inside a loop instead of eager loading in a single query.

## Fixed Implementation

```javascript
// ✅ FIX 1: Prisma include (eager loading) — 2 queries total
app.get("/api/posts", async (req, res) => {
  const posts = await prisma.post.findMany({
    take: 50,
    include: {
      author: {
        select: { id: true, username: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(posts);
});

// ✅ FIX 2: Manual batching with DataLoader pattern — for complex cases
import DataLoader from "dataloader";

const userLoader = new DataLoader(async (userIds) => {
  const users = await prisma.user.findMany({
    where: { id: { in: [...userIds] } }
  });
  // Return in same order as input ids
  const userMap = new Map(users.map(u => [u.id, u]));
  return userIds.map(id => userMap.get(id));
});

app.get("/api/posts", async (req, res) => {
  const posts = await prisma.post.findMany({ take: 50 });
  
  // DataLoader batches all individual loads into 1 query
  const result = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      author: await userLoader.load(post.authorId) // Batched automatically!
    }))
  );

  res.json(result);
});
```

## Performance Comparison

| Approach | Queries | Time (50 posts) | Time (1000 posts) |
|:---------|:--------|:-----------------|:-------------------|
| ❌ N+1 (loop) | 51 | 250ms | 5000ms |
| ✅ Include (eager) | 2 | 15ms | 45ms |
| ✅ DataLoader (batch) | 2 | 18ms | 50ms |

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "bug-analyzer-agent",
  "timestamp": "2026-04-08T14:00:00Z",
  "status": "success",
  "confidence": 0.96,
  "input_received": {
    "from_agent": null,
    "task_summary": "Fix N+1 query problem causing slow API response",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "fix",
    "data": {
      "bug_type": "n_plus_1_query",
      "severity": "high",
      "root_cause": "Lazy loading inside a loop — each post triggers a separate author query",
      "impact": "Response time scales linearly with number of posts (51 queries for 50 posts)",
      "fixes_provided": [
        {"method": "Prisma include (eager loading)", "queries": 2, "complexity": "simple"},
        {"method": "DataLoader batching", "queries": 2, "complexity": "medium"}
      ],
      "performance_improvement": "16x faster (250ms → 15ms for 50 posts)",
      "prevention": [
        "Always use include/eager loading for related data",
        "Use DataLoader for complex batching scenarios",
        "Enable query logging in development to spot N+1 patterns",
        "Add Prisma middleware to warn on N+1 queries"
      ]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["fixes/posts-optimized.js"]
  },
  "context_info": {
    "input_tokens": 500,
    "output_tokens": 2000,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 1200,
    "tokens_used": 2500,
    "retry_count": 0,
    "risk_level": "low",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Prevention Strategy
- Enable query logging in development to detect N+1 patterns
- Always use `include` or `join` for related data in list endpoints
- Use DataLoader for GraphQL or complex batching needs
- Add automated tests that assert query count per endpoint
- Consider Prisma middleware for N+1 detection warnings
