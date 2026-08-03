"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { cn, wordCount } from "@/lib/utils";
import { FileUpload } from "@/components/shared/file-upload";

interface ContestEntryFormProps {
  slug: string;
  uploadMode: "TEXT" | "OPTIONAL" | "REQUIRED";
  wordMin?: number | null;
  wordMax?: number | null;
  wordGuidance?: string | null;
}

export function ContestEntryForm({
  slug,
  uploadMode,
  wordMin,
  wordMax,
  wordGuidance,
}: ContestEntryFormProps) {
  const [title, setTitle] = useState("");
  const [entrantName, setEntrantName] = useState("");
  const [entrantEmail, setEntrantEmail] = useState("");
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [file, setFile] = useState<{ url: string; name: string } | null>(null);

  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const words = wordCount(content);
  const tooShort = wordMin != null && words < wordMin;
  const tooLong = wordMax != null && words > wordMax;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (uploadMode === "REQUIRED" && !file) {
      setError("This contest requires a file upload.");
      return;
    }
    if (tooShort) {
      setError(`Your entry must be at least ${wordMin} words.`);
      return;
    }
    if (tooLong) {
      setError(`Your entry must be at most ${wordMax} words.`);
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/contests/${slug}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          entrantName,
          entrantEmail,
          website,
          ...(file ? { fileUrl: file.url, fileName: file.name } : {}),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong");

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-rule bg-surface p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-ink mb-2">
          Entry received
        </h3>
        <p className="text-soft text-sm max-w-sm mx-auto leading-relaxed">
          We&apos;ve emailed you a receipt. Entries are reviewed before they appear
          publicly — you&apos;ll hear from us when voting opens.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-rule bg-surface text-ink placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="entrantName" className="block text-sm font-medium text-ink mb-2">
            Your name
          </label>
          <input
            id="entrantName"
            required
            maxLength={120}
            value={entrantName}
            onChange={(e) => setEntrantName(e.target.value)}
            className={inputClass}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="entrantEmail" className="block text-sm font-medium text-ink mb-2">
            Email
          </label>
          <input
            id="entrantEmail"
            type="email"
            required
            maxLength={200}
            value={entrantEmail}
            onChange={(e) => setEntrantEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
          <p className="mt-1 text-xs text-soft">One entry per email address.</p>
        </div>
      </div>

      <div>
        <label htmlFor="entryTitle" className="block text-sm font-medium text-ink mb-2">
          Entry title
        </label>
        <input
          id="entryTitle"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Title of your piece"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="entryContent" className="text-sm font-medium text-ink">
            Your entry
          </label>
          <span
            className={cn(
              "text-xs tabular-nums",
              tooShort || tooLong ? "text-amber-600" : "text-soft"
            )}
          >
            {words} words
            {wordGuidance ? ` · ${wordGuidance}` : ""}
          </span>
        </div>
        <textarea
          id="entryContent"
          required
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={cn(inputClass, "resize-y font-reading leading-relaxed")}
          placeholder="Start writing..."
        />
      </div>

      {uploadMode !== "TEXT" && (
        <FileUpload
          value={file}
          onChange={setFile}
          label={
            uploadMode === "REQUIRED"
              ? "Attach your file"
              : "Attach a file (optional)"
          }
        />
      )}

      {/* Honeypot */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {pending ? "Submitting..." : "Submit entry"}
      </button>
    </form>
  );
}
