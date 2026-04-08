# Example 2: React Component Architecture Review

## Mission
Review React component architecture for scalability, performance, and maintainability issues.

## Input — Code Under Review

```tsx
// ❌ Monolithic component with multiple issues
function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users?search=${search}&sort=${sort}&page=${page}`)
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false); });
  }, [search, sort, page]);

  // 300+ lines of handlers, validation, rendering...
  return (
    <div>
      {/* Everything rendered in one giant component */}
    </div>
  );
}
```

## Review Findings

| # | Issue | Severity | Category |
|:--|:------|:---------|:---------|
| 1 | God component (10+ state variables, 300+ lines) | 🟠 High | Architecture |
| 2 | No custom hooks — logic mixed with UI | 🟠 High | Separation of Concerns |
| 3 | No error handling on fetch | 🟠 High | Reliability |
| 4 | Search triggers API on every keystroke | 🟡 Medium | Performance |
| 5 | No loading/error states in UI | 🟡 Medium | UX |
| 6 | Inline fetch instead of API service layer | 🟡 Medium | Maintainability |
| 7 | No TypeScript interfaces for data models | 🟢 Info | Type Safety |
| 8 | No memoization on filtered/sorted data | 🟢 Info | Performance |

## Refactored Architecture

```tsx
// hooks/useUsers.ts — Custom hook for data fetching
import { useState, useEffect, useCallback } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import { UserFilters, PaginatedResponse, User } from "../types/user";
import { userApi } from "../services/userApi";

export function useUsers(filters: UserFilters) {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userApi.getUsers({
        ...filters,
        search: debouncedSearch
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.sort, filters.page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { data, loading, error, refetch: fetchUsers };
}
```

```tsx
// hooks/useDebouncedValue.ts
import { useState, useEffect } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

```tsx
// services/userApi.ts — API service layer
import { User, UserFilters, PaginatedResponse } from "../types/user";

const BASE_URL = "/api/users";

export const userApi = {
  async getUsers(filters: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      search: filters.search || "",
      sort: filters.sort || "name",
      page: String(filters.page || 1)
    });
    const res = await fetch(`${BASE_URL}?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
};
```

```tsx
// components/UserDashboard.tsx — Clean, focused component
import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { UserTable } from "./UserTable";
import { SearchBar } from "./SearchBar";
import { Pagination } from "./Pagination";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingSpinner } from "./LoadingSpinner";

export function UserDashboard() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);

  const { data, loading, error, refetch } = useUsers({ search, sort, page });

  if (error) return <ErrorBanner message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <SearchBar value={search} onChange={setSearch} />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <UserTable users={data?.data || []} sort={sort} onSortChange={setSort} />
          <Pagination current={page} total={data?.pagination.totalPages || 1} onChange={setPage} />
        </>
      )}
    </div>
  );
}
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "code-reviewer-agent",
  "timestamp": "2026-04-08T12:00:00Z",
  "status": "success",
  "confidence": 0.93,
  "input_received": {
    "from_agent": null,
    "task_summary": "Review React UserDashboard component architecture",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "review",
    "data": {
      "total_issues": 8,
      "by_severity": {"high": 3, "medium": 3, "info": 2},
      "architecture_changes": [
        "Extracted useUsers custom hook (data fetching + state)",
        "Created useDebouncedValue hook (reusable utility)",
        "Added API service layer (userApi.ts)",
        "Split monolith into 5 focused components",
        "Added TypeScript interfaces for type safety"
      ],
      "before_metrics": {"lines": 300, "state_variables": 10, "components": 1},
      "after_metrics": {"lines": 150, "state_variables": 3, "components": 5, "hooks": 2},
      "refactored_code_provided": true
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["hooks/useUsers.ts", "hooks/useDebouncedValue.ts", "services/userApi.ts", "components/UserDashboard.tsx"]
  },
  "context_info": {
    "input_tokens": 800,
    "output_tokens": 3000,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 2500,
    "tokens_used": 3800,
    "retry_count": 0,
    "risk_level": "low",
    "approval_status": "not_required",
    "checkpoint_id": null
  }
}
```

## Standards Applied
- Single Responsibility Principle — each component/hook does one thing
- Custom hooks for data fetching logic (separation of concerns)
- API service layer for all HTTP calls
- Debounced search to reduce API calls
- Proper error/loading states in UI
- TypeScript interfaces for type safety
