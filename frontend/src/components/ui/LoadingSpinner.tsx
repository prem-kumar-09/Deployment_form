"use client";

export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-orange-200 border-t-orange-500" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
