"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";
import type { DeploymentRequest } from "@/lib/types";
import {
  Search,
  Eye,
} from "lucide-react";



export default function AdminPage() {
  const [requests, setRequests] = useState<DeploymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getRequests().then(setRequests).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      const appName = req.values.find((v) => v.field_name === "application_name")?.value ?? "";
      const haystack = `${req.submitter_name} ${req.submitter_email} ${appName}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [requests, search]);


  return (
    <ProtectedRoute adminOnly>
      <div className="animate-fade-in">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Admin Console</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Deployment Requests</h1>
          <p className="mt-1 text-sm text-gray-500">View deployment requests submitted by users.</p>
        </div>


        {!loading && requests.length > 0 && (
          <div className="mb-4 flex justify-end">
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
          <EmptyState title="No matching requests" description="Try adjusting your search criteria." />
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Submitter</th>
                    <th>Application</th>
                    <th>Submitted</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => {
                    const appName =
                      req.values.find((v) => v.field_name === "application_name")?.value ?? "—";
                    return (
                      <tr key={req.id} className="group">
                        <td className="font-semibold text-gray-900">#{req.id}</td>
                        <td>
                          <p className="font-medium text-gray-900">{req.submitter_name}</p>
                          <p className="text-xs text-gray-500">{req.submitter_email}</p>
                        </td>
                        <td className="font-medium">{appName}</td>
                        <td className="whitespace-nowrap text-gray-500">
                          {new Date(req.created_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td>
                          <button
                            onClick={() => (window.location.href = `/admin/requests/${req.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
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
