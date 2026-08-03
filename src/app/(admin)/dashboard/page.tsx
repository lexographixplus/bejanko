import {
  BookOpen,
  FileText,
  Quote,
  Users,
  Trophy,
  Mail,
  BookMarked,
  PenLine,
  Plus,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, getRecentActivity } from "@/lib/actions/stats";
import { getMessages } from "@/lib/actions/messages";
import { getContests } from "@/lib/actions/contests";
import { stageLabel } from "@/lib/contest-stage";

const quickActions = [
  { label: "New Essay", href: "/dashboard/essays?new=1", icon: BookOpen },
  { label: "New Note", href: "/dashboard/notes?new=1", icon: FileText },
  { label: "New Quote", href: "/dashboard/quotes?new=1", icon: Quote },
  { label: "New Book", href: "/dashboard/books?new=1", icon: BookMarked },
  { label: "New Contest", href: "/dashboard/contests?new=1", icon: Trophy },
  { label: "New Author", href: "/dashboard/authors?new=1", icon: Users },
];

export default async function DashboardPage() {
  const [stats, newMessages, contests, recentActivity] = await Promise.all([
    getDashboardStats(),
    getMessages({ status: "NEW" }),
    getContests(),
    getRecentActivity(),
  ]);

  const recentMessages = newMessages.slice(0, 3);
  const activeContest = contests.find((c) => c.published) ?? null;

  const statCards = [
    { label: "Essays", count: stats.essays, icon: BookOpen, href: "/dashboard/essays", style: { color: "rgb(37,99,235)", backgroundColor: "rgba(59,130,246,0.1)" } },
    { label: "Notes", count: stats.notes, icon: FileText, href: "/dashboard/notes", style: { color: "rgb(5,150,105)", backgroundColor: "rgba(16,185,129,0.1)" } },
    { label: "Quotes", count: stats.quotes, icon: Quote, href: "/dashboard/quotes", style: { color: "rgb(180,83,9)", backgroundColor: "rgba(245,158,11,0.1)" } },
    { label: "Guest Posts", count: stats.guestPosts, icon: PenLine, href: "/dashboard/guest-posts", style: { color: "rgb(126,34,206)", backgroundColor: "rgba(168,85,247,0.1)" } },
    { label: "Books", count: stats.books, icon: BookMarked, href: "/dashboard/books", style: { color: "rgb(190,18,60)", backgroundColor: "rgba(244,63,94,0.1)" } },
    { label: "Contests", count: stats.contests, icon: Trophy, href: "/dashboard/contests", style: { color: "rgb(194,65,12)", backgroundColor: "rgba(249,115,22,0.1)" } },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-soft text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative rounded-xl border border-rule bg-surface p-4 hover:shadow-md hover:border-mark/20 transition-all"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={stat.style}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="font-display text-2xl font-bold text-ink tabular-nums">
              {stat.count}
            </p>
            <p className="text-xs text-soft mt-0.5">{stat.label}</p>
            <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-rule group-hover:text-mark transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Main Column */}
        <div className="space-y-8">
          {/* Active Contest Alert */}
          {activeContest && (
            <div className="rounded-xl border border-rule bg-surface p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-ink text-sm">Contest Active</h3>
                  <p className="text-xs text-soft mt-1">
                    {activeContest.title} —{" "}
                    <span className="text-purple-600 font-medium">
                      {stageLabel(activeContest.stage)}
                    </span>
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-soft">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {activeContest._count.entries} entries
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {stats.pendingEntries} pending
                    </span>
                  </div>
                </div>
                <Link
                  href="/dashboard/contests"
                  className="text-xs text-mark hover:text-mark-hover font-medium transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          )}

          {/* Pending Items */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="font-medium text-ink text-sm">Needs Attention</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-soft">Unread messages</span>
                <Link href="/dashboard/messages" className="text-mark font-medium">
                  {stats.unreadMessages} new
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-soft">Pending guest posts</span>
                <Link href="/dashboard/guest-posts" className="text-mark font-medium">
                  {stats.pendingGuestPosts} pending
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-soft">Pending contest entries</span>
                <Link href="/dashboard/contests" className="text-mark font-medium">
                  {stats.pendingEntries} pending
                </Link>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-soft">New book orders</span>
                <Link href="/dashboard/orders" className="text-mark font-medium">
                  {stats.newOrders} new
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Messages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
                <Mail className="w-4 h-4 text-mark" />
                Recent Messages
              </h2>
              <Link
                href="/dashboard/messages"
                className="text-xs text-mark hover:text-mark-hover font-medium transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="rounded-xl border border-rule bg-surface divide-y divide-rule">
              {recentMessages.length === 0 ? (
                <div className="p-8 text-center text-soft text-sm">No new messages.</div>
              ) : (
                recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-4 p-4">
                    <div className="w-9 h-9 rounded-full bg-stone flex items-center justify-center shrink-0">
                      <span className="font-display font-bold text-sm text-mark">
                        {msg.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink truncate">
                          {msg.name}
                        </p>
                        {msg.status === "NEW" && (
                          <span className="w-2 h-2 rounded-full bg-mark shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-soft truncate">
                        {msg.subject ?? msg.message.slice(0, 60)}
                      </p>
                    </div>
                    <span className="text-xs text-soft/60 shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border border-rule bg-surface p-5">
            <h3 className="font-display font-semibold text-ink text-sm mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-rule/50 text-sm text-soft hover:text-ink hover:bg-stone/30 hover:border-rule transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-mark" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-rule bg-surface p-5">
            <h3 className="font-display font-semibold text-ink text-sm mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-soft text-center py-4">No recent activity.</p>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-mark mt-2 shrink-0" />
                    <div>
                      <p className="text-xs text-soft">{item.type}</p>
                      <p className="text-sm text-ink font-medium line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-soft/60 mt-0.5">
                        {new Date(item.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
