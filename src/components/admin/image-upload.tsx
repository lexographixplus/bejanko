"use client";

import { useState } from "react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  aspect?: "square" | "portrait" | "landscape" | "banner";
  className?: string;
}

const aspectClasses = {
  square: "aspect-square w-24",
  portrait: "w-20 h-28",
  landscape: "aspect-video w-40",
  banner: "aspect-[3/1] w-full max-w-xs",
};

export function ImageUpload({
  value,
  onChange,
  label,
  hint,
  aspect = "landscape",
  className,
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-ink">{label}</label>
      )}

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div
          className={cn(
            "shrink-0 rounded-lg overflow-hidden bg-stone border border-rule flex items-center justify-center",
            aspectClasses[aspect]
          )}
        >
          {value ? (
            <Image
              src={value}
              alt="Upload preview"
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-soft/40" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            {cloudName ? (
              <CldUploadWidget
                signatureEndpoint="/api/upload"
                options={{
                  maxFiles: 1,
                  folder: "bejanko/images",
                  resourceType: "image",
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
                  maxFileSize: 5_000_000,
                }}
                onSuccess={(result) => {
                  setError(null);
                  if (
                    typeof result?.info === "object" &&
                    "secure_url" in result.info
                  ) {
                    onChange(result.info.secure_url as string);
                  }
                }}
                onError={() => setError("Upload failed. Please try again.")}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {value ? "Replace" : "Upload"}
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste image URL"
                className="flex-1 px-3 py-2 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark"
              />
            )}

            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="p-2 text-soft hover:text-red-500 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!cloudName && (
            <p className="text-xs text-amber-600">
              Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY to enable uploads.
            </p>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
          {hint && <p className="text-xs text-soft">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
