"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/shared/search-dialog";
import { Logo } from "@/components/layout/logo";

const navItems = [
  { label: "Essays", href: "/essays" },
  { label: "Notes", href: "/notes" },
  { label: "Guest Writing", href: "/guest-writing" },
  { label: "Contests", href: "/contests" },
  { label: "Books", href: "/books" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const noopSubscribe = () => () => {};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close menu on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (menuOpen) setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Cmd/Ctrl+K opens search from anywhere, "/" opens it outside a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <SearchDialog open={searchOpen} onClose={closeSearch} />

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isStuck
            ? "glass border-b border-rule/60 shadow-[0_1px_0_0_var(--rule)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-[var(--shell)] px-6 flex items-center h-16">
          {/* Logo — left */}
          <Link
            href="/"
            className="text-[1.05rem] text-ink hover:text-mark transition-colors mr-auto"
            aria-label="Mind Substances — home"
          >
            <Logo />
          </Link>

          {/* Desktop Nav — center */}
          <nav className="hidden lg:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 py-2 rounded-md text-[0.8125rem] font-medium transition-colors font-ui",
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href))
                    ? "text-mark"
                    : "text-soft hover:text-ink hover:bg-stone/60"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions — right */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search — full trigger on desktop, icon on mobile */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-md border border-rule/60 text-[0.75rem] text-soft hover:text-ink hover:border-rule transition-colors mr-2"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="font-ui not-italic text-[0.65rem] text-soft/60 border border-rule/60 rounded px-1 py-0.5">
                &#8984;K
              </kbd>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2 rounded-md text-soft hover:text-ink hover:bg-stone/60 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme toggle with skeleton */}
            <div className="w-9 h-9 flex items-center justify-center">
              {mounted ? (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-md text-soft hover:text-ink hover:bg-stone/60 transition-colors"
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {theme === "dark" ? (
                    <Sun className="w-[17px] h-[17px]" />
                  ) : (
                    <Moon className="w-[17px] h-[17px]" />
                  )}
                </button>
              ) : (
                <span className="w-7 h-7 rounded-md bg-stone/40 block" aria-hidden />
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-md text-soft hover:text-ink hover:bg-stone/60 transition-colors"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom-sheet nav */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Sheet */}
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl border-t border-rule glass shadow-2xl animate-fade-up"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="px-6 pb-8">
              {/* Drag handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-rule" />
              </div>

              <div className="grid grid-cols-2 gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-colors font-ui",
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href))
                        ? "text-mark bg-mark/8"
                        : "text-soft hover:text-ink hover:bg-stone/60"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
