"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import UserSidebar from "@/components/UserSidebar";
import { useAuth } from "@/components/AuthProvider";

const AUTH_PATHS = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const isAdmin = user?.role === "admin";
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isAdmin && isAdminPage) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="ml-[260px] flex-1 transition-all duration-300">
          <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">{children}</div>
        </main>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen">
        <UserSidebar />
        <main className="ml-[260px] flex-1 transition-all duration-300">
          <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <main className="page-shell">{children}</main>
  );
}
