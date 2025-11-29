import * as React from "react"
import { cn } from "@/lib/utils"

const MobileTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full space-y-2", className)}
    {...props}
  />
))
MobileTable.displayName = "MobileTable"

const MobileTableRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card p-4 space-y-2 shadow-sm",
      className
    )}
    {...props}
  />
))
MobileTableRow.displayName = "MobileTableRow"

const MobileTableCell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label?: string
  }
>(({ className, label, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex justify-between items-start", className)} {...props}>
    {label && (
      <span className="text-sm font-medium text-muted-foreground mr-2">
        {label}:
      </span>
    )}
    <span className="text-sm text-right flex-1">{children}</span>
  </div>
))
MobileTableCell.displayName = "MobileTableCell"

const MobileTableHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold text-base mb-2", className)}
    {...props}
  />
))
MobileTableHeader.displayName = "MobileTableHeader"

export {
  MobileTable,
  MobileTableRow,
  MobileTableCell,
  MobileTableHeader,
}
