import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  count?: number;
  countLabel?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  count,
  countLabel,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("pb-10 border-b border-rule", className)}>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-soft text-lg max-w-xl">{description}</p>
          )}
        </div>
        {count !== undefined && (
          <p className="text-soft text-sm tabular-nums">
            {count} {countLabel || "entries"}
          </p>
        )}
      </div>
    </div>
  );
}
