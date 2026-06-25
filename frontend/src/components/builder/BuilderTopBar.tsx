"use client";

import Link from "next/link";
import type { Form } from "@/lib/types";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Palette,
  Eye,
  BarChart3,
  ChevronDown,
  Send,
} from "lucide-react";
import { useState } from "react";

interface BuilderTopBarProps {
  form: Form;
  styleOpen: boolean;
  onToggleStyle: () => void;
  linkCopied: boolean;
  onCopyLink: () => void;
  savedLabel?: string;
}

export default function BuilderTopBar({
  form,
  styleOpen,
  onToggleStyle,
  linkCopied,
  onCopyLink,
  savedLabel = "Saved",
}: BuilderTopBarProps) {
  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/f/${form.share_token}`
      : `/f/${form.share_token}`;

  return (
    <header className="relative z-30 shrink-0 border-b border-[#edebe9] bg-white">
      <div className="flex h-[52px] items-center gap-2 px-4">
        <Link
          href="/admin"
          className="rounded p-1.5 text-[#605e5c] transition hover:bg-[#f3f2f1]"
          title="Back to forms"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="mx-1 h-6 w-px bg-[#edebe9]" />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="truncate text-sm font-semibold text-[#323130]">{form.title}</h1>
          <span className="hidden shrink-0 text-xs text-[#a19f9d] sm:inline">· {savedLabel}</span>
          <ChevronDown className="hidden h-3.5 w-3.5 shrink-0 text-[#a19f9d] sm:block" />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleStyle}
            className={`flex items-center gap-1.5 rounded px-3 py-2 text-xs font-medium transition ${
              styleOpen
                ? "bg-[#edebe9] text-[#323130]"
                : "text-[#605e5c] hover:bg-[#f3f2f1]"
            }`}
            title="Style"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Style</span>
          </button>

          <a
            href={`/f/${form.share_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded px-3 py-2 text-xs font-medium text-[#605e5c] transition hover:bg-[#f3f2f1]"
            title="Preview"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </a>

          <Link
            href={`/admin/forms/${form.id}/submissions`}
            className="relative flex items-center gap-1.5 rounded px-3 py-2 text-xs font-medium text-[#605e5c] transition hover:bg-[#f3f2f1]"
            title="View responses"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">View responses</span>
            {form.submission_count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d13438] px-1 text-[9px] font-bold text-white">
                {form.submission_count}
              </span>
            )}
          </Link>

          <div className="relative ml-1">
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="flex items-center gap-1.5 rounded bg-[#323130] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#201f1e]"
            >
              <Send className="h-3.5 w-3.5" />
              Collect responses
            </button>

            {shareOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShareOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-[#edebe9] bg-white p-4 shadow-xl">
                  <p className="text-sm font-semibold text-[#323130]">Share link</p>
                  <p className="mt-1 text-xs text-[#605e5c]">Anyone with the link can respond.</p>
                  <div className="mt-3 flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      className="field-input flex-1 py-1.5 font-mono text-[11px]"
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => {
                        onCopyLink();
                        setShareOpen(false);
                      }}
                      className={`shrink-0 rounded px-3 py-1.5 text-xs font-medium ${
                        linkCopied
                          ? "bg-[#dff6dd] text-[#107c10]"
                          : "bg-[#0078d4] text-white hover:bg-[#106ebe]"
                      }`}
                    >
                      {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <a
                    href={`/f/${form.share_token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-[#0078d4] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in new tab
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
