"use client";

import { useState, useSyncExternalStore } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface AdminShellProps {
  userName: string;
  children: React.ReactNode;
}

function readCollapsed(): boolean {
  try {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    return stored === "true";
  } catch {
    return false;
  }
}

export function AdminShell({ userName, children }: AdminShellProps) {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const sidebarWidth = mounted && collapsed ? "4rem" : "16rem";

  return (
    <div className="flex min-h-screen bg-paper">
      <AdminSidebar userName={userName} onCollapsedChange={setCollapsed} />
      <main
        className="flex-1 min-w-0 transition-[margin] duration-300 ease-in-out ml-0 lg:ml-[var(--admin-sidebar-w,16rem)]"
        style={{ ["--admin-sidebar-w" as string]: sidebarWidth } as React.CSSProperties}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
