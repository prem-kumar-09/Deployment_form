"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import type { FormListItem } from "@/lib/types";
import {
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Inbox,
  Check,
  X,
  LayoutGrid,
} from "lucide-react";

export default function AdminFormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadForms = useCallback(() => {
    setLoading(true);
    api.getForms().then(setForms).finally(() => setLoading(false));
  }, []);

  useEffect(loadForms, [loadForms]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const form = await api.createForm({ title: newTitle, description: newDesc || undefined });
      setNewTitle("");
      setNewDesc("");
      setShowCreate(false);
      router.push(`/admin/forms/${form.id}/builder`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create form", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/f/${token}`;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard");
  };

  const handleToggleActive = async (form: FormListItem) => {
    try {
      await api.updateForm(form.id, { is_active: !form.is_active });
      loadForms();
      showToast(form.is_active ? "Form deactivated" : "Form activated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  const handleDelete = async (form: FormListItem) => {
    if (!confirm(`Delete "${form.title}"? This will also delete all submissions.`)) return;
    try {
      await api.deleteForm(form.id);
      loadForms();
      showToast("Form deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="animate-fade-in">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Admin Console</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">My Forms</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage your forms. Share links to collect responses.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            New Form
          </button>
        </div>

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

        {showCreate && (
          <div className="mb-6 surface-card p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Form</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="field-label">Form Title</label>
                <input
                  className="field-input"
                  placeholder="e.g. Deployment Request Sheet"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="field-label">Description (optional)</label>
                <textarea
                  className="field-input"
                  rows={2}
                  placeholder="Brief description of this form..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? "Creating..." : "Create & Open Builder"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowCreate(false); setNewTitle(""); setNewDesc(""); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <LoadingSpinner label="Loading forms..." />
        ) : forms.length === 0 && !showCreate ? (
          <EmptyState
            title="No forms yet"
            description="Create your first form to start collecting responses."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className={`surface-card group relative overflow-hidden transition-all hover:shadow-card ${
                  !form.is_active ? "opacity-60" : ""
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-gray-900">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="mt-1 truncate text-sm text-gray-500">{form.description}</p>
                      )}
                    </div>
                    <span
                      className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        form.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {form.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {form.field_count} fields
                    </span>
                    <span className="flex items-center gap-1">
                      <Inbox className="h-3.5 w-3.5" />
                      {form.submission_count} submissions
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] text-gray-400">
                    Created {new Date(form.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/admin/forms/${form.id}/builder`)}
                    className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-brand-600 transition hover:bg-brand-50"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Builder
                  </button>
                  <button
                    onClick={() => router.push(`/admin/forms/${form.id}/submissions`)}
                    className="flex flex-1 items-center justify-center gap-1.5 border-l border-gray-100 px-3 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    <Inbox className="h-3.5 w-3.5" />
                    Submissions
                  </button>
                  <button
                    onClick={() => handleCopyLink(form.share_token)}
                    className="flex flex-1 items-center justify-center gap-1.5 border-l border-gray-100 px-3 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                    title="Copy shareable link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Link
                  </button>
                  <div className="relative border-l border-gray-100">
                    <button
                      onClick={() => handleToggleActive(form)}
                      className="flex items-center justify-center px-3 py-2.5 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
                      title={form.is_active ? "Deactivate" : "Activate"}
                    >
                      {form.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="border-l border-gray-100">
                    <button
                      onClick={() => handleDelete(form)}
                      className="flex items-center justify-center px-3 py-2.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete form"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
