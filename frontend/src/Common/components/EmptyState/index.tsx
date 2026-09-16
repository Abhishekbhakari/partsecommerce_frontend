import type { ReactNode } from "react";

interface EmptyStateProps {
  illustration: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Shared empty-state layout (illustration + title + description + optional action) — used for
 * empty cart / no orders / no search results / no wishlist per docs/PHASE2_ADDENDUM.md §4. */
export function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      {illustration}
      <p className="mt-3 text-base font-bold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
