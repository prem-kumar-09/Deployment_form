"use client";

import Link from "next/link";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-0px)] lg:grid lg:grid-cols-2">
      <div className="auth-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg font-bold ring-1 ring-white/20 backdrop-blur">
              DR
            </span>
            <span className="text-lg font-semibold">Deployment Request</span>
          </Link>
        </div>
        <div className="relative max-w-md animate-slide-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">Enterprise workflow</p>
          <h2 className="text-4xl font-bold leading-tight">Streamline your deployment requests</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            Submit, track, and manage application deployments with a dynamic form built for teams and administrators.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-300">✓</span>
              Dynamic form fields — no code changes needed
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-300">✓</span>
              Role-based access for users and admins
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-300">✓</span>
              Full request lifecycle tracking
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-slate-400">© {new Date().getFullYear()} Deployment Request Sheet</p>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-900">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white">DR</span>
              <span className="font-semibold">Deployment Request</span>
            </Link>
          </div>
          <div className="surface-card p-8 shadow-soft">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
            </div>
            {children}
            <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
