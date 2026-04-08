# Example: Scalable Auth API with JWT & Refresh Token

## Input
Build secure authentication system

## Requirements
- Node.js + Express
- JWT access + refresh tokens
- Password hashing (bcrypt)
- Rate limiting

## Endpoints

POST /auth/register  
POST /auth/login  
POST /auth/refresh  
POST /auth/logout  

## Implementation

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  // save user
  res.json({ message: "User created" });
});

app.post("/auth/login", async (req, res) => {
  const user = {}; // fetch user
  const token = jwt.sign({ id: user.id }, "SECRET", { expiresIn: "15m" });
  const refresh = jwt.sign({ id: user.id }, "REFRESH_SECRET", { expiresIn: "7d" });

  res.json({ token, refresh });
});

## Best Practices
- Token expiration
- Secure cookie storage
- Input validation (Joi/Zod)
- Centralized error handler