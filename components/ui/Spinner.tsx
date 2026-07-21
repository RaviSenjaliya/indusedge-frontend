import React from "react";
import { cn } from "./cn";

export interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  /** Color of the moving arc. Defaults to brand blue. */
  tone?: "blue" | "white" | "slate" | "current";
}

const SIZES: Record<NonNullable<SpinnerProps["size"]>, string> = {
  xs: "h-4 w-4 border-2",
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-4",
  lg: "h-14 w-14 border-4",
};

const TONES: Record<NonNullable<SpinnerProps["tone"]>, string> = {
  blue: "border-blue-600 border-t-transparent",
  white: "border-white/40 border-t-white",
  slate: "border-slate-900 border-t-blue-600 dark:border-white dark:border-t-blue-500",
  current: "border-current border-t-transparent",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  tone = "blue",
  className,
}) => (
  <div
    role="status"
    aria-label="Loading"
    className={cn(
      "animate-spin rounded-full",
      SIZES[size],
      TONES[tone],
      className
    )}
  />
);

/** Full-area centered loader with an optional caption. */
export const Loader: React.FC<{ label?: string; className?: string }> = ({
  label = "Loading…",
  className,
}) => (
  <div className={cn("flex h-full min-h-[300px] items-center justify-center", className)}>
    <div className="flex flex-col items-center space-y-4">
      <Spinner size="md" tone="slate" />
      {label && (
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {label}
        </p>
      )}
    </div>
  </div>
);
