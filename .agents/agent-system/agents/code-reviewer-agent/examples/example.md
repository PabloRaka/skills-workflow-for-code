# Example 1: Production API Code Review

## Mission
Comprehensive code review of a production API endpoint, identifying security, performance, and code quality issues with refactored solutions.

## Input — Code Under Review

```javascript
app.get("/users", async (req, res) => {
  const users = await db.query("SELECT * FROM users");
  res.send(users);
});

app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  await db.query(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${password}')`);
  res.send("User created");
});

app.delete("/users/:id", async (req, res) => {
  await db.query(`DELETE FROM users WHERE id = ${req.params.id}`);
  res.send("Deleted");
});
```

## Review Findings

| # | Issue | Severity | Category | Line |
|:--|:------|:---------|:---------|:-----|
| 1 | `SELECT *` without pagination | 🟠 High | Performance | GET /users |
| 2 | No authentication/authorization | 🔴 Critical | Security | All routes |
| 3 | SQL Injection via string interpolation | 🔴 Critical | Security | POST, DELETE |
| 4 | Password stored in plain text | 🔴 Critical | Security | POST |
| 5 | No input validation | 🟠 High | Reliability | POST |
| 6 | No error handling (try/catch) | 🟠 High | Reliability | All routes |
| 7 | Hard delete without soft-delete pattern | 🟡 Medium | Design | DELETE |
| 8 | Non-standard HTTP status codes | 🟡 Medium | Standards | All routes |
| 9 | `res.send()` instead of `res.json()` | 🟢 Info | Standards | All routes |

## Refactored Code

```javascript
import { z } from "zod";
import bcrypt from "bcrypt";

// Validation schema
const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
});

// GET /users — with pagination, auth, error handling
app.get("/users", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [users, [{ count }]] = await Promise.all([
      db.query(
        "SELECT id, name, email, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [parseInt(limit), offset]
      ),
      db.query("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL")
    ]);

    res.json({
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: parseInt(count) }
    });
  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /users — with validation, hashing, proper response
app.post("/users", authMiddleware, authorize("manage_users"), async (req, res) => {
  try {
    const { name, email, password } = createUserSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name, email, hashedPassword]
    );

    res.status(201).json({ data: user[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    if (err.code === "23505") { // Unique constraint violation
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// DELETE /users/:id — soft delete with UUID validation
app.delete("/users/:id", authMiddleware, authorize("manage_users"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidUUID(id)) return res.status(400).json({ error: "Invalid user ID" });

    const result = await db.query(
      "UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "code-reviewer-agent",
  "timestamp": "2026-04-08T10:00:00Z",
  "status": "success",
  "confidence": 0.95,
  "input_received": {
    "from_agent": null,
    "task_summary": "Review production API code for /users CRUD endpoints",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "review",
    "data": {
      "total_issues": 9,
      "by_severity": {"critical": 3, "high": 3, "medium": 2, "info": 1},
      "issues": [
        {"severity": "critical", "category": "security", "description": "SQL Injection via string interpolation", "fix": "Use parameterized queries ($1, $2)"},
        {"severity": "critical", "category": "security", "description": "No authentication on endpoints", "fix": "Add authMiddleware"},
        {"severity": "critical", "category": "security", "description": "Plain text password storage", "fix": "Use bcrypt.hash()"},
        {"severity": "high", "category": "performance", "description": "SELECT * without pagination", "fix": "Add LIMIT/OFFSET with pagination response"},
        {"severity": "high", "category": "reliability", "description": "No input validation", "fix": "Add Zod validation schema"},
        {"severity": "high", "category": "reliability", "description": "No error handling", "fix": "Add try/catch with proper error responses"}
      ],
      "refactored_code_provided": true,
      "patterns_applied": ["parameterized queries", "pagination", "soft delete", "input validation", "proper HTTP status codes"]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["review-report.md", "refactored/users-routes.js"]
  },
  "context_info": {
    "input_tokens": 600,
    "output_tokens": 2800,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 2200,
    "tokens_used": 3400,
    "retry_count": 0,
    "risk_level": "low",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Standards Applied
- OWASP security guidelines (parameterized queries, password hashing)
- RESTful HTTP status codes (201, 204, 400, 404, 409, 500)
- Input validation with Zod schemas
- Pagination for list endpoints
- Soft delete pattern (never hard delete in production)
- Role-based authorization on mutating endpoints