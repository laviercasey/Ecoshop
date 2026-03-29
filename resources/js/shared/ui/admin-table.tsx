import { type ReactNode } from 'react';
import { cn } from '@shared/lib';
import { Skeleton } from './skeleton';

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T, index: number) => ReactNode;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string | number;
  className?: string;
}

export function AdminTable<T>({
  columns,
  data,
  loading = false,
  skeletonRows = 5,
  emptyMessage = 'Нет данных',
  onRowClick,
  rowKey,
  className,
}: AdminTableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#E0E0E0] bg-[#FAFAF8]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-[#7A7A7A]"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="border-b border-[#F0F0EC]">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-[13px] text-[#7A7A7A]"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            data.map((row, index) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-[#F0F0EC] transition-colors hover:bg-[#FAFAF8]',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 font-inter text-[13px] text-[#3D3D3D]"
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
