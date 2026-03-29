import { type ReactNode } from 'react';
import { Bell } from 'lucide-react';

interface AdminTopBarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminTopBar({ title, subtitle, actions }: AdminTopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E0E0E0] bg-white px-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-[20px] font-bold text-[#1A1A1A]">{title}</h1>
        {subtitle && <span className="text-[13px] text-[#7A7A7A]">{subtitle}</span>}
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#E0E0E0] text-[#7A7A7A] transition-colors hover:bg-[#FAFAF8]"
          title="Уведомления"
          aria-label="Уведомления"
        >
          <Bell className="h-4 w-4" />
        </button>
        {actions}
      </div>
    </header>
  );
}
