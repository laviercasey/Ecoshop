import { Link, useLocation } from 'react-router-dom';
import { cn } from '@shared/lib';
import { ROUTES } from '@shared/config';
import { Drawer } from '@shared/ui';

const NAV_LINKS = [
  { href: ROUTES.home, label: 'Главная' },
  { href: ROUTES.catalog, label: 'Каталог' },
  { href: ROUTES.about, label: 'О бренде' },
  { href: ROUTES.branding, label: 'Брендирование' },
  { href: ROUTES.delivery, label: 'Доставка' },
  { href: ROUTES.contacts, label: 'Контакты' },
];

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { pathname } = useLocation();

  return (
    <Drawer open={open} onClose={onClose} side="left">
      <div className="flex flex-col px-4 pb-6">
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={onClose}
              className={cn(
                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  ? 'bg-green-subtle text-green-dark'
                  : 'text-text-primary hover:bg-green-subtle hover:text-green-dark',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </Drawer>
  );
}
