import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Download } from 'lucide-react';
import { api } from '@shared/api';
import { formatPrice, formatDate } from '@shared/lib';
import { useAdminPage } from '@shared/hooks';
import { AdminCard, AdminTable, StatusBadge, type AdminTableColumn } from '@shared/ui';

interface OrderListItem {
  id: number;
  number: string;
  status: string;
  status_label: string;
  status_color: string;
  customer_name: string;
  total: number;
  items_count: number;
  created_at: string;
}

interface OrdersResponse {
  orders: OrderListItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const STATUS_TABS = [
  { key: '', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'processing', label: 'В обработке' },
  { key: 'shipped', label: 'Отправлены' },
  { key: 'delivered', label: 'Доставлены' },
  { key: 'cancelled', label: 'Отменённые' },
] as const;

export default function Page() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setPageMeta } = useAdminPage();

  const status = searchParams.get('status') ?? '';
  const search = searchParams.get('search') ?? '';
  const page = searchParams.get('page') ?? '1';

  const { data, isLoading, isError } = useQuery<OrdersResponse>({
    queryKey: ['admin-orders', status, search, page],
    queryFn: async () => {
      const res = await api.get('/admin/orders', {
        params: {
          status: status || undefined,
          search: search || undefined,
          page: page || undefined,
        },
      });
      return res.data;
    },
  });

  const orders = data?.orders ?? [];
  const totalOrders = data?.meta?.total ?? 0;
  const currentPage = data?.meta?.current_page ?? 1;
  const lastPage = data?.meta?.last_page ?? 1;

  useEffect(() => {
    setPageMeta({
      title: 'Заказы',
      subtitle: `${totalOrders} заказов`,
      actions: (
        <button
          disabled
          title="Функция в разработке"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-[#8BC34A] px-4 py-2 text-sm font-medium text-[#1A1A1A] opacity-50"
        >
          <Download className="h-4 w-4" />
          Экспорт
        </button>
      ),
    });
  }, [setPageMeta, totalOrders]);

  function updateParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== 'page') {
        next.delete('page');
      }
      return next;
    });
  }

  const columns: AdminTableColumn<OrderListItem>[] = useMemo(
    () => [
      {
        key: 'number',
        header: '№ Заказа',
        width: '15%',
        render: (row) => (
          <span className="font-semibold text-[#1A1A1A]">#{row.number}</span>
        ),
      },
      {
        key: 'customer',
        header: 'Клиент',
        width: '25%',
        render: (row) => (
          <span className="text-[#3D3D3D]">{row.customer_name}</span>
        ),
      },
      {
        key: 'total',
        header: 'Сумма',
        width: '15%',
        render: (row) => (
          <span className="font-medium text-[#1A1A1A]">{formatPrice(row.total)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Статус',
        width: '15%',
        render: (row) => (
          <StatusBadge status={row.status} label={row.status_label} />
        ),
      },
      {
        key: 'items_count',
        header: 'Товаров',
        width: '10%',
        render: (row) => (
          <span className="text-[#7A7A7A]">{row.items_count}</span>
        ),
      },
      {
        key: 'created_at',
        header: 'Дата',
        width: '20%',
        render: (row) => (
          <span className="text-[#7A7A7A]">{formatDate(row.created_at)}</span>
        ),
      },
    ],
    [],
  );

  if (isError) {
    return <div className="p-8 text-red-500">Ошибка загрузки данных</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => updateParam('status', tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              status === tab.key
                ? 'bg-[#8BC34A] text-white'
                : 'bg-white text-[#4A4A4A] border border-[#E0E0E0] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7A7A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Поиск по номеру заказа, имени или email клиента..."
            className="w-full rounded-lg border border-[#E0E0E0] bg-white py-2 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
          />
        </div>
      </div>

      <AdminCard className="p-0 overflow-hidden">
        <AdminTable<OrderListItem>
          columns={columns}
          data={orders}
          loading={isLoading}
          skeletonRows={10}
          emptyMessage="Заказы не найдены"
          rowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
        />
      </AdminCard>

      {lastPage > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            onClick={() => updateParam('page', String(currentPage - 1))}
            disabled={currentPage <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm text-[#7A7A7A] transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &lsaquo;
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParam('page', String(p))}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-[#8BC34A] text-white'
                  : 'text-[#4A4A4A] hover:bg-white'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => updateParam('page', String(currentPage + 1))}
            disabled={currentPage >= lastPage}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm text-[#7A7A7A] transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}
