import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, Clock, User, Truck, CreditCard, Loader2 } from 'lucide-react';
import { api } from '@shared/api';
import { formatPrice, formatDate } from '@shared/lib';
import { useAdminPage } from '@shared/hooks';
import { AdminCard, StatusBadge, useToast } from '@shared/ui';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface StatusHistoryEntry {
  old_status: string | null;
  old_status_label: string | null;
  new_status: string;
  new_status_label: string;
  comment: string | null;
  created_at: string;
}

interface OrderDetail {
  id: number;
  number: string;
  status: string;
  status_label: string;
  status_color: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_note: string | null;
  shipping_method: string;
  shipping_method_label: string;
  payment_method: string;
  payment_method_label: string;
  shipping_address: string | { city?: string; street?: string; building?: string } | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  tracking_number: string | null;
  items: OrderItem[];
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
}

interface OrderResponse {
  order: OrderDetail;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменён' },
] as const;

const TIMELINE_DOT_COLORS: Record<string, string> = {
  new: 'bg-orange-400',
  processing: 'bg-blue-400',
  shipped: 'bg-green-400',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-400',
};

function formatAddress(addr: OrderDetail['shipping_address']): string | null {
  if (!addr) return null;
  if (typeof addr === 'string') return addr;
  return [addr.city, addr.street, addr.building].filter(Boolean).join(', ') || null;
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setPageMeta } = useAdminPage();
  const { addToast } = useToast();

  const [newStatus, setNewStatus] = useState('');

  const { data, isLoading, isError } = useQuery<OrderResponse>({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const order = data?.order;

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await api.patch(`/admin/orders/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      addToast('success', data.message ?? 'Статус заказа обновлён');
      setNewStatus('');
    },
    onError: () => {
      addToast('error', 'Не удалось обновить статус заказа');
    },
  });

  useEffect(() => {
    setPageMeta({
      title: order ? `Заказ #${order.number}` : `Заказ #${id}`,
      subtitle: 'Детали заказа',
    });
  }, [id, order, setPageMeta]);

  if (isError) return <div className="p-8 text-red-500">Не удалось загрузить заказ.</div>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#8BC34A]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="mb-4 h-12 w-12 text-[#7A7A7A]" />
        <p className="text-lg font-medium text-[#1A1A1A]">Заказ не найден</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#8BC34A] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Вернуться к списку заказов
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#7A7A7A] transition-colors hover:text-[#1A1A1A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к заказам
        </button>

        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Заказ #{order.number}</h2>
          <StatusBadge status={order.status} label={order.status_label} />
          <span className="text-sm text-[#7A7A7A]">от {formatDate(order.created_at)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AdminCard className="p-0 overflow-hidden">
            <div className="border-b border-[#E0E0E0] px-5 py-4">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Товары в заказе ({order.items.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#E0E0E0] bg-[#FAFAF8]">
                    <th className="px-5 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-[#7A7A7A]">
                      Товар
                    </th>
                    <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-wider text-[#7A7A7A]">
                      Цена
                    </th>
                    <th className="px-5 py-3 text-center text-[12px] font-semibold uppercase tracking-wider text-[#7A7A7A]">
                      Кол-во
                    </th>
                    <th className="px-5 py-3 text-right text-[12px] font-semibold uppercase tracking-wider text-[#7A7A7A]">
                      Итого
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-[#F0F0EC]">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-[13px] font-medium text-[#1A1A1A]">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] text-[#7A7A7A]">
                            Артикул: {item.product_sku}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-[13px] text-[#3D3D3D]">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-5 py-3 text-center text-[13px] text-[#3D3D3D]">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-right text-[13px] font-medium text-[#1A1A1A]">
                        {formatPrice(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#E0E0E0] bg-[#FAFAF8] px-5 py-4">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#7A7A7A]">Подитог</span>
                  <span className="text-[#3D3D3D]">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#7A7A7A]">Доставка</span>
                  <span className="text-[#3D3D3D]">
                    {order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Бесплатно'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[#E0E0E0] pt-2 text-[14px] font-semibold">
                  <span className="text-[#1A1A1A]">Итого</span>
                  <span className="text-[#8BC34A]">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AdminCard>
              <div className="mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#7A7A7A]" />
                <h3 className="text-sm font-semibold text-[#1A1A1A]">Доставка</h3>
              </div>
              <p className="text-[13px] text-[#3D3D3D]">{order.shipping_method_label}</p>
              {formatAddress(order.shipping_address) && (
                <p className="mt-1 text-[13px] text-[#7A7A7A]">{formatAddress(order.shipping_address)}</p>
              )}
              {order.tracking_number && (
                <p className="mt-2 text-[13px]">
                  <span className="text-[#7A7A7A]">Трек-номер: </span>
                  <span className="font-medium text-[#1A1A1A]">{order.tracking_number}</span>
                </p>
              )}
            </AdminCard>
            <AdminCard>
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#7A7A7A]" />
                <h3 className="text-sm font-semibold text-[#1A1A1A]">Оплата</h3>
              </div>
              <p className="text-[13px] text-[#3D3D3D]">{order.payment_method_label}</p>
            </AdminCard>
          </div>
        </div>

        <div className="space-y-6">
          <AdminCard>
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-[#7A7A7A]" />
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Клиент</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#7A7A7A]">Имя</p>
                <p className="text-[13px] font-medium text-[#1A1A1A]">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#7A7A7A]">Email</p>
                <p className="text-[13px] text-[#3D3D3D]">{order.customer_email}</p>
              </div>
              {order.customer_phone && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#7A7A7A]">Телефон</p>
                  <p className="text-[13px] text-[#3D3D3D]">{order.customer_phone}</p>
                </div>
              )}
              {formatAddress(order.shipping_address) && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#7A7A7A]">Адрес</p>
                  <p className="text-[13px] text-[#3D3D3D]">{formatAddress(order.shipping_address)}</p>
                </div>
              )}
              {order.customer_note && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#7A7A7A]">Комментарий</p>
                  <p className="text-[13px] italic text-[#3D3D3D]">{order.customer_note}</p>
                </div>
              )}
            </div>
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#7A7A7A]" />
              <h3 className="text-sm font-semibold text-[#1A1A1A]">История статусов</h3>
            </div>
            {order.status_history.length > 0 ? (
              <div className="relative ml-2">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[#E0E0E0]" />

                <div className="space-y-4">
                  {order.status_history.map((entry) => {
                    const dotColor = TIMELINE_DOT_COLORS[entry.new_status] ?? 'bg-gray-400';
                    return (
                      <div key={entry.id ?? `${entry.created_at}-${entry.new_status}`} className="relative pl-6">
                        <div
                          className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-white ${dotColor}`}
                          style={{ boxShadow: '0 0 0 1px #E0E0E0' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={entry.new_status} label={entry.new_status_label} />
                          </div>
                          {entry.comment && (
                            <p className="mt-1 text-[12px] text-[#4A4A4A]">{entry.comment}</p>
                          )}
                          <p className="mt-0.5 text-[11px] text-[#7A7A7A]">
                            {formatDateTime(entry.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-[#7A7A7A]">Нет записей</p>
            )}
          </AdminCard>

          <AdminCard>
            <h3 className="mb-4 text-sm font-semibold text-[#1A1A1A]">Обновить статус</h3>
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#E0E0E0] bg-white px-3 py-2 text-sm text-[#3D3D3D] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
              >
                <option value="">Выберите статус...</option>
                {STATUS_OPTIONS.filter((opt) => opt.value !== order.status).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (newStatus) {
                    statusMutation.mutate(newStatus);
                  }
                }}
                disabled={!newStatus || statusMutation.isPending}
                className="w-full rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Обновление...
                  </span>
                ) : (
                  'Обновить статус'
                )}
              </button>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
