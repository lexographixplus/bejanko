"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? "confirm-desc" : undefined}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm rounded-xl border border-rule bg-surface shadow-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            {variant === "danger" && (
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3
                id="confirm-title"
                className="font-display font-semibold text-ink text-base"
              >
                {title}
              </h3>
              {description && (
                <p id="confirm-desc" className="mt-1 text-sm text-soft">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              ref={cancelRef}
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-rule text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors",
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-mark hover:bg-mark-hover"
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
