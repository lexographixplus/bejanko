"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/app/api/search/route";

const kindStyles: Record<SearchResult["kind"], string> = {
  Essay: "bg-mark/10 text-mark",
  Note: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Quote: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Book: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
  Guest: "bg-green-500/10 text-green-600 dark:text-green-400",
  Contest: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

const MIN_QUERY = 2;

/**
 * Mounted only while open, so every launch starts from clean state without an
 * effect that resets it.
 */
function SearchPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  const term = query.trim();
  const ready = term.length >= MIN_QUERY;

  // Results are only meaningful for the current term; deriving this avoids
  // clearing state from inside the effect below.
  const visible = ready ? results : [];

  useEffect(() => {
    if (term.length < MIN_QUERY) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (controller.signal.aborted) return;
        setResults(json.results ?? []);
        setActive(0);
      } catch {
        // Aborted or failed — keep whatever was on screen.
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  // Lock background scroll for as long as the palette is mounted.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const go = useCallback(
    (result: SearchResult) => {
      onClose();
      router.push(result.href);
    },
    [onClose, router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (visible.length ? (i + 1) % visible.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) =>
        visible.length ? (i - 1 + visible.length) % visible.length : 0
      );
    } else if (e.key === "Enter" && visible[active]) {
      e.preventDefault();
      go(visible[active]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-xl rounded-2xl border border-rule bg-surface shadow-2xl overflow-hidden animate-fade-up"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 px-4 border-b border-rule">
          {loading ? (
            <Loader2 className="w-4 h-4 text-soft animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-soft shrink-0" />
          )}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search essays, notes, quotes, books..."
            aria-label="Search query"
            className="flex-1 bg-transparent py-4 text-sm text-ink placeholder:text-soft/50 focus:outline-none"
          />
          <kbd className="hidden sm:block text-[0.65rem] text-soft/60 border border-rule/60 rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto">
          {!ready ? (
            <p className="px-4 py-8 text-sm text-soft text-center">
              Type at least two characters to search.
            </p>
          ) : visible.length === 0 && !loading ? (
            <p className="px-4 py-8 text-sm text-soft text-center">
              Nothing found for &ldquo;{term}&rdquo;.
            </p>
          ) : (
            <ul className="py-2">
              {visible.map((result, i) => (
                <li key={`${result.kind}-${result.id}`}>
                  <button
                    onClick={() => go(result)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                      i === active ? "bg-stone/60" : "hover:bg-stone/30"
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md mt-0.5",
                        kindStyles[result.kind]
                      )}
                    >
                      {result.kind}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-ink truncate">
                        {result.title}
                      </span>
                      {result.excerpt && (
                        <span className="block text-xs text-soft truncate mt-0.5">
                          {result.excerpt}
                        </span>
                      )}
                    </span>
                    {i === active && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-soft shrink-0 mt-1" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return <SearchPalette onClose={onClose} />;
}
