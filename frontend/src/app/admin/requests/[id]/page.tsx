"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DynamicForm from "@/components/DynamicForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatusBadge from "@/components/ui/StatusBadge";
import { api } from "@/lib/api";
import type { DeploymentRequest, FormField, RequestStatus, RequestValueInput } from "@/lib/types";

const STATUSES: RequestStatus[] = ["pending", "approved", "rejected", "in_progress", "completed"];

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
  const [message, setMessage] = useState("");

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
    setMessage("");
    try {
      const updated = await api.updateRequest(id, {
        values,
        status,
        admin_notes: adminNotes,
      });
      setRequest(updated);
      setMessage("Changes saved successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
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
      <div className="animate-slide-up">
        <button onClick={() => router.push("/admin")} className="btn-ghost mb-4 -ml-2 text-sm">
          ← Back to requests
        </button>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Request detail</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Request #{request.id}</h1>
            <p className="mt-2 text-slate-600">
              Submitted by <span className="font-semibold text-slate-900">{request.submitter_name}</span>
              {" "}({request.submitter_email})
            </p>
            <p className="text-sm text-slate-500">
              {new Date(request.created_at).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="surface-card p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Admin controls</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="field-label">Status</label>
                  <select
                    id="status"
                    className="field-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RequestStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="notes" className="field-label">Internal notes</label>
                  <textarea
                    id="notes"
                    className="field-input min-h-[120px] resize-y"
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notes visible only to admins..."
                  />
                </div>
              </div>
            </div>

            <div className="surface-card p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Quick info</p>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Last updated</dt>
                  <dd className="text-right font-medium">{new Date(request.updated_at).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Fields</dt>
                  <dd className="font-medium">{request.values.length}</dd>
                </div>
              </dl>
            </div>
          </aside>

          <div className="surface-card p-6 sm:p-8">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Deployment request form</h2>
            <DynamicForm
              fields={fields}
              initialValues={request.values}
              onSubmit={handleFormSubmit}
              submitLabel={saving ? "Saving..." : "Save changes"}
            />
            {message && (
              <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                message.includes("success")
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
