"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload, Mail, ImageIcon, Globe, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { updateSettings } from "@/lib/actions/settings";
import { ImageUpload } from "./image-upload";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  settings: Record<string, string>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [portrait, setPortrait] = useState(settings.portraitUrl ?? "");
  const [guestBandImage, setGuestBandImage] = useState(
    settings.guestBandImageUrl ?? ""
  );
  const [promoImage, setPromoImage] = useState(settings.promoImage ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: Record<string, string> = {};
    for (const [key, value] of data.entries()) {
      if (typeof value === "string") {
        payload[key] = value;
      }
    }

    payload.portraitUrl = portrait;
    payload.guestBandImageUrl = guestBandImage;
    payload.promoImage = promoImage;
    // An unchecked checkbox submits nothing, so the off state needs saying.
    payload.promoEnabled = data.get("promoEnabled") === "true" ? "true" : "false";

    startTransition(async () => {
      try {
        await updateSettings(payload);
        router.refresh();
        toast.success("Settings saved.");
      } catch {
        toast.error("Failed to save settings.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="text-soft text-sm mt-1">
          Site configuration and preferences.
        </p>
      </div>

      {/* General */}
      <section className="rounded-xl border border-rule bg-surface p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-5 h-5 text-mark" />
          <h2 className="font-display text-lg font-semibold text-ink">
            General
          </h2>
        </div>

        <div>
          <label
            htmlFor="siteName"
            className="block text-sm font-medium text-ink mb-2"
          >
            Site Name
          </label>
          <input
            id="siteName"
            name="siteName"
            type="text"
            defaultValue={settings.siteName ?? "Mind Substances"}
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
        </div>

        <div>
          <label
            htmlFor="siteDescription"
            className="block text-sm font-medium text-ink mb-2"
          >
            Site Description
          </label>
          <textarea
            id="siteDescription"
            name="siteDescription"
            rows={2}
            defaultValue={
              settings.siteDescription ??
              "A writing space first, a literary community second."
            }
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark resize-y"
          />
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-rule bg-surface p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-5 h-5 text-mark" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Contact
          </h2>
        </div>

        <div>
          <label
            htmlFor="contactEmail"
            className="block text-sm font-medium text-ink mb-2"
          >
            Contact Email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail ?? "hello@bejanko.com"}
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
          <p className="mt-1 text-xs text-soft">
            Used for contact form replies and contest notifications.
          </p>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-xl border border-rule bg-surface p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <ImageIcon className="w-5 h-5 text-mark" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Images
          </h2>
        </div>

        <ImageUpload
          value={portrait}
          onChange={setPortrait}
          label="Portrait"
          hint="Used on About page, hero, and social cards."
          aspect="portrait"
        />

        <ImageUpload
          value={guestBandImage}
          onChange={setGuestBandImage}
          label="Guest Writing Band Image"
          hint="Displayed in the guest writing call-to-action band."
          aspect="banner"
        />
      </section>

      {/* Sidebar promo */}
      <section className="rounded-xl border border-rule bg-surface p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone className="w-5 h-5 text-mark" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Essay sidebar promo
          </h2>
        </div>

        <p className="text-sm text-soft -mt-2">
          A box in the sidebar of every essay. Use it for whatever you want in
          front of readers — a giveaway, a contest, a partner.
        </p>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="promoEnabled"
            value="true"
            defaultChecked={settings.promoEnabled === "true"}
            className="mt-0.5 accent-[var(--mark)]"
          />
          <span className="text-sm">
            <span className="font-medium text-ink">Show the promo</span>
            <span className="block text-xs text-soft mt-0.5">
              Hidden automatically if there is no heading.
            </span>
          </span>
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="promoEyebrow"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Label <span className="text-soft font-normal">(optional)</span>
            </label>
            <input
              id="promoEyebrow"
              name="promoEyebrow"
              type="text"
              maxLength={40}
              placeholder="Free this week"
              defaultValue={settings.promoEyebrow ?? ""}
              className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
            />
          </div>

          <div>
            <label
              htmlFor="promoCtaLabel"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Button text
            </label>
            <input
              id="promoCtaLabel"
              name="promoCtaLabel"
              type="text"
              maxLength={40}
              placeholder="Get your copy"
              defaultValue={settings.promoCtaLabel ?? ""}
              className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="promoTitle"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Heading
          </label>
          <input
            id="promoTitle"
            name="promoTitle"
            type="text"
            maxLength={80}
            placeholder="Marginalia is free until Friday"
            defaultValue={settings.promoTitle ?? ""}
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
        </div>

        <div>
          <label
            htmlFor="promoBody"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Text <span className="text-soft font-normal">(optional)</span>
          </label>
          <textarea
            id="promoBody"
            name="promoBody"
            rows={2}
            maxLength={200}
            placeholder="Twelve essays on attention and revision."
            defaultValue={settings.promoBody ?? ""}
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark resize-y"
          />
        </div>

        <div>
          <label
            htmlFor="promoCtaUrl"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Link
          </label>
          <input
            id="promoCtaUrl"
            name="promoCtaUrl"
            type="text"
            maxLength={500}
            placeholder="/books/marginalia"
            defaultValue={settings.promoCtaUrl ?? ""}
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
          <p className="mt-1 text-xs text-soft">
            A path like <code>/books/marginalia</code> stays on the site. A full
            https:// address opens in a new tab.
          </p>
        </div>

        <ImageUpload
          value={promoImage}
          onChange={setPromoImage}
          label="Image (optional)"
          hint="Shown above the heading, cropped to 16:9."
          aspect="landscape"
        />
      </section>

      {/* Cloudinary */}
      <section className="rounded-xl border border-rule bg-surface p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Upload className="w-5 h-5 text-mark" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Cloudinary
          </h2>
        </div>

        {/* Read-only status. The cloud name is a NEXT_PUBLIC_* value baked in
            at build time, so it cannot be changed from the database — showing
            an editable field here would be a control that does nothing. */}
        <div>
          <span className="block text-sm font-medium text-ink mb-2">
            Connection
          </span>
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-rule bg-paper">
            <span
              className={cn(
                "w-2 h-2 rounded-full shrink-0",
                cloudName ? "bg-green-500" : "bg-amber-500"
              )}
              aria-hidden
            />
            <span className="text-sm text-ink">
              {cloudName ? (
                <>
                  Connected to <span className="font-medium">{cloudName}</span>
                </>
              ) : (
                "Not configured — uploads fall back to pasting a URL"
              )}
            </span>
          </div>
          <p className="mt-1 text-xs text-soft">
            Set via the <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>,{" "}
            <code>NEXT_PUBLIC_CLOUDINARY_API_KEY</code> and{" "}
            <code>CLOUDINARY_API_SECRET</code> environment variables, then
            redeploy.
          </p>
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 px-6 py-3 bg-mark text-white rounded-lg font-medium text-sm hover:bg-mark-hover transition-colors disabled:opacity-60"
      >
        <Save className="w-4 h-4" />
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
