"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createColumns, AdminRequestRow } from "./Columns";
import { StatusUpdateDialog } from "./StatusUpdateDialog";
import { AssignOfficerDialog } from "./AssignOfficerDialog";
import { RequestDetailSheet } from "./RequestDetailSheet";

interface DataTableProps {
  data: AdminRequestRow[];
  officers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  }>;
}

export function AdminRequestsTable({ data, officers }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [statusDialogItem, setStatusDialogItem] = React.useState<AdminRequestRow | null>(null);
  const [assignDialogItem, setAssignDialogItem] = React.useState<AdminRequestRow | null>(null);
  const [viewDetailItem, setViewDetailItem] = React.useState<AdminRequestRow | null>(null);

  const columns = React.useMemo(
    () =>
      createColumns({
        onStatusClick: (row) => setStatusDialogItem(row),
        onAssignClick: (row) => setAssignDialogItem(row),
        onViewClick: (row) => setViewDetailItem(row),
      }),
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button nativeButton={false} render={<a href="/api/admin/export/csv" download />} variant="outline" size="sm" className="gap-2 h-9 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button nativeButton={false} render={<a href="/api/admin/export/pdf?preview=1" target="_blank" rel="noreferrer" />} variant="outline" size="sm" className="gap-2 h-9 text-xs">
            <Eye className="h-3.5 w-3.5" />
            <span>Preview PDF</span>
          </Button>
          <Button nativeButton={false} render={<a href="/api/admin/export/pdf" download />} variant="outline" size="sm" className="gap-2 h-9 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-muted-foreground">
                  No incident records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-2 text-xs text-muted-foreground">
        <div>
          Showing {table.getRowModel().rows.length} of {data.length} total dispatches
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 text-xs"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 text-xs"
          >
            Next
          </Button>
        </div>
      </div>

      <StatusUpdateDialog
        isOpen={!!statusDialogItem}
        onOpenChange={(open) => !open && setStatusDialogItem(null)}
        request={statusDialogItem}
      />

      <AssignOfficerDialog
        isOpen={!!assignDialogItem}
        onOpenChange={(open) => !open && setAssignDialogItem(null)}
        request={assignDialogItem}
        officers={officers}
      />

      <RequestDetailSheet
        isOpen={!!viewDetailItem}
        onOpenChange={(open) => !open && setViewDetailItem(null)}
        request={viewDetailItem}
      />
    </div>
  );
}
