"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatusBadge from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { DeploymentRequest } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { PlusCircle, FileText, Clock, CheckCircle2, ChevronRight } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Clock;
  color: string;
}) {
  return (
    <div className="surface-card flex items-center gap-4 px-5 py-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeploymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRequests().then(setRequests).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      completed: requests.filter((r) => r.status === "completed" || r.status === "approved").length,
    }),
    [requests]
  );

  return (
    <ProtectedRoute>
      <div className="animate-fade-in">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Dashboard</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0] ?? "there"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Track your deployment requests and submit new ones.</p>
          </div>
          <Link href="/submit" className="btn-primary">
            <PlusCircle className="h-4 w-4" />
            New Request
          </Link>
        </div>

        {!loading && requests.length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="Total Requests" value={stats.total} icon={FileText} color="bg-brand-50 text-brand-600" />
            <StatCard label="Pending" value={stats.pending} icon={Clock} color="bg-amber-50 text-amber-600" />
            <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
          </div>
        )}

        {loading ? (
          <LoadingSpinner label="Loading your requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="You haven't submitted any deployment requests. Create your first one to get started."
            action={
              <Link href="/submit" className="btn-primary">
                <PlusCircle className="h-4 w-4" />
                Submit first request
              </Link>
            }
          />
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
              <FileText className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Recent submissions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Application</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => {
                    const appName = req.values.find((v) => v.field_name === "application_name")?.value ?? "—";
                    return (
                      <tr key={req.id} className="group">
                        <td className="font-semibold text-gray-900">#{req.id}</td>
                        <td className="font-medium">{appName}</td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="text-gray-500">
                          {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </td>
                        <td>
                          <ChevronRight className="h-4 w-4 text-gray-300" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
