"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, UserCheck, CheckCircle, Eye } from "lucide-react";
import {
    Badge, 
    Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui";
import { RequestStatus, Priority } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminRequestRow = any;

interface ColumnProps {
  onStatusClick: (row: AdminRequestRow) => void;
  onAssignClick: (row: AdminRequestRow) => void;
  onViewClick: (row: AdminRequestRow) => void;
}

export function createColumns({
  onStatusClick,
  onAssignClick,
  onViewClick,
}: ColumnProps): ColumnDef<AdminRequestRow>[] {
  return [
    {
      accessorKey: "referenceNumber",
      header: "Reference",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.getValue("referenceNumber")}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 text-xs font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title & Department
          <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => {
        const title: string = row.getValue("title");
        const categoryName: string = row.original.category.name;
        return (
          <div className="space-y-0.5 max-w-55">
            <p className="font-medium text-xs truncate" title={title}>
              {title}
            </p>
            <Badge variant="outline" className="text-[10px]">
              {categoryName}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as RequestStatus;
        switch (status) {
          case RequestStatus.RESOLVED:
            return <Badge variant="default" className="text-[10px]">Resolved</Badge>;
          case RequestStatus.IN_PROGRESS:
            return <Badge variant="secondary" className="text-[10px]">In Progress</Badge>;
          case RequestStatus.IN_REVIEW:
            return <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-500">In Review</Badge>;
          case RequestStatus.REJECTED:
            return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
          default:
            return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
        }
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as Priority;
        const isUrgent = priority === Priority.URGENT;
        const isHigh = priority === Priority.HIGH;

        return (
          <Badge
            variant={isUrgent ? "destructive" : isHigh ? "secondary" : "outline"}
            className="text-[10px] uppercase font-bold"
          >
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: "slaDueDate",
      header: "SLA Deadline",
      cell: ({ row }) => {
        const dueDate = new Date(row.original.slaDueDate);
        const isResolved = row.original.status === RequestStatus.RESOLVED;
        const isBreached = !isResolved && new Date() > dueDate;

        return (
          <div className="space-y-0.5 text-xs">
            <span className={isBreached ? "text-destructive font-bold" : "text-muted-foreground"}>
              {dueDate.toLocaleDateString()}
            </span>
            {isBreached && (
              <p className="text-[10px] font-bold uppercase text-destructive tracking-tight">
                Breach Alert
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Officer",
      cell: ({ row }) => {
        const officer = row.original.assignedTo;
        if (!officer) {
          return <span className="text-xs text-muted-foreground italic">Unassigned</span>;
        }
        return (
          <span className="text-xs font-medium text-foreground">
            {officer.fullName}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-input bg-background h-8 w-8 text-sm hover:bg-accent focus:outline-hidden">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs font-semibold">Triage Action</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onViewClick(item)}>
                <Eye className="mr-2 h-3.5 w-3.5" />
                <span>View Full Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusClick(item)}>
                <CheckCircle className="mr-2 h-3.5 w-3.5" />
                <span>Update Status</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignClick(item)}>
                <UserCheck className="mr-2 h-3.5 w-3.5" />
                <span>Assign Officer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
