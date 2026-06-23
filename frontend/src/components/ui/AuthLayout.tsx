"use client";

import Link from "next/link";
import { Shield, Zap, BarChart3 } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="auth-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-base font-bold ring-1 ring-white/20 backdrop-blur">
              FB
            </span>
            <span className="text-lg font-semibold">Form Builder</span>
          </Link>
        </div>
        <div className="relative max-w-md animate-slide-up">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-200">Form Builder Platform</p>
          <h2 className="text-3xl font-bold leading-tight">Build forms, share links, collect responses</h2>
          <p className="mt-3 text-sm leading-relaxed text-indigo-200">
            Create beautiful, themed forms with a drag-and-drop builder. Share public links and collect anonymous submissions.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <SettingsIcon className="h-4 w-4 text-brand-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Drag & Drop Builder</p>
                <p className="text-xs text-indigo-300">Build forms visually with live preview</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Shield className="h-4 w-4 text-brand-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Full Theme Control</p>
                <p className="text-xs text-indigo-300">Colors, fonts, backgrounds — make it yours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <BarChart3 className="h-4 w-4 text-brand-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Shareable Links</p>
                <p className="text-xs text-indigo-300">Generate public links for anonymous submissions</p>
              </div>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-indigo-400">&copy; {new Date().getFullYear()} Form Builder</p>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">FB</span>
              <span className="font-semibold">Form Builder</span>
            </Link>
          </div>
          <div className="surface-card p-8">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return <Zap className={className} />;
}
