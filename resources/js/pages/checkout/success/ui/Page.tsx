import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api';
import { formatPrice } from '@shared/lib';
import { ROUTES } from '@shared/config';
import { useSeo } from '@shared/hooks';

interface OrderData {
  number: string;
  total: number;
  customer_email: string;
}

export default function Page() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isError } = useQuery<OrderData>({
    queryKey: ['order-success', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/checkout/success/${orderId}`);
      return data.order;
    },
    enabled: !!orderId,
  });

  useSeo({ title: 'Заказ оформлен' });

  if (isError) {
    return (
      <div className="text-center py-16 text-red-500">
        Не удалось загрузить заказ.{' '}
        <button onClick={() => window.location.reload()} className="underline hover:no-underline">
          Попробовать снова
        </button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="flex flex-col items-center justify-center bg-bg-primary px-6 py-20 lg:px-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-subtle">
        <CheckCircle className="h-10 w-10 text-green-primary" />
      </div>

      <h1 className="mt-6 text-3xl font-bold text-text-primary">Заказ оформлен!</h1>

      <p className="mt-3 text-lg text-text-secondary">
        Номер заказа: <span className="font-bold text-green-dark">{order.number}</span>
      </p>

      <p className="mt-2 text-text-tertiary">
        Сумма: {formatPrice(order.total)}
      </p>

      <p className="mt-4 max-w-md text-center text-sm text-text-secondary">
        Мы отправим подтверждение на {order.customer_email}. Наш менеджер свяжется с вами для уточнения деталей.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          to={ROUTES.catalog}
          className="rounded-xl bg-green-primary px-8 py-3.5 text-center font-bold text-white transition-colors hover:bg-green-dark"
        >
          Вернуться в каталог
        </Link>
        <Link
          to={ROUTES.home}
          className="rounded-xl border border-border-light px-8 py-3.5 text-center font-bold text-text-secondary transition-colors hover:bg-green-subtle"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
