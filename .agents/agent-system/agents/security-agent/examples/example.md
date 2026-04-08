# Example: Full Security Audit

## Input
Audit login system

## Findings

1. Password stored in plain text ❌
2. No rate limiting ❌
3. No HTTPS ❌

## Fixes

- Use bcrypt hashing
- Add rate limiter middleware
- Enforce HTTPS

## Advanced Recommendations
- Implement 2FA
- Use OAuth2
- Monitor suspicious activity

## Risk Level
CRITICAL