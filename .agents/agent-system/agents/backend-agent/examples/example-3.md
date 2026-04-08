# Example 3: WebSocket Real-Time Notification Service

## Mission
Build a real-time notification system using WebSocket with room-based broadcasting, authentication, and message persistence.

## Requirements
- Node.js + Socket.IO
- JWT authentication for WebSocket connections
- Room-based notifications (per-user, per-channel)
- Message queue for offline users
- Redis for pub/sub scaling

## Implementation

```javascript
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Redis from "ioredis";

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});

const redis = new Redis(process.env.REDIS_URL);
const pub = new Redis(process.env.REDIS_URL);
const sub = new Redis(process.env.REDIS_URL);

// Auth middleware for WebSocket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = user.id;
    socket.userRole = user.role;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

io.on("connection", async (socket) => {
  // Join personal room
  socket.join(`user:${socket.userId}`);
  console.log(`User ${socket.userId} connected`);

  // Deliver queued messages for offline period
  const queued = await redis.lrange(`queue:${socket.userId}`, 0, -1);
  if (queued.length > 0) {
    queued.forEach(msg => socket.emit("notification", JSON.parse(msg)));
    await redis.del(`queue:${socket.userId}`);
  }

  // Subscribe to channels
  socket.on("subscribe", (channel) => {
    socket.join(`channel:${channel}`);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Send notification (called from other services)
async function sendNotification(userId, notification) {
  const payload = {
    id: crypto.randomUUID(),
    ...notification,
    timestamp: new Date().toISOString(),
    read: false
  };

  // Persist to database
  await db.notifications.create({ data: { userId, ...payload } });

  // Check if user is online
  const room = io.sockets.adapter.rooms.get(`user:${userId}`);
  if (room && room.size > 0) {
    io.to(`user:${userId}`).emit("notification", payload);
  } else {
    // Queue for offline delivery
    await redis.rpush(`queue:${userId}`, JSON.stringify(payload));
    await redis.expire(`queue:${userId}`, 7 * 24 * 3600); // 7 days TTL
  }
}

// Broadcast to channel
async function broadcastToChannel(channel, notification) {
  io.to(`channel:${channel}`).emit("notification", {
    id: crypto.randomUUID(),
    ...notification,
    timestamp: new Date().toISOString()
  });
}
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "backend-agent",
  "timestamp": "2026-04-08T12:00:00Z",
  "status": "success",
  "confidence": 0.88,
  "input_received": {
    "from_agent": "software-engineer-agent",
    "task_summary": "Build real-time notification system with WebSocket",
    "summarized": true,
    "artifact_refs": ["output_architect_003"]
  },
  "output": {
    "type": "code",
    "data": {
      "framework": "Node.js/Socket.IO + Redis",
      "features": [
        "JWT auth for WebSocket",
        "Room-based broadcasting",
        "Offline message queue",
        "Redis pub/sub for horizontal scaling",
        "Message persistence to DB"
      ],
      "events": [
        {"event": "connection", "direction": "server", "description": "Client connects with JWT"},
        {"event": "notification", "direction": "server→client", "description": "Push notification"},
        {"event": "subscribe", "direction": "client→server", "description": "Join channel"}
      ]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["services/notification.js", "middleware/wsAuth.js", "config/redis.js"]
  },
  "dependencies": {
    "requires": ["software-engineer-agent"],
    "provides_to": ["frontend-agent", "security-agent"]
  },
  "context_info": {
    "input_tokens": 1800,
    "output_tokens": 3200,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 5500,
    "tokens_used": 5000,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": "chk_exec003_step02"
  }
}
```

## Best Practices Applied
- JWT authentication on WebSocket handshake
- Room-based isolation (per-user, per-channel)
- Offline message queueing with Redis (7-day TTL)
- Redis pub/sub for horizontal scaling across multiple server instances
- Message persistence to database for history
- Graceful disconnect handling
