import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "./cn";

export type ToastKind = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}

interface ToastApi {
  toast: (kind: ToastKind, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

const KIND_STYLES: Record<
  ToastKind,
  { icon: React.FC<{ className?: string }>; iconWrap: string; bar: string }
> = {
  success: {
    icon: CheckCircle2,
    iconWrap:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    iconWrap: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400",
    bar: "bg-red-500",
  },
  info: {
    icon: Info,
    iconWrap: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
    bar: "bg-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    iconWrap:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
    bar: "bg-amber-500",
  },
};

const AUTO_DISMISS_MS = 4500;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, kind, title, message }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const api: ToastApi = {
    toast,
    success: (t, m) => toast("success", t, m),
    error: (t, m) => toast("error", t, m),
    info: (t, m) => toast("info", t, m),
    warning: (t, m) => toast("warning", t, m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
        >
          {toasts.map((t) => {
            const s = KIND_STYLES[t.kind];
            const Icon = s.icon;
            return (
              <div
                key={t.id}
                role="status"
                className="toast-in pointer-events-auto relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 pr-10 shadow-2xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800 dark:shadow-black/40"
              >
                <span className={cn("absolute inset-y-0 left-0 w-1", s.bar)} />
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    s.iconWrap
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {t.title}
                  </p>
                  {t.message && (
                    <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                      {t.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};
