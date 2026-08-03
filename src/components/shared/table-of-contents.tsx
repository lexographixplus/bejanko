"use client";

import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/utils";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length < 3) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    // Highlight whichever heading sits nearest the top of the reading area.
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
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      className="mb-10 border border-rule rounded-xl overflow-hidden bg-surface/50"
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
        </ol>
      )}
    </nav>
  );
}
