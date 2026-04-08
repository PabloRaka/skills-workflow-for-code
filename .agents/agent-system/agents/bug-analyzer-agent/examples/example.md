# Example: Race Condition Bug

## Input

balance = balance - amount

## Issue
- Concurrent requests cause incorrect balance

## Root Cause
- No locking / transaction

## Fix

BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - amount WHERE id = ?;
COMMIT;

## Prevention
- Use database transactions
- Apply mutex/locking mechanism