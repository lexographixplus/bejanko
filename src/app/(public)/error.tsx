"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone flex items-center justify-center mb-6">
        <AlertCircle className="w-7 h-7 text-mark" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink mb-2">
        Something went wrong
      </h1>
      <p className="text-soft text-sm max-w-sm mb-8">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
