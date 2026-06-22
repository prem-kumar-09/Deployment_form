"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/components/AuthProvider";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (adminOnly && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, loading, adminOnly, router]);

  if (loading || !user || (adminOnly && user.role !== "admin")) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
