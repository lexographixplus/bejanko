import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-16 md:py-24", className)}
    >
      <div className="mx-auto max-w-[var(--shell)] px-6">
        {children}
      </div>
    </section>
  );
}
