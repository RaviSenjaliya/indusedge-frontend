import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Layers,
  Package,
  Mail,
  Image as ImageIcon,
  CornerDownLeft,
  LucideIcon,
} from "lucide-react";
import { db } from "../../services/db";
import { cn } from "../ui";

interface PaletteItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  path: string;
  section: "Navigate" | "Products" | "Categories";
}

const NAV_ITEMS: PaletteItem[] = [
  { id: "nav-dash", label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard", section: "Navigate" },
  { id: "nav-sect", label: "Sections", icon: Layers, path: "/admin/sections", section: "Navigate" },
  { id: "nav-prod", label: "Products", icon: Package, path: "/admin/products", section: "Navigate" },
  { id: "nav-inq", label: "Inquiries", icon: Mail, path: "/admin/inquiries", section: "Navigate" },
  { id: "nav-media", label: "Media Assets", icon: ImageIcon, path: "/admin/media", section: "Navigate" },
];

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

/**
 * ⌘K / Ctrl+K quick-jump palette: navigate between admin modules and find
 * products/categories by name. Dataset is cached after the first open.
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [dataset, setDataset] = useState<{
    products: { id: string; name: string }[];
    categories: { id: string; name: string }[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load searchable dataset once, on first open.
  useEffect(() => {
    if (!open || dataset) return;
    let cancelled = false;
    Promise.all([db.getProducts(), db.getCategories()])
      .then(([p, c]) => {
        if (cancelled) return;
        setDataset({
          products: p.map((x) => ({ id: x.id, name: x.name })),
          categories: c.map((x) => ({ id: x.id, name: x.name })),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, dataset]);

  // Reset + focus on open; lock background scroll.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const nav = q
      ? NAV_ITEMS.filter((i) => i.label.toLowerCase().includes(q))
      : NAV_ITEMS;
    if (!q || q.length < 2 || !dataset) return nav;

    const prods: PaletteItem[] = dataset.products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        id: `p-${p.id}`,
        label: p.name,
        sublabel: "Open Products",
        icon: Package,
        path: "/admin/products",
        section: "Products" as const,
      }));
    const cats: PaletteItem[] = dataset.categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        id: `c-${c.id}`,
        label: c.name,
        sublabel: "Open Sections",
        icon: Layers,
        path: "/admin/sections",
        section: "Categories" as const,
      }));
    return [...nav, ...prods, ...cats];
  }, [query, dataset]);

  // Clamp the active row whenever the result set changes.
  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, items.length - 1)));
  }, [items.length]);

  const select = (item: PaletteItem) => {
    onClose();
    navigate(item.path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[active]) select(items[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Keep the active row visible while arrowing through results.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${active}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  let lastSection: string | null = null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] flex items-start justify-center bg-slate-950/60 p-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="animate-in fade-in zoom-in-95 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl duration-200 dark:border-slate-700 dark:bg-slate-900">
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Jump to a module or search the catalog…"
            className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          />
          <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-400 sm:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="custom-scrollbar max-h-[45vh] overflow-y-auto p-2"
        >
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
              No matches for “{query}”.
            </p>
          ) : (
            items.map((item, idx) => {
              const header =
                item.section !== lastSection ? item.section : null;
              lastSection = item.section;
              const Icon = item.icon;
              return (
                <React.Fragment key={item.id}>
                  {header && (
                    <p className="px-3 pb-1 pt-3 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {header}
                    </p>
                  )}
                  <button
                    type="button"
                    data-index={idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => select(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      idx === active
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        idx === active
                          ? "bg-white/15"
                          : "bg-slate-100 dark:bg-slate-800"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          idx === active
                            ? "text-white"
                            : "text-slate-500 dark:text-slate-400"
                        )}
                      />
                    </span>
                    <span className="min-w-0 flex-grow truncate text-sm font-bold">
                      {item.label}
                    </span>
                    {item.sublabel && (
                      <span
                        className={cn(
                          "shrink-0 text-[9px] font-black uppercase tracking-widest",
                          idx === active
                            ? "text-blue-100"
                            : "text-slate-400 dark:text-slate-500"
                        )}
                      >
                        {item.sublabel}
                      </span>
                    )}
                    {idx === active && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-blue-200" />
                    )}
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Hint footer */}
        <div className="flex items-center gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
          {[
            ["↑↓", "Navigate"],
            ["↵", "Open"],
            ["Esc", "Close"],
          ].map(([key, label]) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500"
            >
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 dark:border-slate-700 dark:bg-slate-900">
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
