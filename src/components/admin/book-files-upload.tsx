"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, FileText } from "lucide-react";
import { formatFileSize, FORMAT_BLURB, type BookFile } from "@/lib/books";
import { cn } from "@/lib/utils";

interface BookFilesUploadProps {
  value: BookFile[];
  onChange: (files: BookFile[]) => void;
}

const FORMATS: BookFile["format"][] = ["EPUB", "PDF"];

export function BookFilesUpload({ value, onChange }: BookFilesUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const configured =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  function put(file: BookFile) {
    // One file per format — uploading a new EPUB replaces the old one.
    onChange([...value.filter((f) => f.format !== file.format), file]);
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-xs text-soft">
          No files yet. Readers can only claim a book once something is attached.
        </p>
      )}

      {value.map((file) => (
        <div
          key={file.format}
          className="flex items-center gap-3 rounded-lg border border-rule bg-paper px-3.5 py-2.5"
        >
          <FileText className="w-4 h-4 text-mark shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink">
              {file.format}
              {formatFileSize(file.sizeBytes) && (
                <span className="text-soft font-normal">
                  {" "}
                  · {formatFileSize(file.sizeBytes)}
                </span>
              )}
            </p>
            <p className="text-xs text-soft truncate">
              {FORMAT_BLURB[file.format]}
            </p>
          </div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-soft hover:text-mark transition-colors shrink-0"
          >
            Open
          </a>
          <button
            type="button"
            onClick={() => onChange(value.filter((f) => f.format !== file.format))}
            className="p-1 text-soft hover:text-red-500 transition-colors shrink-0"
            aria-label={`Remove ${file.format}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      {configured ? (
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((format) => (
            <CldUploadWidget
              key={format}
              signatureEndpoint="/api/upload"
              options={{
                maxFiles: 1,
                folder: "bejanko/books",
                resourceType: "raw",
                maxFileSize: 25_000_000,
              }}
              onSuccess={(result) => {
                setError(null);
                if (
                  typeof result?.info === "object" &&
                  "secure_url" in result.info
                ) {
                  const info = result.info as {
                    secure_url: string;
                    bytes?: number;
                  };
                  put({
                    format,
                    url: info.secure_url,
                    sizeBytes: info.bytes,
                  });
                }
              }}
              onError={() => setError(`Could not upload the ${format}.`)}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-stone/50 transition-colors"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  {value.some((f) => f.format === format)
                    ? `Replace ${format}`
                    : `Upload ${format}`}
                </button>
              )}
            </CldUploadWidget>
          ))}
        </div>
      ) : (
        <p className="text-xs text-amber-600">
          Set the Cloudinary environment variables to enable uploads.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-soft">
        EPUB is offered to readers first — it reflows to fit a phone. PDF is the
        fallback that opens anywhere.
      </p>
    </div>
  );
}
