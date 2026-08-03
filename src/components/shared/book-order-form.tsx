"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookOrderFormProps {
  slug: string;
  title: string;
  price?: string | null;
  format?: string | null;
}

export function BookOrderForm({ slug, title, price, format }: BookOrderFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch(`/api/books/${slug}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          quantity,
          format,
          message,
          website,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong");

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-green-600/20 bg-green-500/5 p-5">
        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-3" />
        <p className="font-display font-semibold text-ink">Order received</p>
        <p className="text-sm text-soft mt-1.5 leading-relaxed">
          We&apos;ve emailed you a copy. This is a request, not a payment —
          we&apos;ll reply to confirm availability and how to pay.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors"
      >
        <ShoppingCart className="w-4 h-4" />
        Order a copy
      </button>
    );
  }

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark transition-colors";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-rule bg-surface p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-display font-semibold text-ink">Order a copy</p>
          <p className="text-xs text-soft mt-0.5">
            {price ? `${price} · ` : ""}No payment taken now.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 -mr-1 text-soft hover:text-ink transition-colors shrink-0"
          aria-label="Close order form"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <div className="space-y-3">
        <input
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className={inputClass}
        />

        <input
          type="email"
          required
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Your email"
          className={inputClass}
        />

        <div className="grid grid-cols-[1fr_5rem] gap-3">
          <input
            type="tel"
            maxLength={40}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            aria-label="Phone number"
            className={inputClass}
          />
          <div>
            <label htmlFor="order-qty" className="sr-only">
              Quantity
            </label>
            <input
              id="order-qty"
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
              }
              className={inputClass}
            />
          </div>
        </div>

        <textarea
          rows={2}
          maxLength={1000}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Delivery address (optional)"
          aria-label="Delivery address"
          className={cn(inputClass, "resize-y")}
        />

        <textarea
          rows={2}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything else? (optional)"
          aria-label="Message"
          className={cn(inputClass, "resize-y")}
        />
      </div>

      {/* Honeypot */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-4 flex items-center justify-center gap-2 w-full px-5 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        {pending ? "Sending..." : `Order ${quantity > 1 ? `${quantity} copies` : "a copy"}`}
      </button>

      <p className="mt-2.5 text-xs text-soft leading-relaxed">
        We&apos;ll email you to confirm availability, the total and payment. Your
        details are only used for this order — never published.
      </p>

      <p className="sr-only">Ordering {title}</p>
    </form>
  );
}
