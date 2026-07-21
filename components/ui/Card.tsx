import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "./cn";

/** Standard white content card with the industrial rounding. */
export const Card: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    /** Reduce padding for dense areas (tables, filter bars). */
    padding?: "none" | "sm" | "md" | "lg";
  }
> = ({ padding = "md", className, children, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-100 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900",
      padding === "sm" && "p-3",
      padding === "md" && "p-4 md:p-5",
      padding === "lg" && "p-5 md:p-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

/** Dark feature panel with the signature blue glow. */
export const GlowPanel: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { padding?: "md" | "lg" }
> = ({ padding = "md", className, children, ...props }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl dark:border dark:border-slate-800",
      padding === "md" && "p-5 md:p-6",
      padding === "lg" && "p-6 md:p-7",
      className
    )}
    {...props}
  >
    <div className="absolute right-0 top-0 -mr-12 -mt-12 h-24 w-24 rounded-full bg-blue-600/20 blur-3xl" />
    <div className="relative z-10">{children}</div>
  </div>
);

/** KPI stat tile: icon-in-tile, big number, tiny label. */
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  tone?: "blue" | "indigo" | "amber" | "green" | "red" | "slate";
  className?: string;
}

const STAT_TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  green:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  red: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  tone = "blue",
  className,
}) => (
  <div
    className={cn(
      "group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:shadow-slate-200/50 md:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/30",
      className
    )}
  >
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 md:h-10 md:w-10",
          STAT_TONES[tone]
        )}
      >
        <Icon className="h-4 w-4 md:h-5 md:w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-black leading-none text-slate-900 md:text-2xl dark:text-white">
          {value}
        </div>
        <div className="mt-1 text-[8px] font-black uppercase tracking-widest text-slate-400 md:text-[9px] dark:text-slate-500">
          {label}
        </div>
      </div>
    </div>
  </div>
);
