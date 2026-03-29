import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@shared/lib';

interface AdminCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AdminCard({ className, children, ...props }: AdminCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#E0E0E0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
