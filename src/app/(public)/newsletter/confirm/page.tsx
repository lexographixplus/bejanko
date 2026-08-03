import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false, follow: false },
};

type Outcome = "confirmed" | "already" | "invalid";

async function confirm(token: string | undefined): Promise<Outcome> {
  if (!token) return "invalid";

  const subscriber = await db.subscriber.findUnique({ where: { token } });
  if (!subscriber) return "invalid";
  if (subscriber.status === "CONFIRMED") return "already";

  await db.subscriber.update({
    where: { token },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });

  return "confirmed";
}

const copy: Record<Outcome, { title: string; body: string }> = {
  confirmed: {
    title: "You're subscribed",
    body: "Thank you. New essays and notes will arrive in your inbox — a couple of emails a month at most.",
  },
  already: {
    title: "Already subscribed",
    body: "You confirmed this address earlier. Nothing more to do.",
  },
  invalid: {
    title: "This link isn't valid",
    body: "The confirmation link is incorrect or has expired. Try subscribing again from the footer.",
  },
};

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = await confirm(token);
  const { title, body } = copy[outcome];
  const good = outcome !== "invalid";

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-20 md:py-28">
      <div className="mx-auto max-w-md text-center">
        <div
          className={
            good
              ? "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 mb-6"
              : "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-6"
          }
        >
          {good ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <AlertCircle className="w-7 h-7" />
          )}
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
          {title}
        </h1>
        <p className="mt-3 text-soft leading-relaxed font-reading">{body}</p>

        <div className="mt-8">
          <Link
            href="/essays"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
          >
            Start reading
          </Link>
        </div>
      </div>
    </div>
  );
}
