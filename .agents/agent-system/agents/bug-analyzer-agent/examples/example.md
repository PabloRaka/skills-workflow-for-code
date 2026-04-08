# Example 1: Race Condition Bug in Financial Transaction

## Mission
Analyze and fix a critical race condition bug causing incorrect balance calculations in concurrent financial transactions.

## Input — Buggy Code

```javascript
// ❌ BUGGY: Race condition in balance deduction
app.post("/api/transfer", async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  const sender = await db.users.findById(fromUserId);
  const receiver = await db.users.findById(toUserId);

  if (sender.balance < amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  // Race condition: two concurrent requests can both pass the balance check
  sender.balance -= amount;
  receiver.balance += amount;

  await db.users.update(fromUserId, { balance: sender.balance });
  await db.users.update(toUserId, { balance: receiver.balance });

  res.json({ success: true });
});
```

## Root Cause Analysis

```
Timeline of race condition:

Thread A: Read balance = $100, amount = $80 → passes check
Thread B: Read balance = $100, amount = $80 → passes check (stale read!)
Thread A: Write balance = $20 ✓
Thread B: Write balance = $20 (overwrites Thread A!) → $80 lost!

Result: User spent $160 from $100 balance. $80 created from nothing.
```

**Root Cause:** Read-modify-write pattern without atomicity. The balance check and deduction are not in a single atomic operation.

## Fixed Implementation

```javascript
// ✅ FIXED: Atomic transaction with row-level locking
app.post("/api/transfer", async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  // Use database transaction with FOR UPDATE lock
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Lock sender row — prevents concurrent reads until COMMIT
    const { rows: [sender] } = await client.query(
      "SELECT balance FROM users WHERE id = $1 FOR UPDATE",
      [fromUserId]
    );

    if (!sender || sender.balance < amount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Atomic deduction and addition
    await client.query(
      "UPDATE users SET balance = balance - $1, updated_at = NOW() WHERE id = $2",
      [amount, fromUserId]
    );
    await client.query(
      "UPDATE users SET balance = balance + $1, updated_at = NOW() WHERE id = $2",
      [amount, toUserId]
    );

    // Record the transaction for audit
    await client.query(
      "INSERT INTO transactions (from_user, to_user, amount, status) VALUES ($1, $2, $3, 'completed')",
      [fromUserId, toUserId, amount]
    );

    await client.query("COMMIT");
    res.json({ success: true, newBalance: sender.balance - amount });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Transfer failed" });
  } finally {
    client.release();
  }
});
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "bug-analyzer-agent",
  "timestamp": "2026-04-08T10:00:00Z",
  "status": "success",
  "confidence": 0.97,
  "input_received": {
    "from_agent": null,
    "task_summary": "Analyze race condition bug in financial transfer endpoint",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "fix",
    "data": {
      "bug_type": "race condition",
      "severity": "critical",
      "root_cause": "Read-modify-write pattern without atomicity — concurrent requests bypass balance check",
      "impact": "Users can spend more than their balance, creating money from nothing",
      "fix": "Database transaction with FOR UPDATE row-level locking",
      "fix_techniques": [
        "BEGIN/COMMIT transaction block",
        "SELECT FOR UPDATE (pessimistic locking)",
        "Atomic UPDATE (balance = balance - $1 instead of app-level calculation)",
        "Audit trail via transactions table"
      ],
      "code_snippet": "See fixed implementation above",
      "prevention": [
        "Always use database transactions for financial operations",
        "Use FOR UPDATE or advisory locks for concurrent access",
        "Never read-modify-write outside a transaction",
        "Add integration tests for concurrent requests"
      ]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["fixes/transfer-patched.js", "tests/transfer-concurrent.test.js"]
  },
  "context_info": {
    "input_tokens": 800,
    "output_tokens": 2500,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 1800,
    "tokens_used": 3300,
    "retry_count": 0,
    "risk_level": "low",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Prevention Strategy
- Always wrap financial operations in database transactions
- Use `SELECT ... FOR UPDATE` for pessimistic row-level locking
- Use atomic SQL updates (`balance = balance - X`) instead of app-level math
- Add concurrent request integration tests
- Consider optimistic locking with version columns for less contentious operations