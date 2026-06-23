"use client";

export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 animate-fade-in">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-brand-600" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
