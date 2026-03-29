import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FileText,
  Users,
  CreditCard,
  Truck,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@shared/lib';
import { useAuthStore } from '@entities/user';
import { ADMIN_ROUTES } from '@shared/config';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

const mainNav: NavItem[] = [
  { to: ADMIN_ROUTES.dashboard, label: 'Дашборд', icon: LayoutDashboard },
  { to: ADMIN_ROUTES.orders, label: 'Заказы', icon: ShoppingBag },
  { to: ADMIN_ROUTES.products, label: 'Каталог товаров', icon: Package },
  { to: ADMIN_ROUTES.content, label: 'Контент сайта', icon: FileText },
];

const settingsNav: NavItem[] = [
  { to: ADMIN_ROUTES.users, label: 'Пользователи', icon: Users },
  { to: ADMIN_ROUTES.payment, label: 'Оплата', icon: CreditCard },
  { to: ADMIN_ROUTES.delivery, label: 'Доставка', icon: Truck },
  { to: ADMIN_ROUTES.general, label: 'Общие настройки', icon: Settings },
];

interface AdminSidebarProps {
  ordersBadge?: number;
}

function SidebarNavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === ADMIN_ROUTES.dashboard}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-2.5 rounded-lg px-2 text-[14px] font-inter transition-colors',
          isActive
            ? 'bg-[rgba(139,195,74,0.12)] font-semibold text-[#8BC34A]'
            : 'text-[#FFFFFF80] hover:bg-[rgba(255,255,255,0.05)]',
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span
              className={cn(
                'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
                isActive
                  ? 'bg-[#8BC34A] text-white'
                  : 'bg-orange-500 text-white',
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function AdminSidebar({ ordersBadge }: AdminSidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const mainNavItems = mainNav.map((item) =>
    item.to === ADMIN_ROUTES.orders && ordersBadge
      ? { ...item, badge: ordersBadge }
      : item,
  );

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/admin/login');
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-[#1A2E1A]">
      <div className="flex items-center gap-3 border-b border-[#FFFFFF15] px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8BC34A]">
          <span className="text-[12px] font-bold text-white">ES</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold leading-tight text-white">EcoShop</span>
          <span className="text-[11px] text-[#FFFFFF60]">Панель управления</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#FFFFFF40]">
            Основное
          </p>
          <div className="flex flex-col gap-0.5">
            {mainNavItems.map((item) => (
              <SidebarNavItem key={item.to} item={item} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#FFFFFF40]">
            Настройки
          </p>
          <div className="flex flex-col gap-0.5">
            {settingsNav.map((item) => (
              <SidebarNavItem key={item.to} item={item} />
            ))}
          </div>
        </div>
      </nav>

      <div className="flex items-center gap-3 border-t border-[#FFFFFF15] px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8BC34A]">
          <span className="text-[12px] font-semibold text-white">{initials}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold text-white">
            {user?.name ?? 'Администратор'}
          </span>
          <span className="text-[11px] text-[#8BC34A]">{user?.roles?.[0] || 'Администратор'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="shrink-0 rounded-lg p-1.5 text-[#FFFFFF50] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
          title="Выйти"
          aria-label="Выйти"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
