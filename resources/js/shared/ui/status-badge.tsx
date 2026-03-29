import { cn } from '@shared/lib';

type StatusKey = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface StatusBadgeProps {
  status: StatusKey | (string & {});
  label?: string;
  className?: string;
}

const statusStyles: Record<StatusKey, string> = {
  new: 'bg-orange-50 text-orange-600 border-orange-200',
  processing: 'bg-blue-50 text-blue-600 border-blue-200',
  shipped: 'bg-green-50 text-green-600 border-green-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const statusLabels: Record<StatusKey, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const styles = statusStyles[status as StatusKey] ?? 'bg-gray-50 text-gray-600 border-gray-200';
  const displayLabel = label ?? statusLabels[status as StatusKey] ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-tight',
        styles,
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}
