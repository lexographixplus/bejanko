"use client";

import { useState } from "react";
import { Loader2, MailCheck, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteFormProps {
  entryId: string;
  entryTitle: string;
}

export function VoteForm({ entryId, entryTitle }: VoteFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, voterName: name, voterEmail: email, website }),
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
      <div className="mt-5 rounded-lg border border-green-600/20 bg-green-500/5 p-4 flex gap-3">
        <MailCheck className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-ink">Check your inbox</p>
          <p className="text-sm text-soft mt-0.5 leading-relaxed">
            We sent a confirmation link to <strong>{email}</strong>. Your vote for
            &ldquo;{entryTitle}&rdquo; counts once you click it.
          </p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors";

  return (
    <form onSubmit={onSubmit} className="mt-5 rounded-lg border border-rule bg-paper/60 p-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-soft/70 mb-3">
        Vote for this entry
      </p>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className={inputClass}
        />
        <input
          type="email"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Your email"
          className={inputClass}
        />
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

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 bg-mark text-white rounded-lg font-medium text-sm transition-colors",
            "hover:bg-mark-hover disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Vote className="w-4 h-4" />
          )}
          {pending ? "Sending..." : "Cast vote"}
        </button>
        <p className="text-xs text-soft">
          One vote per person. Confirmed by email.
        </p>
      </div>
    </form>
  );
}
