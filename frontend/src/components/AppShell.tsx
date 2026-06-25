"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/components/AuthProvider";

const BARE_PATHS = ["/login", "/f/"];

function isBuilderPath(pathname: string) {
  return /\/admin\/forms\/\d+\/builder/.test(pathname);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isBare = BARE_PATHS.some((p) =>
    p.endsWith("/") ? pathname.startsWith(p) : pathname === p
  );

  if (isBare) {
    return <>{children}</>;
  }

  if (user && pathname.startsWith("/admin")) {
    const isBuilder = isBuilderPath(pathname);
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="ml-[260px] flex-1 transition-all duration-300">
          {isBuilder ? (
            <div className="h-screen overflow-hidden">{children}</div>
          ) : (
            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">{children}</div>
          )}
        </main>
      </div>
    );
  }

  return (
    <main className="page-shell">{children}</main>
  );
}
