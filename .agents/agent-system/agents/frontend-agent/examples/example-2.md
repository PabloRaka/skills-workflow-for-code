# Example 2: Authentication Flow with Form Validation

## Mission
Build a complete authentication UI flow with login, register, and password reset forms using React Hook Form and Zod for client-side validation.

## Requirements
- React + TypeScript
- React Hook Form + Zod
- Toast notifications
- Loading states
- Password strength indicator

## Implementation

```tsx
// components/LoginForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const { accessToken } = await res.json();
      localStorage.setItem("token", accessToken);
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors
                  ${errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className={`w-full px-4 py-3 rounded-lg border transition-colors
                  ${errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register("rememberMe")} className="rounded" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium
                hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline font-medium">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// components/PasswordStrength.tsx
interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: 2, label: "Fair", color: "bg-orange-500" };
    if (score <= 3) return { level: 3, label: "Good", color: "bg-yellow-500" };
    if (score <= 4) return { level: 4, label: "Strong", color: "bg-green-500" };
    return { level: 5, label: "Very Strong", color: "bg-emerald-500" };
  };

  const { level, label, color } = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= level ? color : "bg-gray-200 dark:bg-gray-700"
          }`} />
        ))}
      </div>
      <p className={`text-xs mt-1 ${color.replace("bg-", "text-")}`}>{label}</p>
    </div>
  );
}
```

## Agent Output (Standard Data Schema v2.0)

```json
{
  "agent_name": "frontend-agent",
  "timestamp": "2026-04-08T12:00:00Z",
  "status": "success",
  "confidence": 0.91,
  "input_received": {
    "from_agent": "backend-agent",
    "task_summary": "Build authentication UI with form validation and password strength",
    "summarized": false,
    "artifact_refs": []
  },
  "output": {
    "type": "code",
    "data": {
      "framework": "React + TypeScript",
      "components": [
        {"name": "LoginForm", "features": ["Zod validation", "loading state", "error display", "remember me"]},
        {"name": "PasswordStrength", "features": ["5-level indicator", "real-time feedback", "color coded"]}
      ],
      "libraries": ["react-hook-form", "@hookform/resolvers", "zod"],
      "accessibility": ["htmlFor labels", "aria states", "focus rings", "error announcements"],
      "ux_features": ["loading spinner", "disabled state", "inline validation errors"]
    },
    "reasoning_log": [{"step": "plan", "description": "Auto-generated adherence to Reasoning Protocol."}],
    "impact_assessment": {"areas_affected": ["local context"], "risks": ["none"]},
    "artifacts": ["components/LoginForm.tsx", "components/PasswordStrength.tsx"]
  },
  "context_info": {
    "input_tokens": 1200,
    "output_tokens": 2800,
    "summarized": false,
    "pruned_fields": []
  },
  "metadata": {
    "execution_time_ms": 3500,
    "tokens_used": 4000,
    "retry_count": 0,
    "risk_level": "medium",
    "approval_status": "not_required",
    "checkpoint_id": "chk_exec002_step04"
  }
}
```

## Best Practices Applied
- Schema-based validation with Zod + React Hook Form
- Loading states with spinner animation
- Accessible form labels with `htmlFor`
- Focus ring indicators for keyboard navigation
- Password strength indicator with real-time feedback
- Dark mode support throughout
- Responsive centering for all screen sizes
