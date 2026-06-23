"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import AuthLayout from "@/components/ui/AuthLayout";
import type { UserRole } from "@/lib/types";
import { AlertCircle, UserPlus, User, Shield } from "lucide-react";

const ROLES: { value: UserRole; label: string; description: string; icon: typeof User }[] = [
  { value: "user", label: "User", description: "Submit and track deployment requests", icon: User },
  { value: "admin", label: "Admin", description: "Review, edit, and manage all requests", icon: Shield },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email.trim(), name.trim(), password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the deployment request platform"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <input
            id="name"
            className="field-input"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email address</label>
          <input
            id="email"
            type="email"
            className="field-input"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">Password</label>
          <input
            id="password"
            type="password"
            className="field-input"
            placeholder="Minimum 6 characters"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <fieldset>
          <legend className="field-label mb-2">Select your role</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition ${
                    role === r.value
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="sr-only"
                  />
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    role === r.value ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{r.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="h-4 w-4" />
              Create account
            </span>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
