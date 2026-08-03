"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Paperclip } from "lucide-react";
import { VoteForm } from "@/components/shared/vote-form";

interface ExpandableEntryProps {
  id: string;
  title: string;
  entrantName: string;
  entryNumber: number | null;
  content: string;
  fileName?: string | null;
  fileUrl?: string | null;
  canVote?: boolean;
}

export function ExpandableEntry({
  id,
  title,
  entrantName,
  entryNumber,
  content,
  fileName,
  fileUrl,
  canVote = false,
}: ExpandableEntryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-rule bg-surface transition-colors hover:border-rule">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-stone/20 transition-colors rounded-xl"
        aria-expanded={expanded}
        aria-controls={`entry-${id}`}
      >
        {entryNumber !== null && (
          <span className="font-mono text-xs text-soft shrink-0">
            #{entryNumber}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display font-medium text-ink">{title}</p>
          <p className="text-xs text-soft mt-0.5">by {entrantName}</p>
        </div>
        <span className="text-xs font-medium text-mark shrink-0 flex items-center gap-1">
          {expanded ? (
            <>
              Close <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              {canVote ? "Read & Vote" : "Read"}{" "}
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </span>
      </button>

      {expanded && (
        <div id={`entry-${id}`} className="px-4 pb-5 border-t border-rule/50">
          <div
            className="prose mt-4 text-sm"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-mark hover:text-mark-hover transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              {fileName || "Attached file"}
            </a>
          )}

          {canVote && <VoteForm entryId={id} entryTitle={title} />}
        </div>
      )}
    </div>
  );
}
