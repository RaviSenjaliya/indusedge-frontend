import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AlertTriangle, Trash2, HelpCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { cn } from "./cn";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger → red visuals for destructive actions (the default). */
  tone?: "danger" | "warning" | "default";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

const TONE_ICON: Record<
  NonNullable<ConfirmOptions["tone"]>,
  { icon: React.FC<{ className?: string }>; wrap: string }
> = {
  danger: {
    icon: Trash2,
    wrap: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    wrap: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
  },
  default: {
    icon: HelpCircle,
    wrap: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
  },
};

/**
 * Promise-based confirm dialog:
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Delete product?", tone: "danger" })) { ... }
 */
export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setOptions(null);
  };

  const tone = options?.tone ?? "danger";
  const { icon: Icon, wrap } = TONE_ICON[tone];

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!options}
        onClose={() => settle(false)}
        size="sm"
        animation="zoom"
        panelClassName="rounded-2xl"
      >
        {options && (
          <div className="p-5 text-center">
            <div
              className={cn(
                "mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl",
                wrap
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1.5 text-lg font-black text-slate-900 dark:text-white">
              {options.title}
            </h3>
            {options.message && (
              <p className="mx-auto mb-5 max-w-xs text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                {options.message}
              </p>
            )}
            <div className={cn("flex gap-3", !options.message && "mt-5")}>
              <Button
                variant="subtle"
                fullWidth
                onClick={() => settle(false)}
                autoFocus
              >
                {options.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                variant={tone === "danger" ? "danger" : "primary"}
                fullWidth
                onClick={() => settle(true)}
              >
                {options.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
};
