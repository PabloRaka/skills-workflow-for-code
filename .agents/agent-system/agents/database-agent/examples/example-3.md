# Example 3: MongoDB Schema Design for Social Media Platform

## Mission
Design a NoSQL (MongoDB) schema for a social media platform with users, posts, comments, likes, and follower relationships.

## Requirements
- MongoDB with Mongoose ODM
- Denormalized for read-heavy workloads
- Embedding vs referencing strategy per collection
- Compound indexes for feed queries
- TTL indexes for expiring content (stories)

## Schema Design

```javascript
import mongoose from "mongoose";

// User Schema — Reference pattern for large collections
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, lowercase: true, trim: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  profile: {
    displayName: String,
    bio: { type: String, maxLength: 160 },
    avatarUrl: String,
    website: String
  },
  stats: {
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    posts: { type: Number, default: 0 }
  },
  isVerified: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false }
}, { timestamps: true });

// Post Schema — Embed author summary (denormalized for read speed)
const postSchema = new mongoose.Schema({
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: String,
    displayName: String,
    avatarUrl: String
  },
  content: { type: String, required: true, maxLength: 2200 },
  media: [{
    url: String,
    type: { type: String, enum: ["image", "video"] },
    width: Number,
    height: Number
  }],
  hashtags: [{ type: String, lowercase: true }],
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  stats: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// Comment Schema — Small embedded author, reference to post
const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    avatarUrl: String
  },
  content: { type: String, required: true, maxLength: 500 },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

// Follow relationship — Separate collection for scalability
const followSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now }
});

// Story Schema — TTL index for auto-expiration
const storySchema = new mongoose.Schema({
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: String,
    avatarUrl: String
  },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video"] },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

// Indexes
userSchema.index({ username: 1 });
postSchema.index({ "author._id": 1, createdAt: -1 });
postSchema.index({ hashtags: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
commentSchema.index({ postId: 1, createdAt: 1 });
commentSchema.index({ parentId: 1 });
followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });
```

## Design Decisions

| Decision | Choice | Rationale |
|:---------|:-------|:----------|
| Author in posts | **Embedded** (denormalized) | Read-heavy: avoid JOIN on every feed load |
| Comments | **Separate collection** | Unbounded growth, can't embed in post |
| Followers | **Separate collection** | Many-to-many, needs bidirectional queries |
| Stories | **TTL index** | Auto-expire after 24h, no manual cleanup |
| Hashtags | **Array field** | Multikey index for fast hashtag search |

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "database-agent",
  "timestamp": "2026-04-08T13:00:00Z",
  "status": "success",
  "confidence": 0.90,
  "input_received": {
    "from_agent": "software-engineer-agent",
    "task_summary": "Design MongoDB schema for social media platform",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "design",
    "data": {
      "db_type": "MongoDB",
      "odm": "Mongoose",
      "collections": ["users", "posts", "comments", "follows", "stories"],
      "total_collections": 5,
      "schema": {
        "users": {"pattern": "reference", "fields": 8, "unique": ["username", "email"]},
        "posts": {"pattern": "embedded author", "fields": 8, "denormalized": ["author.username", "author.avatarUrl"]},
        "comments": {"pattern": "reference to post, embedded author", "fields": 6, "supports_threading": true},
        "follows": {"pattern": "edge collection", "fields": 3, "unique_constraint": "follower+following"},
        "stories": {"pattern": "TTL auto-expire", "fields": 5, "ttl": "24 hours"}
      },
      "indexes": 8,
      "features": ["denormalized reads", "TTL auto-expiry", "threaded comments", "multikey hashtag index"]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["models/User.js", "models/Post.js", "models/Comment.js", "models/Follow.js", "models/Story.js"]
  },
  "context_info": {
    "input_tokens": 1200,
    "output_tokens": 3400,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 3500,
    "tokens_used": 4600,
    "retry_count": 0,
    "risk_level": "high",
    "approval_status": "approved",
    "checkpoint_id": "chk_exec005_step01"
  }
}
```

## Best Practices Applied
- Embed frequently-read data (author in post) for read performance
- Separate unbounded collections (comments, follows)
- TTL index for auto-expiring stories (no cron job needed)
- Compound indexes matching query patterns
- Unique compound index on follows to prevent duplicates
- Stats counters denormalized for fast display
