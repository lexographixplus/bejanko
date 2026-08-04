import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { cn } from "@/lib/utils";

interface SubscribeCalloutProps {
  /** Distinguishes signups by placement in the dashboard. */
  source?: string;
  heading?: string;
  body?: string;
  className?: string;
}

/**
 * Inline subscribe prompt for the end of a piece — the moment a reader has
 * just finished something and is most likely to want the next one.
 */
export function SubscribeCallout({
  source = "essay",
  heading = "Get new writing by email",
  body = "New essays and notes, straight to your inbox. A couple of emails a month, and you can leave whenever you like.",
  className,
}: SubscribeCalloutProps) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-rule bg-surface p-6 sm:p-8",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <span className="hidden sm:flex w-10 h-10 rounded-xl bg-mark/10 items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-mark" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-ink leading-snug">
            {heading}
          </h2>
          <p className="mt-1.5 text-sm text-soft leading-relaxed">{body}</p>

          <NewsletterForm source={source} className="mt-4 max-w-sm" />
        </div>
      </div>
    </aside>
  );
}
