import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "./cn";

export type BadgeTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "slate"
  | "indigo";

const TONES: Record<BadgeTone, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900",
  green:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900",
  amber:
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
  red: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900",
  slate:
    "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  indigo:
    "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900",
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: LucideIcon;
  /** Renders a small pulsing dot before the text. */
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  tone = "slate",
  icon: Icon,
  dot = false,
  className,
  children,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest",
      TONES[tone],
      className
    )}
  >
    {dot && (
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
    )}
    {Icon && <Icon className="h-3 w-3" />}
    {children}
  </span>
);

/** Maps inquiry pipeline status → badge tone. Shared so all screens agree. */
export const INQUIRY_STATUS_TONE: Record<string, BadgeTone> = {
  NEW: "amber",
  CONTACTED: "blue",
  CLOSED: "green",
};

/** Maps inquiry pipeline status → display label. */
export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Archived",
};
