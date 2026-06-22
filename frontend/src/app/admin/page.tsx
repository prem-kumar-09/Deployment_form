"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { DeploymentRequest, RequestStatus } from "@/lib/types";

const FILTERS: (RequestStatus | "all")[] = ["all", "pending", "in_progress", "approved", "completed", "rejected"];

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

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
  }), [requests]);

  return (
    <ProtectedRoute adminOnly>
      <PageHeader
        eyebrow="Admin Console"
        title="Deployment Requests"
        description="Review submissions, update status, and edit request details."
        action={
          <Link href="/admin/fields" className="btn-secondary">
            Manage form fields
          </Link>
        }
      />

      {!loading && requests.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === f
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.replace("_", " ")}
                {f === "all" && counts.all > 0 && ` (${counts.all})`}
                {f === "pending" && counts.pending > 0 && ` (${counts.pending})`}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search by name, email, app..."
            className="field-input max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        <EmptyState title="No matching requests" description="Try adjusting your search or filter." />
      ) : (
        <div className="surface-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Submitter</th>
                  <th>Application</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => {
                  const appName = req.values.find((v) => v.field_name === "application_name")?.value ?? "—";
                  return (
                    <tr key={req.id}>
                      <td className="font-semibold text-slate-900">#{req.id}</td>
                      <td>
                        <p className="font-medium text-slate-900">{req.submitter_name}</p>
                        <p className="text-xs text-slate-500">{req.submitter_email}</p>
                      </td>
                      <td>{appName}</td>
                      <td><StatusBadge status={req.status} /></td>
                      <td className="whitespace-nowrap text-slate-500">
                        {new Date(req.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td>
                        <Link
                          href={`/admin/requests/${req.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                          Open
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </Link>
                      </td>
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
