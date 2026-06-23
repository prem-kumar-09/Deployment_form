"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatusBadge from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { DeploymentRequest, RequestStatus } from "@/lib/types";
import {
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  CircleCheck,
  FileText,
  Inbox,
} from "lucide-react";

const FILTERS: { key: RequestStatus | "all"; label: string; icon: typeof Clock }[] = [
  { key: "all", label: "All", icon: Inbox },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "in_progress", label: "In Progress", icon: Loader2 },
  { key: "approved", label: "Approved", icon: CheckCircle2 },
  { key: "completed", label: "Completed", icon: CircleCheck },
  { key: "rejected", label: "Rejected", icon: XCircle },
];

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

export default function AdminPage() {
  const [requests, setRequests] = useState<DeploymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getRequests().then(setRequests).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      const matchesFilter = filter === "all" || req.status === filter;
      const appName = req.values.find((v) => v.field_name === "application_name")?.value ?? "";
      const haystack = `${req.submitter_name} ${req.submitter_email} ${appName}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [requests, filter, search]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      in_progress: requests.filter((r) => r.status === "in_progress").length,
      completed: requests.filter((r) => r.status === "completed" || r.status === "approved").length,
    }),
    [requests]
  );

  const getCount = (key: RequestStatus | "all") => {
    if (key === "all") return requests.length;
    return requests.filter((r) => r.status === key).length;
  };

  return (
    <ProtectedRoute adminOnly>
      <div className="animate-fade-in">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Admin Console</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Deployment Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Review submissions, update status, and manage deployment requests.</p>
        </div>

        {!loading && requests.length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Requests" value={stats.total} icon={FileText} color="bg-brand-50 text-brand-600" />
            <StatCard label="Pending Review" value={stats.pending} icon={Clock} color="bg-amber-50 text-amber-600" />
            <StatCard label="In Progress" value={stats.in_progress} icon={Loader2} color="bg-blue-50 text-blue-600" />
            <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const count = getCount(f.key);
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      filter === f.key
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {f.label}
                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          filter === f.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, email, app..."
                className="field-input max-w-xs pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner label="Loading requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="When users submit deployment requests, they will appear here for review."
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="No matching requests" description="Try adjusting your search or filter criteria." />
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Submitter</th>
                    <th>Application</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => {
                    const appName =
                      req.values.find((v) => v.field_name === "application_name")?.value ?? "—";
                    return (
                      <tr key={req.id} className="group cursor-pointer" onClick={() => (window.location.href = `/admin/requests/${req.id}`)}>
                        <td className="font-semibold text-gray-900">#{req.id}</td>
                        <td>
                          <p className="font-medium text-gray-900">{req.submitter_name}</p>
                          <p className="text-xs text-gray-500">{req.submitter_email}</p>
                        </td>
                        <td className="font-medium">{appName}</td>
                        <td>
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="whitespace-nowrap text-gray-500">
                          {new Date(req.created_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td>
                          <ChevronRight className="h-4 w-4 text-gray-300 transition group-hover:text-brand-600" />
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
