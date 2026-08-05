"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORMAT_BLURB, formatFileSize, type BookFile } from "@/lib/books";

interface BookDownloadFormProps {
  slug: string;
  title: string;
  files: BookFile[];
}

export function BookDownloadForm({ slug, title, files }: BookDownloadFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [pending, setPending] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function downloadHref(format: string) {
    return `/books/${slug}/download?token=${token}&format=${format}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch(`/api/books/${slug}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong");

      setToken(json.token);

      // Start the preferred format immediately — the reader asked for a book,
      // not for a second screen to click through.
      if (json.token && files[0]) {
        window.location.href = `/books/${slug}/download?token=${json.token}&format=${files[0].format}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  if (token) {
    return (
      <div className="rounded-xl border border-green-600/20 bg-green-500/5 p-5">
        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-3" />
        <p className="font-display font-semibold text-ink">
          Your download is starting
        </p>
        <p className="text-sm text-soft mt-1.5 leading-relaxed">
          We&apos;ve emailed the link too, so you can pick it up on another
          device.
        </p>

        <div className="mt-4 space-y-2">
          {files.map((file, i) => (
            <a
              key={file.format}
              href={downloadHref(file.format)}
              className={cn(
                "flex items-center justify-between gap-3 w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-colors",
                i === 0
                  ? "bg-mark text-white hover:bg-mark-hover"
                  : "border border-rule text-ink hover:bg-stone/50"
              )}
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {file.format}
              </span>
              {formatFileSize(file.sizeBytes) && (
                <span className={i === 0 ? "text-white/70" : "text-soft"}>
                  {formatFileSize(file.sizeBytes)}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-rule bg-surface p-5">
      <p className="font-display font-semibold text-ink">Read it free</p>

      {/* The exchange is stated before they type, not buried in a checkbox. */}
      <p className="text-sm text-soft mt-1.5 leading-relaxed">
        {/* One expression: JSX drops the space either side of an interpolation
            boundary, which silently ran the title into the next word. */}
        {`Enter your email and ${title} is yours. You'll also get new essays and notes — one click unsubscribes you, any time.`}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <label htmlFor={`claim-${slug}`} className="sr-only">
          Email address
        </label>
        <input
          id={`claim-${slug}`}
          type="email"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {pending ? "…" : "Get it"}
        </button>
      </div>

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

      <ul className="mt-3.5 space-y-1">
        {files.map((file) => (
          <li key={file.format} className="text-xs text-soft">
            <span className="font-medium text-ink">{file.format}</span>
            {" — "}
            {FORMAT_BLURB[file.format]}
            {formatFileSize(file.sizeBytes) && (
              <span className="text-soft/70">
                {" "}
                · {formatFileSize(file.sizeBytes)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </form>
  );
}
