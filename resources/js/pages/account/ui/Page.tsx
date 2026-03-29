import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Package, LogOut, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api';
import { useSeo } from '@shared/hooks';
import { useAuthStore } from '@entities/user';

interface Order {
  id: number;
  number: string;
  status: string;
  status_label: string;
  status_color: string;
  total: number;
  items_count: number;
  created_at: string;
}

interface OrdersPage {
  data: Order[];
  links: { url: string | null; label: string; active: boolean }[];
  current_page: number;
  last_page: number;
}

const STATUS_COLORS: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-orange-50 text-orange-700',
  primary: 'bg-green-50 text-green-700',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
};

export default function Page() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: orders } = useQuery<OrdersPage>({
    queryKey: ['account-orders'],
    queryFn: async () => {
      const { data } = await api.get('/account/orders');
      return data;
    },
    enabled: isAuthenticated,
  });

  useSeo({ title: 'Личный кабинет' });

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-green-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ordersData = orders?.data ?? [];

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border-light bg-bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-primary">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">EcoShop</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/catalog" className="hidden text-sm text-text-secondary transition-colors hover:text-green-primary sm:block">
              Каталог
            </Link>
            <Link to="/cart" className="hidden text-sm text-text-secondary transition-colors hover:text-green-primary sm:block">
              Корзина
            </Link>
            <button
              onClick={handleLogout}
              aria-label="Выйти"
              className="flex cursor-pointer items-center gap-1.5 text-sm text-text-tertiary transition-colors hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-xl border border-border-light bg-bg-surface p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-primary text-lg font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">{user.name}</h1>
              <p className="text-sm text-text-tertiary">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <Package className="h-5 w-5 text-green-primary" />
            <h2 className="text-lg font-bold text-text-primary">Мои заказы</h2>
          </div>

          {ordersData.length === 0 ? (
            <div className="rounded-xl border border-border-light bg-bg-surface px-6 py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-text-tertiary" />
              <p className="mt-4 text-text-secondary">У вас пока нет заказов</p>
              <Link
                to="/catalog"
                className="mt-4 inline-block rounded-lg bg-green-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-dark"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ordersData.map((order) => (
                <Link
                  key={order.id}
                  to={`/account/orders/${order.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-border-light bg-bg-surface p-4 transition-colors hover:border-green-primary/30 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex items-center gap-3 sm:gap-6">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{order.number}</p>
                      <p className="mt-0.5 text-xs text-text-tertiary">{order.created_at}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status_color] || 'bg-gray-50 text-gray-700'}`}
                    >
                      {order.status_label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:gap-6">
                    <div className="sm:text-right">
                      <p className="text-sm font-bold text-text-primary">
                        {new Intl.NumberFormat('ru-RU').format(order.total)} ₽
                      </p>
                      <p className="text-xs text-text-tertiary">{order.items_count} тов.</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-tertiary" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
