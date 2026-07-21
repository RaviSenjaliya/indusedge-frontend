import React from "react";
import { cn } from "./cn";

/** Base shimmering placeholder block. */
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "skeleton-shimmer rounded-lg bg-slate-100 dark:bg-slate-800",
      className
    )}
  />
);

/** A few lines of fake text. */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn("space-y-2.5", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
      />
    ))}
  </div>
);

/** Card-shaped skeleton used in grids. */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
      className
    )}
  >
    <Skeleton className="mb-4 h-10 w-10 rounded-lg" />
    <Skeleton className="mb-3 h-5 w-2/3" />
    <SkeletonText lines={2} />
  </div>
);

/** Stat-tile skeleton row. */
export const SkeletonStat: React.FC = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-lg md:h-10 md:w-10" />
      <div className="min-w-0 flex-1">
        <Skeleton className="mb-2 h-6 w-16" />
        <Skeleton className="h-2 w-20" />
      </div>
    </div>
  </div>
);

/** Table body skeleton: N rows × M columns, wrapped in the standard table chrome. */
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 6, columns = 4, className }) => (
  <div className={cn("w-full", className)}>
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className="flex items-center gap-4 border-b border-slate-50 px-4 py-3 last:border-0 md:px-5 dark:border-slate-800/60"
      >
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton
            key={c}
            className={cn(
              "h-4",
              c === 0 ? "w-40" : c === columns - 1 ? "ml-auto w-16" : "w-24"
            )}
          />
        ))}
      </div>
    ))}
  </div>
);
