"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload, Mail, ImageIcon, Globe } from "lucide-react";
import { toast } from "sonner";
import { updateSettings } from "@/lib/actions/settings";
import { ImageUpload } from "./image-upload";

interface SettingsFormProps {
  settings: Record<string, string>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
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
            defaultValue={settings.siteName ?? "B.E. Janko Jnr"}
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

        <div>
          <label
            htmlFor="cloudinaryCloudName"
            className="block text-sm font-medium text-ink mb-2"
          >
            Cloud Name
          </label>
          <input
            id="cloudinaryCloudName"
            name="cloudinaryCloudName"
            type="text"
            defaultValue={settings.cloudinaryCloudName ?? ""}
            placeholder="your-cloud-name"
            className="w-full px-4 py-3 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
          />
          <p className="mt-1 text-xs text-soft">
            Required for image uploads. Find it in your Cloudinary dashboard.
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
