import type { ReactNode } from 'react'

import { cn } from '@/utils/styles'

export interface TableColumn {
  key: string
  label: ReactNode
  className?: string
}

export interface TableProps<T> {
  columns: TableColumn[]
  data: T[]
  getRowKey: (item: T, index: number) => string
  renderRow: (item: T, index: number) => ReactNode
  emptyMessage?: ReactNode
  tableClassName?: string
  headerClassName?: string
  emptyRowClassName?: string
  resolveRowClassName?: (item: T, index: number) => string
}

export default function Table<T>({
  columns,
  data,
  getRowKey,
  renderRow,
  emptyMessage = 'No data available.',
  tableClassName = 'w-full table-fixed text-left',
  headerClassName = 'bg-surface-container text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase',
  emptyRowClassName = 'px-6 py-12 text-center text-muted-foreground',
  resolveRowClassName,
}: TableProps<T>) {
  return (
    <div className="w-full min-w-0">
      <table className={tableClassName}>
        <thead className={headerClassName}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn('px-6 py-4 align-middle', column.className)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr
                className={cn(
                  index % 2 === 0 ? 'bg-card' : 'bg-background',
                  resolveRowClassName?.(item, index),
                )}
                key={getRowKey(item, index)}
              >
                {renderRow(item, index)}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className={emptyRowClassName}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
