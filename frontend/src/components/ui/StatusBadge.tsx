"use client";

import { Clock, CheckCircle2, XCircle, Loader2, CircleCheck } from "lucide-react";
import type { SubmissionStatus } from "@/lib/types";

const config: Record<SubmissionStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-200", icon: Clock },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 ring-red-200", icon: XCircle },
  in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-700 ring-blue-200", icon: Loader2 },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-700 ring-gray-200", icon: CircleCheck },
};

export default function StatusBadge({ status }: { status: SubmissionStatus }) {
  const { label, className, icon: Icon } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
