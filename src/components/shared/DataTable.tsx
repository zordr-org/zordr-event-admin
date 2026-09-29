'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  header: React.ReactNode
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  isError?: boolean
  emptyState?: React.ReactNode
  errorState?: React.ReactNode
  skeletonRows?: number
  className?: string
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  isError,
  emptyState = <div className="p-8 text-center text-muted-foreground">No results found.</div>,
  errorState = <div className="p-8 text-center text-destructive">Error loading data.</div>,
  skeletonRows = 5,
  className,
}: DataTableProps<T>) {
  if (isError) {
    return <div className={cn("border rounded-md", className)}>{errorState}</div>
  }

  return (
    <div className={cn("rounded-md border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead key={i} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                {columns.map((col, j) => (
                  <TableCell key={j} className={col.className}>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32">
                {emptyState}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}>
                    {col.cell ? col.cell(row) : (row as any)[col.accessorKey as string]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
