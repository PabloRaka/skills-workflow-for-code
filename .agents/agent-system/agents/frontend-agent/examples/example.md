# Example 1: SaaS Analytics Dashboard (Production-Ready)

## Mission
Build a production-ready SaaS analytics dashboard with authentication UI, sidebar navigation, data charts, dark mode, and responsive design.

## Requirements
- React + TypeScript
- TailwindCSS
- Recharts for data visualization
- React Router for navigation
- Dark mode with system preference detection

## Implementation

```tsx
// components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, Users, Settings, LogOut
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`h-screen bg-gray-900 text-gray-300 transition-all duration-300 
        ${collapsed ? "w-16" : "w-64"} flex flex-col`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!collapsed && <span className="text-xl font-bold text-white">SaaSApp</span>}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          ☰
        </button>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors
               ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-800 hover:text-white"}`
            }
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button className="flex items-center gap-3 px-4 py-3 mx-2 mb-4 rounded-lg hover:bg-red-600/20 text-red-400 transition-colors">
        <LogOut size={20} />
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );
}
```

```tsx
// components/ChartCard.tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ChartCardProps {
  title: string;
  value: string;
  change: number;
  data: Array<{ name: string; value: number }>;
  color: string;
}

export function ChartCard({ title, value, change, data, color }: ChartCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
        </div>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isPositive ? "+" : ""}{change}%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#gradient-${color})`} strokeWidth={2} />
          <Tooltip />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

```tsx
// pages/Dashboard.tsx
import { Sidebar } from "../components/Sidebar";
import { ChartCard } from "../components/ChartCard";
import { useState } from "react";

const revenueData = [
  { name: "Mon", value: 4200 }, { name: "Tue", value: 5100 },
  { name: "Wed", value: 4800 }, { name: "Thu", value: 6200 },
  { name: "Fri", value: 5900 }, { name: "Sat", value: 7100 },
  { name: "Sun", value: 6500 }
];

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's your overview.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ChartCard title="Revenue" value="$42,500" change={12.5} data={revenueData} color="#3B82F6" />
          <ChartCard title="Customers" value="1,245" change={8.2} data={revenueData} color="#10B981" />
          <ChartCard title="Orders" value="892" change={-2.4} data={revenueData} color="#F59E0B" />
          <ChartCard title="Conversion" value="3.6%" change={0.8} data={revenueData} color="#8B5CF6" />
        </div>
      </main>
    </div>
  );
}
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "frontend-agent",
  "timestamp": "2026-04-08T10:00:00Z",
  "status": "success",
  "confidence": 0.92,
  "input_received": {
    "from_agent": "backend-agent",
    "task_summary": "Build SaaS analytics dashboard with auth, charts, and dark mode",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "code",
    "data": {
      "framework": "React + TypeScript",
      "styling": "TailwindCSS",
      "components": [
        {"name": "Sidebar", "type": "navigation", "features": ["collapsible", "active state", "responsive"]},
        {"name": "ChartCard", "type": "data-display", "features": ["area chart", "trend indicator", "gradient fill"]},
        {"name": "Dashboard", "type": "page", "features": ["grid layout", "responsive breakpoints"]}
      ],
      "responsive_breakpoints": ["mobile (1 col)", "tablet (2 col)", "desktop (4 col)"],
      "accessibility": ["aria-label on navigation", "aria-label on toggle", "role=navigation"],
      "dark_mode": "class-based with system preference detection"
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["components/Sidebar.tsx", "components/ChartCard.tsx", "pages/Dashboard.tsx"]
  },
  "context_info": {
    "input_tokens": 1500,
    "output_tokens": 3200,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 4200,
    "tokens_used": 4700,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": "chk_exec001_step05"
  }
}
```

## Best Practices Applied
- Component-based architecture with TypeScript props
- Collapsible sidebar with smooth CSS transitions
- ARIA labels for accessibility
- Responsive grid (1→2→4 columns)
- Dark mode support via class strategy
- Reusable ChartCard with dynamic color gradients
- Mobile-first responsive design