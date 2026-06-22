"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else router.replace(user.role === "admin" ? "/admin" : "/dashboard");
  }, [user, loading, router]);

  return <LoadingSpinner label="Redirecting..." />;
}
