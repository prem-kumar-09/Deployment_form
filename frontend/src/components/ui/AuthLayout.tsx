"use client";

import Link from "next/link";
import { Shield, Zap, BarChart3 } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="auth-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-base font-bold ring-1 ring-white/20 backdrop-blur">
              DR
            </span>
            <span className="text-lg font-semibold">Deployment Request</span>
          </Link>
        </div>
        <div className="relative max-w-md animate-slide-up">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">Enterprise Workflow</p>
          <h2 className="text-3xl font-bold leading-tight">Streamline your deployment requests</h2>
          <p className="mt-3 text-sm leading-relaxed text-indigo-200">
            Submit, track, and manage application deployments with a configurable form built for teams and administrators.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Settings className="h-4 w-4 text-brand-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Configurable Forms</p>
                <p className="text-xs text-indigo-300">Admin-managed fields without code changes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Shield className="h-4 w-4 text-brand-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Role-based Access</p>
                <p className="text-xs text-indigo-300">Separate views for users and administrators</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <BarChart3 className="h-4 w-4 text-brand-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Request Tracking</p>
                <p className="text-xs text-indigo-300">Full lifecycle visibility for all submissions</p>
              </div>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-indigo-400">&copy; {new Date().getFullYear()} Deployment Request Sheet</p>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">DR</span>
              <span className="font-semibold">Deployment Request</span>
            </Link>
          </div>
          <div className="surface-card p-8">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            </div>
            {children}
            <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings({ className }: { className?: string }) {
  return <Zap className={className} />;
}
