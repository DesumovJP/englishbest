"use client";

import { ReactNode, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  /** If provided, column becomes sortable using this selector. */
  sortBy?: (row: T) => string | number | Date;
  align?: "left" | "right" | "center";
  width?: string;
}

interface DataTableProps<T> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  /** Stable row identifier. Required for React keys. */
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  className?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  empty,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortBy) return rows;
    const arr = [...rows];
    arr.sort((a, b) => {
      const av = col.sortBy!(a);
      const bv = col.sortBy!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rows, columns, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  if (rows.length === 0 && empty !== undefined) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div className={cn("ios-list", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface border-b border-border">
            {columns.map((col) => {
              const sortable = Boolean(col.sortBy);
              const active = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  style={{ width: col.width }}
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-wide text-ink-muted px-4 py-2.5",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    !col.align && "text-left",
                    sortable && "cursor-pointer select-none hover:text-ink",
                  )}
                  onClick={sortable ? () => toggleSort(col.key) : undefined}
                >
                  {col.header}
                  {sortable && (
                    <span aria-hidden className="ml-1 text-[10px]">
                      {active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-border last:border-0 bg-surface-raised",
                onRowClick && "cursor-pointer hover:bg-surface-hover transition-colors",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-2.5 text-sm text-ink",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
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
  );
}
