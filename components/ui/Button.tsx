import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "./cn";
import { Spinner } from "./Spinner";

export type ButtonVariant =
  | "primary" // solid blue
  | "dark" // slate-900 → blue on hover (the workhorse CTA)
  | "subtle" // light grey fill
  | "ghost" // transparent
  | "danger" // destructive
  | "outline"; // bordered

export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 whitespace-nowrap";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-[10px] rounded-lg",
  md: "px-4 py-2.5 text-xs rounded-lg md:rounded-xl",
  lg: "px-6 py-3 text-xs md:text-sm rounded-xl",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25",
  dark: "bg-slate-900 text-white hover:bg-blue-600 shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-600 dark:hover:text-white",
  subtle:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25 dark:bg-red-600 dark:text-white dark:hover:bg-red-700",
  outline:
    "bg-transparent text-slate-700 border border-slate-200 hover:border-blue-500 hover:text-blue-600 dark:text-slate-200 dark:border-slate-700 dark:hover:border-blue-500",
};

/** Reusable class string so <Link> can be styled identically to <Button>. */
export function buttonClass(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}): string {
  const { variant = "primary", size = "md", fullWidth, className } = opts || {};
  return cn(BASE, SIZES[size], VARIANTS[variant], fullWidth && "w-full", className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth,
      loading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={buttonClass({ variant, size, fullWidth, className })}
        {...props}
      >
        {loading ? (
          <Spinner size="xs" tone="current" />
        ) : (
          LeftIcon && <LeftIcon className={iconSize} />
        )}
        {children}
        {!loading && RightIcon && <RightIcon className={iconSize} />}
      </button>
    );
  }
);
Button.displayName = "Button";
