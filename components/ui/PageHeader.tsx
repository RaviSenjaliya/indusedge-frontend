import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "./cn";

/**
 * Standard admin page header: title block on the left, actions on the right.
 * Stacks on mobile; actions become full-width buttons.
 */
export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  /** Right-aligned slot: buttons, status chips. */
  actions?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, actions, className }) => (
  <div
    className={cn(
      "flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
      className
    )}
  >
    <div>
      <h1 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
    {actions && (
      <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        {actions}
      </div>
    )}
  </div>
);

/** Empty state block: dashed card, muted icon, headline, hint, action. */
export const EmptyState: React.FC<{
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
  /** Render the dashed-card chrome. Off when nested inside DataTable/Card. */
  framed?: boolean;
  className?: string;
}> = ({ icon: Icon, title, message, action, framed = false, className }) => (
  <div
    className={cn(
      framed &&
        "rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 shadow-sm md:p-12 dark:border-slate-700 dark:bg-slate-900",
      "text-center",
      className
    )}
  >
    <div className="mx-auto max-w-md">
      {Icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 md:h-14 md:w-14 dark:bg-slate-800">
          <Icon className="h-6 w-6 text-slate-300 md:h-7 md:w-7 dark:text-slate-600" />
        </div>
      )}
      <h3 className="mb-1.5 text-base font-black text-slate-900 dark:text-white">
        {title}
      </h3>
      {message && (
        <p className="mb-6 text-xs font-medium text-slate-400 dark:text-slate-500">
          {message}
        </p>
      )}
      {action}
    </div>
  </div>
);
