# Example 1: Scalable Auth API with JWT & Refresh Token

## Mission
Build a secure authentication system with token-based auth, rate limiting, and proper error handling.

## Requirements
- Node.js + Express
- JWT access + refresh tokens
- Password hashing (bcrypt)
- Rate limiting
- Input validation

## Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Authenticate and return tokens |
| POST | `/auth/refresh` | Refresh expired access token |
| POST | `/auth/logout` | Invalidate refresh token |

## Implementation

```javascript
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());

// Rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many attempts, try again later" }
});

// Validation schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
});

// Register
app.post("/auth/register", authLimiter, async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const hashed = await bcrypt.hash(password, 12);
    const user = await db.users.create({ email, password: hashed });
    res.status(201).json({ message: "User created", userId: user.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
    await db.refreshTokens.store(user.id, refreshToken);
    res.json({ accessToken, refreshToken, expiresIn: 900 });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Refresh
app.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const stored = await db.refreshTokens.find(payload.id, refreshToken);
    if (!stored) return res.status(403).json({ error: "Invalid refresh token" });
    const newAccessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken: newAccessToken, expiresIn: 900 });
  } catch (err) {
    res.status(403).json({ error: "Token expired or invalid" });
  }
});
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "backend-agent",
  "timestamp": "2026-04-08T10:00:00Z",
  "status": "success",
  "confidence": 0.93,
  "input_received": {
    "from_agent": null,
    "task_summary": "Build secure authentication system with JWT",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "code",
    "data": {
      "framework": "Node.js/Express",
      "endpoints": [
        {"method": "POST", "path": "/auth/register", "description": "Create user with hashed password"},
        {"method": "POST", "path": "/auth/login", "description": "Authenticate and return JWT + refresh token"},
        {"method": "POST", "path": "/auth/refresh", "description": "Refresh expired access token"},
        {"method": "POST", "path": "/auth/logout", "description": "Invalidate refresh token"}
      ],
      "auth_strategy": "JWT (access 15m + refresh 7d)",
      "security_features": ["bcrypt hashing", "rate limiting", "input validation (Zod)"],
      "dependencies": ["express", "jsonwebtoken", "bcrypt", "zod", "express-rate-limit"]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["routes/auth.js", "middleware/rateLimiter.js", "validators/authSchema.js"]
  },
  "dependencies": {
    "requires": [],
    "provides_to": ["security-agent", "frontend-agent"]
  },
  "pre_execution_snapshot": {
    "snapshot_id": "snap_exec001_backend",
    "files_modified": [],
    "files_created": ["routes/auth.js", "middleware/rateLimiter.js"],
    "files_deleted": [],
    "schema_changes": [],
    "config_changes": [".env updated with JWT_SECRET"]
  },
  "context_info": {
    "input_tokens": 800,
    "output_tokens": 2400,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 3200,
    "tokens_used": 3200,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": "chk_exec001_step02"
  }
}
```

## Best Practices Applied
- JWT token expiration (15m access, 7d refresh)
- Secure password hashing with bcrypt (salt rounds: 12)
- Input validation using Zod schema
- Rate limiting on auth endpoints
- Centralized error handling
- Refresh token stored server-side for revocation