"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Paperclip, X } from "lucide-react";

interface UploadedFile {
  url: string;
  name: string;
}

interface FileUploadProps {
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  label?: string;
}

/**
 * Public-facing attachment picker for contest entries. Signs through the
 * folder-pinned public endpoint rather than the admin one.
 */
export function FileUpload({ value, onChange, label }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const configured =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!configured) {
    return (
      <p className="text-xs text-amber-600">
        File uploads are unavailable right now — please paste your entry as text.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <span className="block text-sm font-medium text-ink">{label}</span>
      )}

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-rule bg-surface px-4 py-3">
          <Paperclip className="w-4 h-4 text-mark shrink-0" />
          <a
            href={value.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 truncate text-sm text-ink hover:text-mark transition-colors"
          >
            {value.name}
          </a>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1 text-soft hover:text-red-500 transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <CldUploadWidget
          signatureEndpoint="/api/upload/contest"
          options={{
            maxFiles: 1,
            folder: "bejanko/contest-entries",
            resourceType: "auto",
            clientAllowedFormats: ["pdf", "doc", "docx", "txt", "rtf", "odt"],
            maxFileSize: 10_000_000,
          }}
          onSuccess={(result) => {
            setError(null);
            if (typeof result?.info === "object" && "secure_url" in result.info) {
              const info = result.info as {
                secure_url: string;
                original_filename?: string;
                format?: string;
              };
              onChange({
                url: info.secure_url,
                name: info.original_filename
                  ? `${info.original_filename}${info.format ? `.${info.format}` : ""}`
                  : "Attachment",
              });
            }
          }}
          onError={() => setError("Upload failed. Please try again.")}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              Choose file
            </button>
          )}
        </CldUploadWidget>
      )}

      <p className="text-xs text-soft">
        PDF, Word or plain text. Up to 10 MB.
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
