import React, { useId } from "react";
import { LucideIcon, ChevronDown, Search, X } from "lucide-react";
import { cn } from "./cn";

/* Shared control skin: slate fill, hairline border, blue focus signature. */
const CONTROL =
  "w-full bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 disabled:opacity-50 dark:bg-slate-800/60 dark:border-slate-700 dark:focus:border-blue-500 dark:text-white";

/** Tiny wide-tracked label, the house style for every form field. */
export const FieldLabel: React.FC<{
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  /** Right-aligned slot (e.g. "Choose from Library" action). */
  action?: React.ReactNode;
  className?: string;
}> = ({ children, htmlFor, required, action, className }) => (
  <div className={cn("flex items-center justify-between", className)}>
    <label
      htmlFor={htmlFor}
      className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500"
    >
      {children}
      {required && <span className="ml-1 text-blue-600">*</span>}
    </label>
    {action}
  </div>
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  /** Compact metrics for filter bars. */
  dense?: boolean;
  /** Monospace text (URLs, IDs). */
  mono?: boolean;
  containerClassName?: string;
  labelAction?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon: Icon,
      error,
      dense,
      mono,
      className,
      containerClassName,
      labelAction,
      id: idProp,
      required,
      ...props
    },
    ref
  ) => {
    const autoId = useId();
    const id = idProp || autoId;
    return (
      <div className={cn("space-y-2.5", containerClassName)}>
        {label && (
          <FieldLabel htmlFor={id} required={required} action={labelAction}>
            {label}
          </FieldLabel>
        )}
        <div className="group relative">
          {Icon && (
            <Icon
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600",
                dense ? "left-3 h-4 w-4" : "left-4 h-4 w-4 md:left-5 md:h-5 md:w-5"
              )}
            />
          )}
          <input
            ref={ref}
            id={id}
            required={required}
            aria-invalid={!!error}
            className={cn(
              CONTROL,
              dense
                ? "py-2.5 text-sm font-medium"
                : "py-3.5 text-sm font-bold text-slate-900 md:py-4 md:text-base",
              Icon
                ? dense
                  ? "pl-10 pr-4"
                  : "pl-11 pr-5 md:pl-14 md:pr-6"
                : dense
                  ? "px-4"
                  : "px-5 md:px-6",
              mono && "font-mono text-xs font-normal",
              error && "border-red-400 focus:border-red-500 focus:ring-red-500/10",
              "placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="ml-1 text-[10px] font-bold text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelAction?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, className, containerClassName, labelAction, id: idProp, required, rows = 4, ...props },
    ref
  ) => {
    const autoId = useId();
    const id = idProp || autoId;
    return (
      <div className={cn("space-y-2.5", containerClassName)}>
        {label && (
          <FieldLabel htmlFor={id} required={required} action={labelAction}>
            {label}
          </FieldLabel>
        )}
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          required={required}
          aria-invalid={!!error}
          className={cn(
            CONTROL,
            "px-5 py-3.5 text-sm leading-relaxed text-slate-900 md:px-6 md:py-4 dark:text-white",
            "placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/10",
            className
          )}
          {...props}
        />
        {error && (
          <p className="ml-1 text-[10px] font-bold text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  dense?: boolean;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, dense, className, containerClassName, id: idProp, children, ...props },
    ref
  ) => {
    const autoId = useId();
    const id = idProp || autoId;
    return (
      <div className={cn("space-y-2.5", containerClassName)}>
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              CONTROL,
              "cursor-pointer appearance-none pr-10 font-bold text-slate-700 dark:text-slate-200",
              dense ? "py-2.5 pl-4 text-xs" : "py-3.5 pl-5 text-sm md:py-4 md:pl-6",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

/** Toggle switch with the tiny-caps label to its right. */
export const Switch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  tone?: "green" | "blue" | "indigo";
  disabled?: boolean;
}> = ({ checked, onChange, label, tone = "green", disabled }) => {
  const ON: Record<string, string> = {
    green: "bg-emerald-500",
    blue: "bg-blue-600",
    indigo: "bg-indigo-500",
  };
  return (
    <label
      className={cn(
        "group flex w-fit cursor-pointer items-center gap-3",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
          checked ? ON[tone] : "bg-slate-200 dark:bg-slate-700"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-6" : "left-1"
          )}
        />
      </button>
      {label && (
        <span className="text-xs font-bold text-slate-600 transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white">
          {label}
        </span>
      )}
    </label>
  );
};

/** Search input with icon + clear button, tuned for filter bars. */
export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = "Search…", className }) => (
  <div className={cn("group relative", className)}>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        CONTROL,
        "py-2.5 pl-10 text-sm font-medium",
        value ? "pr-9" : "pr-4",
        "placeholder:text-slate-400 dark:placeholder:text-slate-500"
      )}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);
