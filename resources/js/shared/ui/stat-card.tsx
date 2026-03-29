import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@shared/lib';

interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  label,
  change,
  changeType = 'neutral',
  icon,
  iconBg,
  iconColor,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-[#7A7A7A]">{label}</p>
          <p className="mt-1 text-[24px] font-bold leading-tight text-[#1A1A1A]">{value}</p>
          <p className="mt-0.5 text-[13px] text-[#7A7A7A]">{title}</p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1">
          {changeType === 'positive' && <TrendingUp className="h-3 w-3 text-green-600" />}
          {changeType === 'negative' && <TrendingDown className="h-3 w-3 text-red-500" />}
          <span
            className={cn(
              'text-[12px] font-medium',
              changeType === 'positive' && 'text-green-600',
              changeType === 'negative' && 'text-red-500',
              changeType === 'neutral' && 'text-[#7A7A7A]',
            )}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}
