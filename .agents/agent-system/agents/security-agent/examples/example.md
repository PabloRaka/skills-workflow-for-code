# Example 1: Full Security Audit — Login System

## Mission
Perform comprehensive security audit on a login system, identifying OWASP Top 10 vulnerabilities and providing prioritized fixes.

## Input Code Under Review

```javascript
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
  if (user && user.password === password) {
    const token = jwt.sign({ id: user.id }, "mysecret");
    res.json({ token });
  } else {
    res.status(401).send("Wrong password for " + email);
  }
});
```

## Vulnerability Analysis

| # | Vulnerability | OWASP | Risk | Location |
|:--|:-------------|:------|:-----|:---------|
| 1 | SQL Injection | A03:2021 | 🔴 Critical | `db.query(SELECT ... ${email})` — string interpolation |
| 2 | Plain text password comparison | A02:2021 | 🔴 Critical | `user.password === password` — no hashing |
| 3 | Hardcoded JWT secret | A02:2021 | 🔴 Critical | `"mysecret"` — exposed in source code |
| 4 | No token expiration | A07:2021 | 🟠 High | `jwt.sign` without `expiresIn` |
| 5 | Information leakage | A01:2021 | 🟡 Medium | Error reveals email in response |
| 6 | No rate limiting | A04:2021 | 🟡 Medium | Unlimited login attempts |
| 7 | No input validation | A03:2021 | 🟡 Medium | No sanitization on email/password |

## Fixed Implementation

```javascript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

app.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Parameterized query prevents SQL injection
    const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Generic error prevents information leakage
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,  // Environment variable, not hardcoded
      { expiresIn: "15m" }     // Token expires in 15 minutes
    );

    res.json({ token, expiresIn: 900 });
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "security-agent",
  "timestamp": "2026-04-08T10:30:00Z",
  "status": "success",
  "confidence": 0.96,
  "input_received": {
    "from_agent": "backend-agent",
    "task_summary": "Audit login system for security vulnerabilities",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "analysis",
    "data": {
      "vulnerabilities": [
        {"type": "SQL Injection", "owasp": "A03:2021", "risk": "critical", "location": "db.query with string interpolation", "fix": "Use parameterized queries ($1 placeholder)"},
        {"type": "Plain Text Password", "owasp": "A02:2021", "risk": "critical", "location": "Direct password comparison", "fix": "Use bcrypt.compare()"},
        {"type": "Hardcoded Secret", "owasp": "A02:2021", "risk": "critical", "location": "jwt.sign with 'mysecret'", "fix": "Use process.env.JWT_SECRET"},
        {"type": "No Token Expiration", "owasp": "A07:2021", "risk": "high", "location": "jwt.sign without expiresIn", "fix": "Add expiresIn: '15m'"},
        {"type": "Information Leakage", "owasp": "A01:2021", "risk": "medium", "location": "Error response reveals email", "fix": "Generic 'Invalid credentials' message"},
        {"type": "No Rate Limiting", "owasp": "A04:2021", "risk": "medium", "location": "Login endpoint", "fix": "Add express-rate-limit middleware"},
        {"type": "No Input Validation", "owasp": "A03:2021", "risk": "medium", "location": "req.body used directly", "fix": "Add Zod validation schema"}
      ],
      "overall_risk": "critical",
      "total_issues": 7,
      "critical_count": 3,
      "fixed_code_provided": true,
      "recommendations": [
        "Implement 2FA for sensitive accounts",
        "Add account lockout after 5 failed attempts",
        "Log all failed login attempts for monitoring",
        "Use HTTPS-only secure cookies for token storage"
      ]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["security-report.md", "fixes/login-patched.js"]
  },
  "dependencies": {
    "requires": ["backend-agent"],
    "provides_to": []
  },
  "context_info": {
    "input_tokens": 1500,
    "output_tokens": 2800,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 2800,
    "tokens_used": 4300,
    "retry_count": 0,
    "risk_level": "high",
    "approval_status": "approved",
    "checkpoint_id": "chk_exec001_step04"
  }
}
```

## Summary
- **3 Critical** vulnerabilities fixed (SQL injection, plain text passwords, hardcoded secrets)
- **1 High** vulnerability fixed (token expiration)
- **3 Medium** vulnerabilities fixed (info leak, rate limit, validation)
- **4 Advanced recommendations** provided for additional hardening