import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { api } from '@shared/api';
import { formatPrice, formatDate } from '@shared/lib';
import { useAdminPage } from '@shared/hooks';
import { StatCard, AdminCard, AdminTable, StatusBadge, type AdminTableColumn } from '@shared/ui';

interface DashboardStats {
  revenue: number;
  revenue_change: number;
  orders_this_month: number;
  new_orders: number;
  customers_this_month: number;
  total_customers: number;
  average_order: number;
}

interface RecentOrder {
  id: number;
  number: string;
  customer_name: string;
  total: number;
  status: string;
  status_label: string;
  status_color: string;
  created_at: string;
}

interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  total_revenue: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

export default function Page() {
  const { setPageMeta } = useAdminPage();
  const navigate = useNavigate();

  useEffect(() => {
    setPageMeta({ title: 'Дашборд', subtitle: 'Обзор магазина' });
  }, [setPageMeta]);

  const { data, isLoading, isError } = useQuery<DashboardResponse>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data;
    },
  });

  const stats = data?.stats;
  const recentOrders = data?.recentOrders ?? [];
  const topProducts = data?.topProducts ?? [];

  const orderColumns = useMemo<AdminTableColumn<RecentOrder>[]>(
    () => [
      {
        key: 'number',
        header: 'Номер',
        width: '120px',
        render: (row) => (
          <span className="font-medium text-[#1A1A1A]">#{row.number}</span>
        ),
      },
      {
        key: 'customer',
        header: 'Клиент',
        render: (row) => row.customer_name,
      },
      {
        key: 'total',
        header: 'Сумма',
        width: '130px',
        render: (row) => (
          <span className="font-medium">{formatPrice(row.total)}</span>
        ),
      },
      {
        key: 'status',
        header: 'Статус',
        width: '130px',
        render: (row) => (
          <StatusBadge status={row.status} label={row.status_label} />
        ),
      },
      {
        key: 'date',
        header: 'Дата',
        width: '150px',
        render: (row) => formatDate(row.created_at),
      },
    ],
    [],
  );

  const productColumns = useMemo<AdminTableColumn<TopProduct>[]>(
    () => [
      {
        key: 'position',
        header: '#',
        width: '40px',
        render: (_row, index) => (
          <span className="text-[#7A7A7A]">{index + 1}</span>
        ),
      },
      {
        key: 'name',
        header: 'Товар',
        render: (row) => (
          <span className="font-medium text-[#1A1A1A]">{row.name}</span>
        ),
      },
      {
        key: 'sold',
        header: 'Продано',
        width: '90px',
        render: (row) => row.total_sold,
      },
      {
        key: 'revenue',
        header: 'Выручка',
        width: '130px',
        render: (row) => (
          <span className="font-medium">{formatPrice(row.total_revenue)}</span>
        ),
      },
    ],
    [],
  );

  function formatRevenueChange(change: number): {
    text: string;
    type: 'positive' | 'negative' | 'neutral';
  } {
    if (change > 0) {
      return { text: `+${change}% к прошлому месяцу`, type: 'positive' };
    }
    if (change < 0) {
      return { text: `${change}% к прошлому месяцу`, type: 'negative' };
    }
    return { text: 'Без изменений', type: 'neutral' };
  }

  const revenueChange = stats
    ? formatRevenueChange(stats.revenue_change)
    : undefined;

  if (isError) {
    return <div className="p-8 text-red-500">Ошибка загрузки данных</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Выручка за месяц"
          value={isLoading ? '...' : formatPrice(stats?.revenue ?? 0)}
          title="Текущий месяц"
          change={revenueChange?.text}
          changeType={revenueChange?.type}
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="#E8F5E9"
          iconColor="#4CAF50"
        />
        <StatCard
          label="Заказы"
          value={isLoading ? '...' : stats?.orders_this_month ?? 0}
          title={`Новых: ${stats?.new_orders ?? 0}`}
          icon={<ShoppingCart className="h-5 w-5" />}
          iconBg="#FFF3E0"
          iconColor="#FF9800"
        />
        <StatCard
          label="Клиенты"
          value={isLoading ? '...' : stats?.customers_this_month ?? 0}
          title={`Всего: ${stats?.total_customers ?? 0}`}
          icon={<Users className="h-5 w-5" />}
          iconBg="#E3F2FD"
          iconColor="#2196F3"
        />
        <StatCard
          label="Средний чек"
          value={isLoading ? '...' : formatPrice(stats?.average_order ?? 0)}
          title="За текущий месяц"
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="#FCE4EC"
          iconColor="#E91E63"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <AdminCard className="xl:col-span-2 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0EC]">
            <h3 className="text-[15px] font-semibold text-[#1A1A1A]">
              Последние заказы
            </h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-[13px] font-medium text-[#8BC34A] transition-colors hover:text-[#7CB342]"
            >
              Все заказы
            </button>
          </div>
          <AdminTable<RecentOrder>
            columns={orderColumns}
            data={recentOrders}
            loading={isLoading}
            skeletonRows={5}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
            emptyMessage="Заказов пока нет"
          />
        </AdminCard>

        <AdminCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0EC]">
            <h3 className="text-[15px] font-semibold text-[#1A1A1A]">
              Топ товаров
            </h3>
            <button
              onClick={() => navigate('/admin/products')}
              className="text-[13px] font-medium text-[#8BC34A] transition-colors hover:text-[#7CB342]"
            >
              Все товары
            </button>
          </div>
          <AdminTable<TopProduct>
            columns={productColumns}
            data={topProducts}
            loading={isLoading}
            skeletonRows={5}
            rowKey={(row) => row.id}
            emptyMessage="Нет данных о продажах"
          />
        </AdminCard>
      </div>
    </div>
  );
}
