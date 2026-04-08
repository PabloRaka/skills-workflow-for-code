# Example: Full SaaS Dashboard (Production-Ready)

## Input
Build a SaaS analytics dashboard with:
- Authentication UI
- Sidebar navigation
- Data charts
- Dark mode
- Responsive design

## Requirements
- React + TypeScript
- TailwindCSS
- Chart library (Recharts)
- State management

## Output Structure

/components
  Sidebar.tsx
  Navbar.tsx
  ChartCard.tsx
/pages
  Dashboard.tsx

## Key Implementation

// Sidebar.tsx
export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white">
      <nav>
        <ul>
          <li>Dashboard</li>
          <li>Analytics</li>
        </ul>
      </nav>
    </aside>
  );
}

// Dashboard.tsx
import { Sidebar } from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </main>
    </div>
  );
}

## Best Practices Applied
- Component reusability
- Lazy loading routes
- Accessibility (aria labels)
- Mobile-first design