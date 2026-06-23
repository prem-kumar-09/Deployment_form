"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DynamicForm from "@/components/DynamicForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatusBadge from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { DeploymentRequest, FormField, RequestStatus, RequestValueInput } from "@/lib/types";
import {
  ArrowLeft,
  User,
  Calendar,
  Hash,
  Clock,
  Save,
  Check,
  AlertCircle,
  FileText,
  MessageSquare,
} from "lucide-react";

const STATUSES: { value: RequestStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "text-amber-600" },
  { value: "approved", label: "Approved", color: "text-emerald-600" },
  { value: "rejected", label: "Rejected", color: "text-red-600" },
  { value: "in_progress", label: "In Progress", color: "text-blue-600" },
  { value: "completed", label: "Completed", color: "text-gray-600" },
];

export default function AdminRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [request, setRequest] = useState<DeploymentRequest | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [status, setStatus] = useState<RequestStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    Promise.all([api.getRequest(id), api.getFormFields()])
      .then(([req, allFields]) => {
        setRequest(req);
        setStatus(req.status);
        setAdminNotes(req.admin_notes ?? "");
        setFields(allFields.filter((f) => f.is_active || req.values.some((v) => v.field_id === f.id)));
      })
      .catch(() => router.push("/admin"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleFormSubmit = async (values: RequestValueInput[]) => {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api.updateRequest(id, {
        values,
        status,
        admin_notes: adminNotes,
      });
      setRequest(updated);
      setMessage({ text: "Changes saved successfully.", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Update failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !request) {
    return (
      <ProtectedRoute adminOnly>
        <LoadingSpinner label="Loading request details..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="animate-fade-in">
        <button
          onClick={() => router.push("/admin")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to requests
        </button>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Request #{request.id}</h1>
              <StatusBadge status={request.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {request.submitter_name}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(request.created_at).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium animate-fade-in ${
              message.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
              <FileText className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Deployment Request Form</h2>
            </div>
            <div className="p-6">
              <DynamicForm
                fields={fields}
                initialValues={request.values}
                onSubmit={handleFormSubmit}
                submitLabel={saving ? "Saving..." : "Save changes"}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="surface-card overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-gray-900">Admin Controls</h2>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <label htmlFor="status" className="field-label">Status</label>
                  <select
                    id="status"
                    className="field-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RequestStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="notes" className="field-label">
                    <MessageSquare className="mr-1 inline h-3.5 w-3.5" />
                    Internal Notes
                  </label>
                  <textarea
                    id="notes"
                    className="field-input min-h-[100px] resize-y"
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notes visible only to admins..."
                  />
                </div>
              </div>
            </div>

            <div className="surface-card overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-gray-900">Details</h2>
              </div>
              <div className="p-5">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <Hash className="h-3.5 w-3.5" />
                      Request ID
                    </dt>
                    <dd className="font-medium text-gray-900">#{request.id}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <User className="h-3.5 w-3.5" />
                      Submitter
                    </dt>
                    <dd className="font-medium text-gray-900">{request.submitter_name}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      Last updated
                    </dt>
                    <dd className="font-medium text-gray-900">
                      {new Date(request.updated_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1.5 text-gray-500">
                      <FileText className="h-3.5 w-3.5" />
                      Fields
                    </dt>
                    <dd className="font-medium text-gray-900">{request.values.length}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
