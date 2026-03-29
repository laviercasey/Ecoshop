import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CreditCard, Clock, Leaf, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api';
import { formatPrice } from '@shared/lib';
import { useSeo } from '@shared/hooks';
import { useAuthStore } from '@entities/user';

interface OrderItem {
  id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: number;
}

interface StatusHistoryEntry {
  old_status: string | null;
  new_status: string;
  comment: string | null;
  created_at: string;
}

interface ShippingAddress {
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  postal_code?: string;
}

interface OrderDetail {
  id: number;
  number: string;
  status: string;
  status_label: string;
  status_color: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_note: string | null;
  shipping_method: string;
  payment_method: string;
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_cost: number;
  total: number;
  tracking_number: string | null;
  created_at: string;
  items: OrderItem[];
  status_history: StatusHistoryEntry[];
}

const STATUS_COLORS: Record<string, string> = {
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-orange-50 text-orange-700',
  primary: 'bg-green-50 text-green-700',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
};

function formatAddress(address: ShippingAddress): string {
  const parts: string[] = [];
  if (address.postal_code) parts.push(address.postal_code);
  if (address.city) parts.push(`г. ${address.city}`);
  if (address.street) parts.push(`ул. ${address.street}`);
  if (address.building) parts.push(`д. ${address.building}`);
  if (address.apartment) parts.push(`кв. ${address.apartment}`);
  return parts.join(', ');
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const { data: order, isError: orderIsError } = useQuery<OrderDetail>({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/account/orders/${id}`);
      return data.data ?? data;
    },
    enabled: !!id,
  });

  useSeo({ title: order ? `Заказ ${order.number}` : 'Заказ' });

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  if (orderIsError) {
    return (
      <div className="text-center py-16 text-red-500">
        Не удалось загрузить заказ.{' '}
        <button onClick={() => window.location.reload()} className="underline hover:no-underline">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-green-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <Link
          to="/account"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-green-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Мои заказы
        </Link>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary">Заказ {order.number}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status_color] || 'bg-gray-50 text-gray-700'}`}
              >
                {order.status_label}
              </span>
            </div>
            <p className="mt-1 text-sm text-text-tertiary">от {order.created_at}</p>
          </div>
          {order.tracking_number && (
            <div className="flex items-center gap-2 rounded-lg border border-border-light bg-bg-surface px-4 py-2">
              <Truck className="h-4 w-4 text-green-primary" />
              <div>
                <p className="text-xs text-text-tertiary">Трек-номер</p>
                <p className="text-sm font-semibold text-text-primary">{order.tracking_number}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="lg:w-2/3">
            <div className="rounded-xl border border-border-light bg-bg-surface">
              <div className="border-b border-border-light px-5 py-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-primary" />
                  <h2 className="font-bold text-text-primary">Товары</h2>
                </div>
              </div>

              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-light text-left text-xs text-text-tertiary">
                      <th className="px-5 py-3 font-medium">Товар</th>
                      <th className="px-5 py-3 font-medium">Артикул</th>
                      <th className="px-5 py-3 text-center font-medium">Кол-во</th>
                      <th className="px-5 py-3 text-right font-medium">Цена</th>
                      <th className="px-5 py-3 text-right font-medium">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b border-border-light last:border-b-0">
                        <td className="px-5 py-4 text-sm font-medium text-text-primary">
                          {item.product_name}
                        </td>
                        <td className="px-5 py-4 text-sm text-text-tertiary">{item.product_sku}</td>
                        <td className="px-5 py-4 text-center text-sm text-text-secondary">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-text-secondary">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-semibold text-text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden">
                {order.items.map((item) => (
                  <div key={item.id} className="border-b border-border-light px-5 py-4 last:border-b-0">
                    <p className="text-sm font-medium text-text-primary">{item.product_name}</p>
                    <p className="mt-0.5 text-xs text-text-tertiary">Артикул: {item.product_sku}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-text-secondary">
                        {item.quantity} x {formatPrice(item.price)}
                      </span>
                      <span className="text-sm font-semibold text-text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.customer_note && (
              <div className="mt-4 rounded-xl border border-border-light bg-bg-surface p-5">
                <h3 className="text-sm font-bold text-text-primary">Комментарий к заказу</h3>
                <p className="mt-2 text-sm text-text-secondary">{order.customer_note}</p>
              </div>
            )}

            {order.status_history.length > 0 && (
              <div className="mt-4 rounded-xl border border-border-light bg-bg-surface p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-primary" />
                  <h2 className="font-bold text-text-primary">История статусов</h2>
                </div>
                <div className="relative">
                  <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px bg-border-light" />
                  <div className="space-y-4">
                    {order.status_history.map((entry) => (
                      <div key={`${entry.created_at}-${entry.new_status}`} className="relative flex gap-4 pl-6">
                        <div className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-green-primary bg-bg-surface" />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {entry.old_status && (
                              <>
                                <span className="text-sm text-text-tertiary">{entry.old_status}</span>
                                <span className="text-xs text-text-tertiary">&rarr;</span>
                              </>
                            )}
                            <span className="text-sm font-semibold text-text-primary">
                              {entry.new_status}
                            </span>
                          </div>
                          {entry.comment && (
                            <p className="mt-1 text-sm text-text-secondary">{entry.comment}</p>
                          )}
                          <p className="mt-1 text-xs text-text-tertiary">{entry.created_at}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:w-1/3">
            <div className="rounded-xl border border-border-light bg-bg-surface p-5">
              <h3 className="font-bold text-text-primary">Итого</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Подытог</span>
                  <span className="text-text-primary">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Доставка</span>
                  <span className="text-text-primary">
                    {order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Бесплатно'}
                  </span>
                </div>
                <div className="border-t border-border-light pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">Итого</span>
                    <span className="text-lg font-bold text-green-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-bg-surface p-5">
              <h3 className="font-bold text-text-primary">Покупатель</h3>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-text-primary">{order.customer_name}</p>
                <p className="text-text-secondary">{order.customer_email}</p>
                <p className="text-text-secondary">{order.customer_phone}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-bg-surface p-5">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-green-primary" />
                <h3 className="font-bold text-text-primary">Доставка</h3>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-text-primary">{order.shipping_method}</p>
                {order.shipping_address && (
                  <p className="text-text-secondary">{formatAddress(order.shipping_address)}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border-light bg-bg-surface p-5">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-primary" />
                <h3 className="font-bold text-text-primary">Оплата</h3>
              </div>
              <p className="mt-3 text-sm text-text-primary">{order.payment_method}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
