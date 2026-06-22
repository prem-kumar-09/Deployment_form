"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { DeploymentRequest } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="surface-card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
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

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    completed: requests.filter((r) => r.status === "completed" || r.status === "approved").length,
  }), [requests]);

  return (
    <ProtectedRoute>
      <PageHeader
        eyebrow="User Portal"
        title={`Hello, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Track your deployment requests and submit new ones when you're ready."
        action={
          <Link href="/submit" className="btn-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Request
          </Link>
        }
      />

      {!loading && requests.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Requests" value={stats.total} accent="text-slate-900" />
          <StatCard label="Pending" value={stats.pending} accent="text-amber-600" />
          <StatCard label="Completed" value={stats.completed} accent="text-emerald-600" />
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading your requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          description="You haven't submitted any deployment requests. Create your first one to get started."
          action={<Link href="/submit" className="btn-primary">Submit first request</Link>}
        />
      ) : (
        <div className="surface-card overflow-hidden animate-fade-in">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Recent submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Application</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const appName = req.values.find((v) => v.field_name === "application_name")?.value ?? "—";
                  return (
                    <tr key={req.id}>
                      <td className="font-semibold text-slate-900">#{req.id}</td>
                      <td>{appName}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td className="text-slate-500">{new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
