import { Metadata } from "next";
import { SubmitForm } from "@/components/shared/submit-form";

export const metadata: Metadata = {
  title: "Submit a Guest Piece",
  description: "Submit your writing to be published as a guest piece. No account needed.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <div className="max-w-xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight">
          Submit a Guest Piece
        </h1>
        <p className="mt-4 text-soft text-lg leading-relaxed">
          This space is open to guest writers. If you have something to say,
          we&apos;d love to read it.
        </p>

        {/* How it works */}
        <div className="mt-8 rounded-xl bg-stone/30 border border-rule p-6">
          <h2 className="font-display font-semibold text-ink mb-4">
            How it works
          </h2>
          <ol className="space-y-3 text-sm text-soft">
            <li className="flex gap-3">
              <span className="font-display font-bold text-mark shrink-0">01</span>
              <span>Write your piece below. Minimum 50 words.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-display font-bold text-mark shrink-0">02</span>
              <span>We&apos;ll read it and get back to you by email.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-display font-bold text-mark shrink-0">03</span>
              <span>If published, your name and bio appear with the piece. No account needed.</span>
            </li>
          </ol>
        </div>

        <div className="mt-10">
          <SubmitForm />
        </div>
      </div>
    </div>
  );
}
