# Example 2: Memory Leak in React Component

## Mission
Diagnose and fix a memory leak caused by uncleared event listeners and intervals in a React component.

## Input — Buggy Code

```tsx
// ❌ BUGGY: Memory leak — listeners and intervals never cleaned up
function LiveDashboard() {
  const [data, setData] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Interval never cleared
    setInterval(async () => {
      const res = await fetch("/api/metrics");
      const json = await res.json();
      setData(json); // May update unmounted component!
    }, 5000);

    // Event listener never removed
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    // WebSocket never closed
    const ws = new WebSocket("ws://localhost:3001/live");
    ws.onmessage = (e) => setData(JSON.parse(e.data));
  }, []);

  return <div>{/* render data */}</div>;
}
```

## Root Cause Analysis

| Issue | Leak Type | Impact |
|:------|:----------|:-------|
| `setInterval` without clearInterval | Timer leak | Continues running after unmount, accumulates |
| `addEventListener` without removeEventListener | Event listener leak | Listeners stack on each mount |
| `WebSocket` without close | Connection leak | Socket stays open, server resources wasted |
| `setData` after unmount | State update on unmounted | React warning, potential crash |

**Memory Profile:**
```
Mount  1: 2 listeners, 1 interval, 1 WebSocket
Mount  2: 4 listeners, 2 intervals, 2 WebSockets
Mount 10: 20 listeners, 10 intervals, 10 WebSockets → OOM crash
```

## Fixed Implementation

```tsx
// ✅ FIXED: Proper cleanup with useEffect return
function LiveDashboard() {
  const [data, setData] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount
    const abortController = new AbortController();

    // Polling with cleanup
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch("/api/metrics", { signal: abortController.signal });
        const json = await res.json();
        if (isMounted) setData(json); // Only update if still mounted
      } catch (err) {
        if (err.name !== "AbortError") console.error("Fetch failed:", err);
      }
    }, 5000);

    // Event listeners with named functions (required for removal)
    const handleOnline = () => { if (isMounted) setIsOnline(true); };
    const handleOffline = () => { if (isMounted) setIsOnline(false); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // WebSocket with cleanup
    const ws = new WebSocket("ws://localhost:3001/live");
    ws.onmessage = (e) => {
      if (isMounted) setData(JSON.parse(e.data));
    };
    ws.onerror = (e) => console.error("WebSocket error:", e);

    // ✅ CLEANUP FUNCTION — runs on unmount
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      abortController.abort();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  return <div>{/* render data */}</div>;
}
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "bug-analyzer-agent",
  "timestamp": "2026-04-08T12:00:00Z",
  "status": "success",
  "confidence": 0.95,
  "input_received": {
    "from_agent": null,
    "task_summary": "Diagnose memory leak in React LiveDashboard component",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "fix",
    "data": {
      "bug_type": "memory_leak",
      "severity": "high",
      "root_cause": "useEffect without cleanup function — intervals, listeners, and WebSocket never released on unmount",
      "leak_sources": ["setInterval", "addEventListener(x2)", "WebSocket"],
      "impact": "Memory usage grows linearly with component re-mounts, leading to OOM crash",
      "fix": "Add useEffect cleanup function with clearInterval, removeEventListener, and ws.close()",
      "additional_fixes": [
        "isMounted flag to prevent setState on unmounted component",
        "AbortController to cancel in-flight fetch requests",
        "Named functions for event listeners (required for removeEventListener)"
      ],
      "prevention": [
        "Always return cleanup function from useEffect",
        "Use ESLint rule react-hooks/exhaustive-deps",
        "Use custom hooks (useInterval, useEventListener) that handle cleanup automatically",
        "Profile with Chrome DevTools Memory tab during development"
      ]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["fixes/LiveDashboard-patched.tsx", "hooks/useInterval.ts", "hooks/useEventListener.ts"]
  },
  "context_info": {
    "input_tokens": 700,
    "output_tokens": 2200,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 1500,
    "tokens_used": 2900,
    "retry_count": 0,
    "risk_level": "low",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Prevention Strategy
- **Rule**: Every `useEffect` with side effects MUST return a cleanup function
- Use custom hooks (`useInterval`, `useEventListener`) that handle cleanup automatically
- Enable ESLint `react-hooks/exhaustive-deps` rule
- Profile with Chrome DevTools Memory tab to catch leaks early
- Use `AbortController` for fetch requests that should cancel on unmount
