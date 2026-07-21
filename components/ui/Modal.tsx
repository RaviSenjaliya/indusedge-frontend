import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "./cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Max width tier of the panel. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Slide up (forms) or zoom (pickers/confirms). */
  animation?: "slide" | "zoom";
  children: React.ReactNode;
  /** Extra classes on the panel (e.g. h-[80vh] for fixed-height pickers). */
  panelClassName?: string;
  /** Close when the backdrop is clicked. Default true. */
  closeOnBackdrop?: boolean;
}

const SIZES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

/**
 * Base modal: backdrop + centered panel, portaled to <body>.
 * Handles Escape-to-close and background scroll locking.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = "md",
  animation = "slide",
  children,
  panelClassName,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={closeOnBackdrop ? (e) => e.target === e.currentTarget && onClose() : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "flex max-h-[95vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900",
          SIZES[size],
          animation === "slide"
            ? "animate-in fade-in slide-in-from-bottom-8 duration-500"
            : "animate-in fade-in zoom-in-95 duration-200",
          panelClassName
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

/** Standard modal header: title + subtitle + close affordance. */
export const ModalHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose: () => void;
  className?: string;
}> = ({ title, subtitle, onClose, className }) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6 dark:border-slate-800",
      className
    )}
  >
    <div className="min-w-0">
      <h2 className="truncate text-base font-black text-slate-900 md:text-lg dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
    <button
      type="button"
      onClick={onClose}
      aria-label="Close dialog"
      className="ml-4 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <X className="h-5 w-5" />
    </button>
  </div>
);

/** Scrollable modal body. */
export const ModalBody: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      "custom-scrollbar flex-grow overflow-y-auto p-5 md:p-6",
      className
    )}
  >
    {children}
  </div>
);

/** Sticky modal footer for actions. */
export const ModalFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      "flex shrink-0 flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end md:px-6 dark:border-slate-800",
      className
    )}
  >
    {children}
  </div>
);
