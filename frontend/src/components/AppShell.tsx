"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

const AUTH_PATHS = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="page-shell">{children}</main>
    </>
  );
}
