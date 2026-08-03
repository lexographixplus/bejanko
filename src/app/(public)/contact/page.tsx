import { Metadata } from "next";
import { ContactForm } from "@/components/shared/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with B.E. Janko Jnr.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <div className="max-w-xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight">
          Contact
        </h1>
        <p className="mt-4 text-soft text-lg leading-relaxed">
          Have something to say? A question, a thought, or just a note — I&apos;d
          love to hear from you.
        </p>

        <div className="mt-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
