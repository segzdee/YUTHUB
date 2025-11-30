import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"
import { Checkbox } from "@/components/ui/checkbox"

export type Resident = {
  id: string
  name: string
  age: number
  room: string
  status: "active" | "pending" | "discharged"
  supportLevel: "low" | "medium" | "high"
  moveInDate: string
}

export const columns: ColumnDef<Resident>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "age",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
  },
  {
    accessorKey: "room",
    header: "Room",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "active"
              ? "success"
              : status === "pending"
              ? "warning"
              : "secondary"
          }
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "supportLevel",
    header: "Support Level",
    cell: ({ row }) => {
      const level = row.getValue("supportLevel") as string
      return (
        <Badge
          variant={
            level === "high"
              ? "error"
              : level === "medium"
              ? "warning"
              : "success"
          }
        >
          {level}
        </Badge>
      )
    },
  },
  {
    accessorKey: "moveInDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Move-in Date" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const resident = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(resident.id)}
            >
              Copy resident ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View resident</DropdownMenuItem>
            <DropdownMenuItem>Edit details</DropdownMenuItem>
            <DropdownMenuItem>View support plan</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

interface ResidentsTableProps {
  data: Resident[]
  onRowClick?: (resident: Resident) => void
}

export function ResidentsTable({ data, onRowClick }: ResidentsTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search residents..."
      onRowClick={onRowClick}
    />
  )
}
