import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { LucideIcon, Check, ChevronDown, Search } from "lucide-react";
import { cn } from "./cn";
import { FieldLabel } from "./Field";

/* Same control skin as Field.tsx so triggers sit flush next to Inputs. */
const CONTROL =
  "w-full bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 disabled:opacity-50 dark:bg-slate-800/60 dark:border-slate-700 dark:focus:border-blue-500";

/* Estimated panel height (search bar + list) used to decide flip direction. */
const PANEL_ESTIMATE = 320;

export interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: LucideIcon;
  required?: boolean;
  /** Included on the hidden input so native form validation still works. */
  name?: string;
  disabled?: boolean;
  error?: string;
  /** Show the filter box inside the panel. Defaults on for 8+ options. */
  searchable?: boolean;
  searchPlaceholder?: string;
  containerClassName?: string;
  buttonClassName?: string;
}

/**
 * Custom dropdown that replaces native <select> where the option list is long.
 * Renders the same panel on every device (no OS picker inconsistencies):
 * type-to-filter, arrow-key navigation, click-outside close, and it opens
 * upward automatically when the viewport has no room below the trigger.
 */
export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select…",
  label,
  icon: Icon,
  required,
  name,
  disabled,
  error,
  searchable,
  searchPlaceholder = "Type to filter…",
  containerClassName,
  buttonClassName,
}) => {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const showSearch = searchable ?? options.length >= 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const openPanel = useCallback(() => {
    if (disabled) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setOpenUp(below < PANEL_ESTIMATE && rect.top > below);
    }
    setQuery("");
    const current = options.indexOf(value);
    setHighlight(current >= 0 ? current : 0);
    setOpen(true);
  }, [disabled, options, value]);

  const closePanel = useCallback((refocus = false) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  const select = (option: string) => {
    onChange(option);
    closePanel(true);
  };

  /* Focus the filter box on open — but not on touch devices, where the
     software keyboard would cover the list. */
  useEffect(() => {
    if (!open || !showSearch) return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    searchRef.current?.focus();
  }, [open, showSearch]);

  /* Close on any press outside the component. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closePanel();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, closePanel]);

  /* Keep the highlighted row visible while arrowing through the list. */
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[highlight]?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setHighlight(0);
        break;
      case "End":
        e.preventDefault();
        setHighlight(filtered.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlight]) select(filtered[highlight]);
        break;
      case "Escape":
        e.preventDefault();
        closePanel(true);
        break;
      case "Tab":
        closePanel();
        break;
    }
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      openPanel();
    }
  };

  return (
    <div className={cn("space-y-2.5", containerClassName)} ref={rootRef}>
      {label && (
        <FieldLabel htmlFor={id} required={required}>
          {label}
        </FieldLabel>
      )}

      <div className="relative" onKeyDown={open ? onPanelKeyDown : undefined}>
        <button
          ref={buttonRef}
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-invalid={!!error}
          disabled={disabled}
          onClick={() => (open ? closePanel() : openPanel())}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            CONTROL,
            "group flex items-center gap-3 py-3.5 pr-10 text-left text-sm font-bold",
            Icon ? "pl-11" : "pl-4",
            value
              ? "text-slate-900 dark:text-white"
              : "font-medium text-slate-400 dark:text-slate-500",
            error &&
              "border-red-400 focus:border-red-500 focus:ring-red-500/10",
            buttonClassName
          )}
        >
          {Icon && (
            <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus:text-blue-600" />
          )}
          <span className="block truncate">{value || placeholder}</span>
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Invisible twin input so `required` still blocks native submit. */}
        {required && (
          <input
            required
            name={name}
            value={value}
            onChange={() => {}}
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
          />
        )}

        {open && (
          <div
            className={cn(
              "absolute left-0 right-0 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900",
              openUp ? "bottom-full mb-2" : "top-full mt-2"
            )}
          >
            {showSearch && (
              <div className="relative border-b border-slate-100 dark:border-slate-800">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            )}

            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={label || placeholder}
              className="max-h-60 overflow-y-auto overscroll-contain py-1.5"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm font-medium text-slate-400 dark:text-slate-500">
                  No matches found
                </li>
              ) : (
                filtered.map((option, i) => {
                  const selected = option === value;
                  return (
                    <li
                      key={option}
                      role="option"
                      aria-selected={selected}
                      onPointerMove={() => setHighlight(i)}
                      onClick={() => select(option)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm md:py-2.5",
                        i === highlight
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                          : "text-slate-700 dark:text-slate-200",
                        selected ? "font-black" : "font-medium"
                      )}
                    >
                      <span className="truncate">{option}</span>
                      {selected && <Check className="h-4 w-4 shrink-0" />}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <p className="ml-1 text-[10px] font-bold text-red-500">{error}</p>
      )}
    </div>
  );
};
