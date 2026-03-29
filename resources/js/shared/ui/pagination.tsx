import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@shared/lib';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  links: PaginationLink[];
  className?: string;
}

export function Pagination({ links, className }: PaginationProps) {
  if (links.length <= 3) return null;

  return (
    <nav className={cn('flex items-center justify-center gap-1', className)}>
      {links.map((link, index) => {
        const isFirst = index === 0;
        const isLast = index === links.length - 1;

        if (!link.url) {
          return (
            <span
              key={link.url ?? `ellipsis-${index}`}
              aria-label={isFirst ? 'Предыдущая страница' : isLast ? 'Следующая страница' : undefined}
              aria-current={!isFirst && !isLast ? 'page' : undefined}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm text-text-tertiary"
            >
              {isFirst && <ChevronLeft aria-hidden="true" className="h-4 w-4" />}
              {isLast && <ChevronRight aria-hidden="true" className="h-4 w-4" />}
              {!isFirst && !isLast && <span>{link.label === '&hellip;' ? '…' : link.label}</span>}
            </span>
          );
        }

        const url = new URL(link.url, window.location.origin);
        const to = url.pathname + url.search;

        return (
          <Link
            key={link.url ?? link.label}
            to={to}
            aria-label={
              isFirst ? 'Предыдущая страница' : isLast ? 'Следующая страница' : `Страница ${link.label}`
            }
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
              link.active
                ? 'bg-green-primary text-white'
                : 'text-text-secondary hover:bg-green-subtle',
            )}
          >
            {isFirst && <ChevronLeft aria-hidden="true" className="h-4 w-4" />}
            {isLast && <ChevronRight aria-hidden="true" className="h-4 w-4" />}
            {!isFirst && !isLast && <span>{link.label === '&hellip;' ? '…' : link.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
