import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "./cn";

export type IconButtonVariant =
  | "default"
  | "primary"
  | "danger"
  | "ghost"
  | "dark";
export type IconButtonSize = "sm" | "md" | "lg";

const SIZES: Record<IconButtonSize, { pad: string; icon: string }> = {
  sm: { pad: "p-2 rounded-lg", icon: "h-4 w-4" },
  md: { pad: "p-2.5 rounded-lg", icon: "h-4 w-4" },
  lg: { pad: "p-3 rounded-lg", icon: "h-5 w-5" },
};

const VARIANTS: Record<IconButtonVariant, string> = {
  default:
    "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300",
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25",
  danger:
    "bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400",
  ghost:
    "bg-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white",
  dark: "bg-white/10 text-white hover:bg-white/20",
};

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Accessible label — also used as the native tooltip. */
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { icon: Icon, variant = "default", size = "md", label, className, type = "button", ...props },
    ref
  ) => {
    const s = SIZES[size];
    return (
      <button
        ref={ref}
        type={type}
        title={label}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
          s.pad,
          VARIANTS[variant],
          className
        )}
        {...props}
      >
        <Icon className={s.icon} />
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
