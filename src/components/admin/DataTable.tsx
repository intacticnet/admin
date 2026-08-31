'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ---- Types ----

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

// ---- Skeleton Loader ----

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {/* Desktop skeleton rows */}
      <div className="hidden md:block">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 border-b px-4 py-3"
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={c === 0 ? 'h-4 w-40' : 'h-4 w-28'}
              />
            ))}
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
      {/* Mobile skeleton cards */}
      <div className="md:hidden flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ---- Delete Confirmation ----

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This item will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Main Component ----

export function DataTable<T extends object>({
  columns,
  data,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = 'No items found.',
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* ---- Desktop Table ---- */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b text-left">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr
                  key={(item as any).id as string ?? idx}
                  className={`border-b transition-colors hover:bg-muted/50 ${
                    idx % 2 === 1 ? 'bg-muted/20' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 whitespace-nowrap max-w-[300px] truncate"
                    >
                      {col.render
                        ? col.render(item)
                        : String((item as any)[col.key] ?? '')}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(item)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteButton onDelete={() => onDelete(item)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Mobile Cards ---- */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((item, idx) => (
          <div
            key={(item as any).id as string ?? idx}
            className="rounded-lg border bg-card p-4 space-y-3"
          >
            {/* First column as card title */}
            <div className="font-medium text-sm">
              {columns[0]?.render
                ? columns[0].render(item)
                : String((item as any)[columns[0]?.key] ?? '')}
            </div>

            {/* Remaining columns */}
            <div className="space-y-1">
              {columns.slice(1).map((col) => (
                <div key={col.key} className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">
                    {col.label}
                  </span>
                  <span className="text-xs text-right truncate max-w-[60%]">
                    {col.render
                      ? col.render(item)
                      : String((item as any)[col.key] ?? '')}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() => onEdit(item)}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
              <DeleteButton onDelete={() => onDelete(item)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
