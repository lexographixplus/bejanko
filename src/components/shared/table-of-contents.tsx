"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/utils";

interface TableOfContentsProps {
  items: TocItem[];
  /**
   * `sidebar` is always open and unboxed — it sits inside the sticky rail
   * where the scroll-spy tracks your position as you read.
   * `inline` is the collapsible box used above the body on small screens.
   */
  variant?: "inline" | "sidebar";
  className?: string;
}

/** Tracks which heading is nearest the top of the reading area. */
function useActiveHeading(items: TocItem[], enabled: boolean) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, enabled]);

  return activeId;
}

function TocLinks({
  items,
  activeId,
}: {
  items: TocItem[];
  activeId: string | null;
}) {
  return (
    <>
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={cn(
              "flex items-start gap-3 py-1.5 text-sm transition-colors group",
              item.level === 3 && "pl-6",
              activeId === item.id
                ? "text-mark font-medium"
                : "text-soft hover:text-mark"
            )}
            aria-current={activeId === item.id ? "location" : undefined}
          >
            <span
              className={cn(
                "text-xs tabular-nums mt-0.5 transition-colors",
                activeId === item.id
                  ? "text-mark"
                  : "text-rule group-hover:text-mark"
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{item.text}</span>
          </a>
        </li>
      ))}
    </>
  );
}

export function TableOfContents({
  items,
  variant = "inline",
  className,
}: TableOfContentsProps) {
  const [open, setOpen] = useState(false);
  const activeId = useActiveHeading(items, items.length >= 3);

  if (items.length < 3) return null;

  if (variant === "sidebar") {
    return (
      <nav className={className} aria-label="Table of contents">
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-soft/70 mb-3">
          <List className="w-3.5 h-3.5" />
          On this page
        </p>
        <ol className="space-y-0.5 border-l border-rule pl-3">
          <TocLinks items={items} activeId={activeId} />
        </ol>
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        "mb-10 border border-rule rounded-xl overflow-hidden bg-surface/50",
        className
      )}
      aria-label="Table of contents"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-stone/30 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <List className="w-4 h-4 text-soft" />
          Table of Contents
          <span className="text-soft/60 font-normal">({items.length})</span>
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-soft transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ol className="px-5 pb-4 space-y-0.5">
          <TocLinks items={items} activeId={activeId} />
        </ol>
      )}
    </nav>
  );
}
