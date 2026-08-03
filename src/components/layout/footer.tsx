import Link from "next/link";
import { Rss } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Logo } from "@/components/layout/logo";
import { SITE_NAME } from "@/lib/site";

const navLinks = [
  { label: "Essays", href: "/essays" },
  { label: "Notes", href: "/notes" },
  { label: "Quotes", href: "/quotes" },
  { label: "Books", href: "/books" },
  { label: "Guest Writing", href: "/guest-writing" },
  { label: "Contests", href: "/contests" },
];

const metaLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Submit a Piece", href: "/submit" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto max-w-[var(--shell)] px-6 pt-14 pb-10">
        <div className="grid md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand / tagline */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-lg text-ink hover:text-mark transition-colors"
              aria-label={`${SITE_NAME} — home`}
            >
              <Logo />
            </Link>
            <p className="text-soft text-sm mt-2 max-w-[22ch] leading-relaxed font-reading">
              A writing space first,
              <br />a literary community second.
            </p>
          </div>

          {/* Navigation links */}
          <div>
            <p className="text-xs font-medium text-soft/60 uppercase tracking-widest mb-4 font-ui">
              Explore
            </p>
            <nav className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-soft hover:text-mark transition-colors font-ui w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Stay connected */}
          <div>
            <p className="text-xs font-medium text-soft/60 uppercase tracking-widest mb-4 font-ui">
              Stay Connected
            </p>
            <nav className="flex flex-col gap-2.5">
              {metaLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-soft hover:text-mark transition-colors font-ui w-fit"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="/feed.xml"
                className="text-sm text-soft hover:text-mark transition-colors font-ui inline-flex items-center gap-1.5 w-fit"
              >
                <Rss className="w-3.5 h-3.5" />
                RSS
              </a>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-xs font-medium text-soft/60 uppercase tracking-widest mb-4 font-ui">
              Newsletter
            </p>
            <p className="text-sm text-soft leading-relaxed font-reading mb-3">
              New essays and notes, straight to your inbox. A couple of emails a
              month, no more.
            </p>
            <NewsletterForm source="footer" />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-rule/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-soft/50 font-ui">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-soft/40 font-ui">
            Words matter. Build carefully.
          </p>
        </div>
      </div>
    </footer>
  );
}
