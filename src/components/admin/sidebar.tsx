"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Quote,
  Trophy,
  Mail,
  UserCircle,
  BookMarked,
  Settings,
  Menu,
  X,
  PenLine,
  LogOut,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/layout/logo";

const navSections = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Essays", href: "/dashboard/essays", icon: BookOpen },
      { label: "Notes", href: "/dashboard/notes", icon: FileText },
      { label: "Quotes", href: "/dashboard/quotes", icon: Quote },
      { label: "Books", href: "/dashboard/books", icon: BookMarked },
      { label: "Guest Posts", href: "/dashboard/guest-posts", icon: PenLine },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Contests", href: "/dashboard/contests", icon: Trophy },
      { label: "Messages", href: "/dashboard/messages", icon: Mail },
      { label: "Authors", href: "/dashboard/authors", icon: UserCircle },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  userName: string;
  userRole?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AdminSidebar({
  userName,
  userRole = "ADMIN",
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem("admin-sidebar-collapsed");
      return stored === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin-sidebar-collapsed", String(next));
      } catch {
        // ignore
      }
      onCollapsedChange?.(next);
      return next;
    });
  }, [onCollapsedChange]);

  // Escape key closes mobile menu
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const initial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-rule shadow-md"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-ink" />
      </button>

      {/* Mobile Overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-surface border-r border-rule flex flex-col",
          "transition-[transform,width] duration-300 ease-in-out",
          // Desktop width based on collapsed state
          collapsed ? "lg:w-16" : "lg:w-64",
          // Mobile: always full width, translate in/out
          "w-64",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-rule shrink-0 transition-all duration-300",
            collapsed ? "lg:justify-center px-3" : "justify-between px-5"
          )}
        >
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 min-w-0 text-base text-ink hover:text-mark transition-colors"
            >
              <LogoMark className="w-6 h-6 text-mark shrink-0" />
              <span className="font-display font-bold tracking-tight truncate">
                Mind Substances
              </span>
            </Link>
          )}
          {collapsed && (
            <Link
              href="/dashboard"
              aria-label="Dashboard home"
              className="w-8 h-8 rounded-lg bg-mark/10 flex items-center justify-center text-mark"
            >
              <LogoMark className="w-5 h-5" />
            </Link>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className={cn("lg:hidden p-1 rounded text-soft hover:text-ink", collapsed && "hidden")}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-soft/50 truncate">
                  {section.label}
                </p>
              )}
              {collapsed && (
                <div className="h-px bg-rule/50 mx-2 mb-2" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      aria-label={item.label}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors group",
                        collapsed ? "lg:justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5",
                        active
                          ? "bg-mark/8 text-mark"
                          : "text-soft hover:text-ink hover:bg-stone/60"
                      )}
                    >
                      {/* Active indicator pill */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-mark rounded-full" />
                      )}
                      <item.icon
                        className={cn(
                          "shrink-0 transition-colors",
                          collapsed ? "w-5 h-5" : "w-4 h-4",
                          active ? "text-mark" : "text-soft group-hover:text-ink"
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {/* Tooltip in collapsed mode */}
                      {collapsed && (
                        <span className="hidden lg:block absolute left-full ml-3 px-2 py-1.5 bg-ink text-paper text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn("border-t border-rule shrink-0 py-3 px-2 space-y-1")}>
          {/* User info */}
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-mark/15 flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-sm text-mark">{initial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink truncate">{userName}</p>
                <p className="text-[10px] text-soft/60 uppercase tracking-wider">{userRole}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <div
                className="w-8 h-8 rounded-full bg-mark/15 flex items-center justify-center"
                title={`${userName} — ${userRole}`}
              >
                <span className="font-display font-bold text-sm text-mark">{initial}</span>
              </div>
            </div>
          )}

          {/* Back to site */}
          <Link
            href="/"
            title={collapsed ? "Back to Site" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg text-sm text-soft hover:text-ink hover:bg-stone/60 transition-colors group",
              collapsed ? "lg:justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5"
            )}
          >
            <ChevronLeft className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
            {!collapsed && <span>Back to Site</span>}
            {collapsed && (
              <span className="hidden lg:block absolute left-full ml-3 px-2 py-1.5 bg-ink text-paper text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                Back to Site
              </span>
            )}
          </Link>

          {/* Sign out */}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              title={collapsed ? "Sign Out" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg text-sm text-soft hover:text-ink hover:bg-stone/60 transition-colors w-full group",
                collapsed ? "lg:justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5 text-left"
              )}
            >
              <LogOut className={cn("shrink-0", collapsed ? "w-5 h-5" : "w-4 h-4")} />
              {!collapsed && <span>Sign Out</span>}
              {collapsed && (
                <span className="hidden lg:block absolute left-full ml-3 px-2 py-1.5 bg-ink text-paper text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                  Sign Out
                </span>
              )}
            </button>
          </form>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleCollapsed}
            className={cn(
              "hidden lg:flex items-center gap-3 rounded-lg text-sm text-soft hover:text-ink hover:bg-stone/60 transition-colors w-full",
              collapsed ? "lg:justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight className="w-5 h-5 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
