import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MobileTableProps {
  title: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    hideOnMobile?: boolean;
  }[];
  onRowClick?: (row: any) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function MobileTable({ 
  title, 
  data, 
  columns, 
  onRowClick, 
  actions, 
  className 
}: MobileTableProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.key}
                    className="text-left p-3 text-gray-700 font-medium text-sm"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr 
                  key={index}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="p-3 text-gray-600 text-sm">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="block md:hidden space-y-3">
          {data.map((row, index) => (
            <Card 
              key={index} 
              className={cn(
                "p-4 border border-gray-200 rounded-lg",
                onRowClick && "cursor-pointer hover:shadow-md transition-shadow touch-target"
              )}
              onClick={() => onRowClick?.(row)}
            >
              <div className="space-y-2">
                {columns
                  .filter(column => !column.hideOnMobile)
                  .map((column) => (
                    <div key={column.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {column.label}:
                      </span>
                      <span className="text-sm text-gray-600">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}