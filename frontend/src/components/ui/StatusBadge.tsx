"use client";

import type { RequestStatus } from "@/lib/types";

const styles: Record<RequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
  in_progress: "bg-sky-50 text-sky-700 ring-sky-600/20",
  completed: "bg-slate-100 text-slate-700 ring-slate-600/10",
};

export default function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}
