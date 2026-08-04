import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

type Outcome = "done" | "already" | "invalid";

async function unsubscribe(token: string | undefined): Promise<Outcome> {
  if (!token) return "invalid";

  const subscriber = await db.subscriber.findUnique({ where: { token } });
  if (!subscriber) return "invalid";
  if (subscriber.status === "UNSUBSCRIBED") return "already";

  await db.subscriber.update({
    where: { token },
    data: { status: "UNSUBSCRIBED" },
  });

  return "done";
}

const copy: Record<Outcome, { title: string; body: string }> = {
  done: {
    title: "You're unsubscribed",
    body: "You won't receive any more emails about new writing. No hard feelings — the work stays free to read here whenever you want it.",
  },
  already: {
    title: "Already unsubscribed",
    body: "This address is already off the list. Nothing more to do.",
  },
  invalid: {
    title: "This link isn't valid",
    body: "The unsubscribe link is incorrect or has expired. Reply to any email from us and we'll remove you by hand.",
  },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = await unsubscribe(token);
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
            className="inline-flex items-center gap-2 px-6 py-3 border border-rule rounded-lg text-ink font-medium text-sm hover:bg-stone/50 transition-colors"
          >
            Keep reading
          </Link>
        </div>
      </div>
    </div>
  );
}
