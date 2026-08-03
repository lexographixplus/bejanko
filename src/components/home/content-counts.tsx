import Link from "next/link";
import { BookOpen, FileText, Quote, Users, Trophy } from "lucide-react";

type Counts = {
  essays: number;
  notes: number;
  quotes: number;
  guestPosts: number;
  contests: number;
};

const statConfig = [
  { label: "Essays", icon: BookOpen, href: "/essays", key: "essays" as const },
  { label: "Notes", icon: FileText, href: "/notes", key: "notes" as const },
  { label: "Quotes", icon: Quote, href: "/quotes", key: "quotes" as const },
  { label: "Guest Pieces", icon: Users, href: "/guest-writing", key: "guestPosts" as const },
  { label: "Contests", icon: Trophy, href: "/contests", key: "contests" as const },
];

export function ContentCountsSection({ counts }: { counts: Counts }) {
  const stats = statConfig.map((s) => ({ ...s, count: counts[s.key] }));

  return (
    <section className="border-y border-rule bg-surface/50">
      <div className="mx-auto max-w-[var(--shell)] px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 divide-x divide-rule">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group flex flex-col items-center gap-2 py-4 px-3 text-center hover:bg-stone/30 transition-colors first:rounded-l-lg last:rounded-r-lg"
            >
              <stat.icon className="w-4 h-4 text-mark" />
              <span className="font-display text-2xl font-bold text-ink tabular-nums">
                {stat.count}
              </span>
              <span className="text-[10px] text-soft uppercase tracking-[0.15em] font-medium group-hover:text-mark transition-colors">
                {stat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
