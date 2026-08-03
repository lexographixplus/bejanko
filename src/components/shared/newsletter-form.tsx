"use client";

import { useState } from "react";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  source?: string;
  /** `dark` inverts the palette for use on the ink-coloured band. */
  tone?: "default" | "dark";
  className?: string;
}

export function NewsletterForm({
  source = "footer",
  tone = "default",
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dark = tone === "dark";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong");

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p
        className={cn(
          "flex items-start gap-2 text-sm leading-relaxed",
          dark ? "text-paper/80" : "text-soft",
          className
        )}
      >
        <MailCheck
          className={cn(
            "w-4 h-4 shrink-0 mt-0.5",
            dark ? "text-paper" : "text-green-600 dark:text-green-400"
          )}
        />
        Check your inbox to confirm your subscription.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="flex gap-2">
        <label htmlFor={`newsletter-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${source}`}
          type="email"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={cn(
            "flex-1 min-w-0 px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2",
            dark
              ? "bg-white/5 border-white/15 text-paper placeholder:text-paper/40 focus:ring-white/20 focus:border-white/30"
              : "bg-surface border-rule text-ink placeholder:text-soft/50 focus:ring-mark/30 focus:border-mark"
          )}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe"
          className={cn(
            "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shrink-0",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            dark
              ? "bg-mark text-white hover:bg-mark-hover"
              : "bg-mark text-white hover:bg-mark-hover"
          )}
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
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

      {error && (
        <p
          role="alert"
          className={cn(
            "mt-2 text-xs",
            dark ? "text-red-300" : "text-red-500"
          )}
        >
          {error}
        </p>
      )}
    </form>
  );
}
