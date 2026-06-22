"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import AuthLayout from "@/components/ui/AuthLayout";
import type { UserRole } from "@/lib/types";

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "user", label: "User", description: "Submit and track your deployment requests" },
  { value: "admin", label: "Admin", description: "Review, edit, and manage all requests" },
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
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="field-label">Full name</label>
          <input id="name" className="field-input" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email address</label>
          <input id="email" type="email" className="field-input" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
          <legend className="field-label mb-3">Select your role</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  role === r.value
                    ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
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
                <p className="font-semibold text-slate-900">{r.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{r.description}</p>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
