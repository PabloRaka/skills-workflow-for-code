# Example 3: API Authorization & RBAC Design

## Mission
Design and implement a Role-Based Access Control (RBAC) system with middleware for API endpoint protection.

## Requirements
- Role hierarchy: `admin > manager > user > guest`
- Permission-based access (not just role-based)
- Middleware pattern for Express.js
- Audit logging for access attempts

## Implementation

```javascript
// roles.js — Permission Matrix
const PERMISSIONS = {
  admin:   ["read", "write", "delete", "manage_users", "view_analytics", "manage_roles"],
  manager: ["read", "write", "delete", "view_analytics"],
  user:    ["read", "write"],
  guest:   ["read"]
};

const ROLE_HIERARCHY = { admin: 4, manager: 3, user: 2, guest: 1 };

// middleware/authorize.js
function authorize(...requiredPermissions) {
  return (req, res, next) => {
    const userRole = req.user?.role || "guest";
    const userPermissions = PERMISSIONS[userRole] || [];

    const hasPermission = requiredPermissions.every(
      perm => userPermissions.includes(perm)
    );

    // Audit log every access attempt
    auditLog({
      userId: req.user?.id,
      role: userRole,
      resource: req.originalUrl,
      method: req.method,
      permissions_required: requiredPermissions,
      granted: hasPermission,
      timestamp: new Date().toISOString(),
      ip: req.ip
    });

    if (!hasPermission) {
      return res.status(403).json({
        error: "Forbidden",
        required: requiredPermissions,
        your_role: userRole
      });
    }
    next();
  };
}

// middleware/requireRole.js — Role hierarchy check
function requireRole(minimumRole) {
  return (req, res, next) => {
    const userLevel = ROLE_HIERARCHY[req.user?.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({ error: "Insufficient role level" });
    }
    next();
  };
}

// Usage in routes
app.get("/api/users", authorize("read"), getUsers);
app.post("/api/users", authorize("write", "manage_users"), createUser);
app.delete("/api/users/:id", authorize("delete", "manage_users"), deleteUser);
app.get("/api/analytics", authorize("view_analytics"), getAnalytics);
app.put("/api/roles/:userId", requireRole("admin"), updateUserRole);
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "security-agent",
  "timestamp": "2026-04-08T16:00:00Z",
  "status": "success",
  "confidence": 0.92,
  "input_received": {
    "from_agent": "backend-agent",
    "task_summary": "Design RBAC system with permission-based middleware",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "code",
    "data": {
      "rbac_model": "permission-based with role hierarchy",
      "roles": ["admin", "manager", "user", "guest"],
      "total_permissions": 6,
      "middleware_provided": ["authorize()", "requireRole()"],
      "features": [
        "Permission-based access control",
        "Role hierarchy with level comparison",
        "Audit logging for all access attempts",
        "Composable middleware pattern"
      ],
      "audit_fields": ["userId", "role", "resource", "method", "granted", "ip", "timestamp"]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["middleware/authorize.js", "middleware/requireRole.js", "config/roles.js", "services/auditLog.js"]
  },
  "context_info": {
    "input_tokens": 1000,
    "output_tokens": 2200,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 3100,
    "tokens_used": 3200,
    "retry_count": 0,
    "risk_level": "high",
    "approval_status": "approved",
    "checkpoint_id": "chk_exec004_step03"
  }
}
```

## Best Practices Applied
- Permission-based over simple role checking (more granular)
- Role hierarchy for simplified minimum-role checks
- Audit logging on every access attempt (granted AND denied)
- Composable middleware (combine permissions: `authorize("write", "manage_users")`)
- IP logging for security investigations
- Clear error messages with required permissions for debugging
