import React from "react";
import { cn } from "./cn";
import { SkeletonTable } from "./Skeleton";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  /** Cell renderer. */
  render: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  /** Extra classes on both th and td (e.g. hidden md:table-cell). */
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  /** Shown when rows is empty and not loading. */
  empty?: React.ReactNode;
  /** min-width of the table for horizontal scroll on small screens. */
  minWidth?: string;
  className?: string;
}

const ALIGN: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * The standard admin table: card chrome, tiny-caps header row, hairline
 * dividers, hover rows, skeleton loading and empty-state slots built in.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading = false,
  empty,
  minWidth = "700px",
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-colors md:rounded-2xl dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {loading ? (
        <SkeletonTable rows={6} columns={Math.min(columns.length, 5)} />
      ) : rows.length === 0 ? (
        <div className="flex flex-grow items-center justify-center p-8 text-center md:p-12">
          {empty}
        </div>
      ) : (
        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth }}>
            <thead className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 md:px-5 md:text-[10px] dark:text-slate-500",
                      ALIGN[col.align ?? "left"],
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "group transition-colors",
                    onRowClick &&
                      "cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 md:px-5",
                        ALIGN[col.align ?? "left"],
                        col.className
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
