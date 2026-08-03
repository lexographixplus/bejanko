"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload, Mail, ImageIcon, Globe } from "lucide-react";
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
