"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const links = isAdmin
    ? [
        { href: "/admin", label: "Requests" },
        { href: "/admin/fields", label: "Form Builder" },
      ]
    : [
        { href: "/dashboard", label: "My Requests" },
        { href: "/submit", label: "New Request" },
      ];

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          className="group flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white shadow-glow transition group-hover:scale-105">
            DR
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900">Deployment Request</p>
            <p className="text-xs text-slate-500">{isAdmin ? "Admin Console" : "User Portal"}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href || pathname.startsWith(link.href + "/") ? "nav-link-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {initials}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs capitalize text-slate-500">{user.role}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-secondary px-3 py-2 text-xs sm:text-sm">
            Sign out
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
              pathname === link.href ? "bg-orange-50 text-orange-700" : "text-slate-600"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
