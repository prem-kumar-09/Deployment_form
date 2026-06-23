"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api";
import type { DeploymentRequest } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { PlusCircle, FileText, Eye } from "lucide-react";


export default function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeploymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRequests().then(setRequests).finally(() => setLoading(false));
  }, []);


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
                    <th>Submitted</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => {
                    const appName = req.values.find((v) => v.field_name === "application_name")?.value ?? "—";
                    return (
                      <tr key={req.id} className="group">
                        <td className="font-semibold text-gray-900">#{req.id}</td>
                        <td className="font-medium">{appName}</td>
                        <td className="text-gray-500">
                          {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </td>
                        <td>
                          <button
                            onClick={() => (window.location.href = `/dashboard/requests/${req.id}`)}
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
