"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import type { Form, Submission, SubmissionStatus } from "@/lib/types";
import {
  ArrowLeft,
  Search,
  Eye,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  FileCheck2,
  ChevronDown,
} from "lucide-react";

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Loader2 },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-700", icon: FileCheck2 },
};

export default function SubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = Number(params.formId);

  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Submission | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [f, subs] = await Promise.all([
        api.getForm(formId),
        api.getSubmissions(formId),
      ]);
      setForm(f);
      setSubmissions(subs);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewDetail = async (sub: Submission) => {
    setSelectedId(sub.id);
    setDetail(sub);
  };

  const handleStatusChange = async (subId: number, status: SubmissionStatus) => {
    try {
      const updated = await api.updateSubmission(formId, subId, { status });
      setSubmissions((prev) => prev.map((s) => (s.id === subId ? updated : s)));
      if (detail?.id === subId) setDetail(updated);
      showToast(`Status updated to ${status}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  const handleNotesUpdate = async (subId: number, notes: string) => {
    try {
      const updated = await api.updateSubmission(formId, subId, { admin_notes: notes || null });
      setSubmissions((prev) => prev.map((s) => (s.id === subId ? updated : s)));
      if (detail?.id === subId) setDetail(updated);
      showToast("Notes saved");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", "error");
    }
  };

  const filtered = submissions.filter((sub) => {
    if (!search) return true;
    const haystack = `${sub.submitter_name ?? ""} ${sub.submitter_email ?? ""} ${sub.values.map((v) => v.value).join(" ")}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner label="Loading submissions..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="animate-fade-in">
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-elevated animate-slide-up ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {toast.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/forms/${formId}/builder`)}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Submissions</p>
            <h1 className="mt-0.5 truncate text-xl font-bold text-gray-900">
              {form?.title ?? "Form"} — Responses
            </h1>
            <p className="text-sm text-gray-500">{submissions.length} total submissions</p>
          </div>
        </div>

        {submissions.length > 0 && (
          <div className="mb-4 flex justify-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search submissions..."
                className="field-input max-w-xs pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Submissions List */}
          <div>
            {submissions.length === 0 ? (
              <EmptyState
                title="No submissions yet"
                description="Share the form link to start collecting responses."
              />
            ) : filtered.length === 0 ? (
              <EmptyState title="No matches" description="Try a different search term." />
            ) : (
              <div className="surface-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Submitter</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th className="w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((sub) => {
                        const sc = STATUS_CONFIG[sub.status];
                        const StatusIcon = sc.icon;
                        return (
                          <tr
                            key={sub.id}
                            className={`cursor-pointer ${selectedId === sub.id ? "bg-brand-50/50" : ""}`}
                            onClick={() => handleViewDetail(sub)}
                          >
                            <td className="font-semibold text-gray-900">#{sub.id}</td>
                            <td>
                              <p className="font-medium text-gray-900">
                                {sub.submitter_name || "Anonymous"}
                              </p>
                              {sub.submitter_email && (
                                <p className="text-xs text-gray-500">{sub.submitter_email}</p>
                              )}
                            </td>
                            <td>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${sc.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {sc.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap text-gray-500 text-xs">
                              {new Date(sub.created_at).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </td>
                            <td>
                              <Eye className="h-4 w-4 text-gray-400" />
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

          {/* Detail Panel */}
          <div className="hidden lg:block">
            {detail ? (
              <SubmissionDetail
                submission={detail}
                onStatusChange={(s) => handleStatusChange(detail.id, s)}
                onNotesUpdate={(n) => handleNotesUpdate(detail.id, n)}
              />
            ) : (
              <div className="surface-card p-6 text-center text-sm text-gray-400">
                Click a submission to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function SubmissionDetail({
  submission,
  onStatusChange,
  onNotesUpdate,
}: {
  submission: Submission;
  onStatusChange: (status: SubmissionStatus) => void;
  onNotesUpdate: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(submission.admin_notes ?? "");
  const sc = STATUS_CONFIG[submission.status];

  useEffect(() => {
    setNotes(submission.admin_notes ?? "");
  }, [submission.id, submission.admin_notes]);

  return (
    <div className="sticky top-6 surface-card overflow-hidden animate-fade-in">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Submission #{submission.id}</h3>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${sc.color}`}>
            {sc.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {new Date(submission.created_at).toLocaleString()}
        </p>
      </div>

      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Field values */}
        <div className="divide-y divide-gray-100 px-5">
          {submission.values.map((v) => (
            <div key={v.field_id} className="py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                {v.field_label}
              </p>
              <p className="mt-0.5 text-sm text-gray-900">
                {v.value || <span className="text-gray-300">—</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Status change */}
        <div className="border-t border-gray-100 px-5 py-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Update Status
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STATUS_CONFIG) as SubmissionStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                    submission.status === s
                      ? cfg.color + " ring-2 ring-offset-1"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin notes */}
        <div className="border-t border-gray-100 px-5 py-4">
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Admin Notes
          </label>
          <textarea
            className="field-input text-sm"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes..."
          />
          {notes !== (submission.admin_notes ?? "") && (
            <button
              onClick={() => onNotesUpdate(notes)}
              className="mt-2 btn-primary text-xs py-1.5 px-3"
            >
              Save Notes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
