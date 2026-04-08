# Example: Review Production API Code

## Input

app.get("/users", async (req, res) => {
  const users = await db.query("SELECT * FROM users");
  res.send(users);
});

## Issues
- No pagination → performance risk
- No authentication → security issue
- No error handling

## Suggestions

app.get("/users", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const users = await db.query("SELECT * FROM users LIMIT $1", [limit]);
    res.json(users);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

## Severity
- High (security)
- Medium (performance)