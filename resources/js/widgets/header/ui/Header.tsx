import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, ShoppingBag, User, Menu } from 'lucide-react';
import { cn } from '@shared/lib';
import { ROUTES } from '@shared/config';
import { useCartStore } from '@entities/cart';
import { useAuthStore } from '@entities/user';
import { MobileMenu } from './MobileMenu';

const NAV_LINKS: { href: string; label: string }[] = [
  { href: ROUTES.catalog, label: 'Каталог' },
  { href: ROUTES.about, label: 'О бренде' },
  { href: ROUTES.branding, label: 'Брендирование' },
  { href: ROUTES.delivery, label: 'Доставка' },
  { href: ROUTES.contacts, label: 'Контакты' },
];

export function Header() {
  const { isAuthenticated } = useAuthStore();
  const { pathname } = useLocation();
  const cartCount = useCartStore(state =>
    Object.values(state.items).reduce((sum, q) => sum + q, 0),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-border-light bg-bg-surface">
      <div className="flex h-full items-center justify-between px-6 lg:px-20">
        <Link to={ROUTES.home} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-primary">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-text-primary">EcoShop</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-[15px] font-medium transition-colors',
                (link.href === '/' ? pathname === '/' : pathname.startsWith(link.href))
                  ? 'text-green-primary'
                  : 'text-text-secondary hover:text-green-primary',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to={isAuthenticated ? ROUTES.account : ROUTES.login}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-border-light transition-colors hover:bg-green-subtle lg:flex"
          >
            <User className="h-5 w-5 text-text-secondary" />
          </Link>

          <Link
            to={ROUTES.cart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border-light transition-colors hover:bg-green-subtle"
          >
            <ShoppingBag className="h-5 w-5 text-text-secondary" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-orange-primary text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to={ROUTES.contacts}
            className="hidden rounded-lg bg-green-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-dark lg:block"
          >
            Заказать
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Открыть меню"
            className="rounded-lg p-2 text-text-secondary hover:bg-green-subtle lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
}
