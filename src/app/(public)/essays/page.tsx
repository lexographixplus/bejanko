import { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EssayCard } from "@/components/shared/cards";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { getEssays } from "@/lib/actions/essays";

export const metadata: Metadata = {
  title: "Essays",
  description: "Long-form essays on language, meaning, and the quiet work of paying attention.",
};

export default async function EssaysPage() {
  const essays = await getEssays({ published: true });

  return (
    <div className="mx-auto max-w-[var(--shell)] px-6 py-12">
      <PageHeader
        title="Essays"
        description="Long-form writing on language, meaning, and the quiet work of paying attention."
        count={essays.length}
        countLabel="essays"
      />

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {essays.map((essay, i) => (
          <ScrollReveal key={essay.slug} delay={i * 80}>
            <EssayCard {...essay} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
