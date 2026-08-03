"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { wordCount } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().optional(),
  body: z.string().min(50, "Your piece must be at least 50 characters"),
  website: z.string().max(0, ""),
});

type FormData = z.infer<typeof schema>;

export function SubmitForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    if (words < 50) {
      setError("Your piece must be at least 50 words");
      return;
    }
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-rule bg-surface p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-ink mb-2">
          Submission received
        </h3>
        <p className="text-soft text-sm">
          Thank you for your submission. We&apos;ll read it and get back to you
          by email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div role="alert" aria-live="polite" className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-2">
            Your name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className={cn(
              "w-full px-4 py-3 rounded-lg border bg-surface text-ink placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors",
              errors.name ? "border-red-400" : "border-rule"
            )}
            placeholder="Your name"
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={cn(
              "w-full px-4 py-3 rounded-lg border bg-surface text-ink placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors",
              errors.email ? "border-red-400" : "border-rule"
            )}
            placeholder="you@example.com"
          />
          <p className="mt-1 text-xs text-soft">Never published. Used only to reply.</p>
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className={cn(
            "w-full px-4 py-3 rounded-lg border bg-surface text-ink placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors",
            errors.title ? "border-red-400" : "border-rule"
          )}
          placeholder="Title of your piece"
        />
        {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-ink mb-2">
          Short bio <span className="text-soft font-normal">(optional)</span>
        </label>
        <input
          id="bio"
          type="text"
          {...register("bio")}
          className="w-full px-4 py-3 rounded-lg border border-rule bg-surface text-ink placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors"
          placeholder="A line about yourself"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="body" className="text-sm font-medium text-ink">
            Your piece
          </label>
          <span
            className={cn(
              "text-xs tabular-nums",
              words < 50 ? "text-amber-600" : "text-soft"
            )}
          >
            {words} words {words < 50 && "(min 50)"}
          </span>
        </div>
        <textarea
          id="body"
          rows={12}
          {...register("body")}
          onChange={(e) => {
            register("body").onChange(e);
            setWords(wordCount(e.target.value));
          }}
          className={cn(
            "w-full px-4 py-3 rounded-lg border bg-surface text-ink placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors resize-y font-reading",
            errors.body ? "border-red-400" : "border-rule"
          )}
          placeholder="Start writing..."
        />
        {errors.body && <p className="mt-1.5 text-xs text-red-500">{errors.body.message}</p>}
      </div>

      {/* Honeypot */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <input type="text" {...register("website")} tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isSubmitting ? "Submitting..." : "Submit Piece"}
      </button>
    </form>
  );
}
