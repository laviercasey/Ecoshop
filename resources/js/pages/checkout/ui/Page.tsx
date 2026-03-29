import { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Breadcrumbs, Input, Textarea, useToast } from '@shared/ui';
import { cn, formatPrice } from '@shared/lib';
import { ROUTES } from '@shared/config';
import { api } from '@shared/api';
import { useSeo } from '@shared/hooks';
import { useAuthStore } from '@entities/user';
import { useCartStore } from '@entities/cart';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';

interface CheckoutItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface MethodOption {
  value: string;
  label: string;
}

interface CheckoutData {
  items: CheckoutItem[];
  subtotal: number;
  total: number;
  shippingMethods: MethodOption[];
  paymentMethods: MethodOption[];
}

export default function Page() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = useAuthStore(s => s.user);
  const cartItems = useCartStore(s => s.items);
  const productIds = Object.keys(cartItems).map(Number).filter(id => cartItems[id] > 0);

  const { data: checkoutData, isLoading: checkoutLoading, isError: checkoutError } = useQuery<CheckoutData>({
    queryKey: ['checkout', productIds.join(',')],
    queryFn: async () => {
      const { data } = await api.get('/checkout', { params: { ids: productIds.join(',') } });
      return data;
    },
    enabled: productIds.length > 0,
  });

  const items = checkoutData?.items ?? [];
  const subtotal = checkoutData?.subtotal ?? 0;
  const total = checkoutData?.total ?? 0;
  const shippingMethods = checkoutData?.shippingMethods ?? [];
  const paymentMethods = checkoutData?.paymentMethods ?? [];
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_method: '',
    payment_method: '',
    city: '',
    street: '',
    building: '',
    apartment: '',
    postal_code: '',
    customer_note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const defaultsApplied = useRef(false);
  const userPrefilled = useRef(false);

  useEffect(() => {
    if (!user || userPrefilled.current) return;
    userPrefilled.current = true;
    setFormData(prev => ({
      ...prev,
      customer_name: prev.customer_name || user.name || '',
      customer_email: prev.customer_email || user.email || '',
      customer_phone: prev.customer_phone || user.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    if (defaultsApplied.current) return;
    if (shippingMethods.length > 0 && paymentMethods.length > 0) {
      defaultsApplied.current = true;
      setFormData(prev => ({
        ...prev,
        shipping_method: prev.shipping_method || shippingMethods[0].value,
        payment_method: prev.payment_method || paymentMethods[0].value,
      }));
    }
  }, [shippingMethods, paymentMethods]);

  useSeo({ title: 'Оформление заказа', description: 'Оформление заказа на экологичную упаковку в EcoShop. Быстрая доставка, удобная оплата.' });

  if (!checkoutData && productIds.length === 0) {
    return <Navigate to={ROUTES.cart} replace />;
  }

  if (checkoutLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-green-primary border-t-transparent" />
      </div>
    );
  }

  if (checkoutError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-text-secondary">Не удалось загрузить данные для оформления заказа. Попробуйте обновить страницу.</p>
      </div>
    );
  }

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  const isPickup = formData.shipping_method === 'pickup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      const { data } = await api.post('/checkout', formData);
      const hydrate = useCartStore.getState().hydrate;
      hydrate({});
      navigate(ROUTES.checkoutSuccess(data.order.id));
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = (messages as string[])[0];
        }
        setErrors(fieldErrors);
      } else {
        addToast('error', 'Произошла ошибка. Попробуйте позже.');
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <div className="bg-bg-primary px-6 py-4 lg:px-20">
        <Breadcrumbs items={[
          { label: 'Главная', href: '/' },
          { label: 'Корзина', href: '/cart' },
          { label: 'Оформление' },
        ]} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8 bg-bg-primary px-6 pb-10 pt-2 lg:flex-row lg:px-20">
        <div className="min-w-0 flex-1 space-y-8">
          <h1 className="text-2xl font-bold text-text-primary">Оформление заказа</h1>

          <section className="rounded-2xl border border-border-light bg-bg-surface p-6">
            <h2 className="text-lg font-bold text-text-primary">Контактные данные</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Имя *"
                value={formData.customer_name}
                onChange={(e) => updateField('customer_name', e.target.value)}
                error={errors.customer_name}
              />
              <Input
                label="Email *"
                type="email"
                value={formData.customer_email}
                onChange={(e) => updateField('customer_email', e.target.value)}
                error={errors.customer_email}
              />
              <Input
                label="Телефон"
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => updateField('customer_phone', e.target.value)}
                error={errors.customer_phone}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border-light bg-bg-surface p-6">
            <h2 className="text-lg font-bold text-text-primary">Способ доставки</h2>
            {errors.shipping_method && (
              <p className="mt-1 text-sm text-red-500">{errors.shipping_method}</p>
            )}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {shippingMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => updateField('shipping_method', method.value)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-4 text-left text-sm font-medium transition-colors',
                    formData.shipping_method === method.value
                      ? 'border-green-primary bg-green-subtle text-green-dark'
                      : 'border-border-light text-text-secondary hover:border-green-primary/50'
                  )}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </section>

          {!isPickup && (
            <section className="rounded-2xl border border-border-light bg-bg-surface p-6">
              <h2 className="text-lg font-bold text-text-primary">Адрес доставки</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Город *"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  error={errors.city}
                />
                <Input
                  label="Улица *"
                  value={formData.street}
                  onChange={(e) => updateField('street', e.target.value)}
                  error={errors.street}
                />
                <Input
                  label="Дом"
                  value={formData.building}
                  onChange={(e) => updateField('building', e.target.value)}
                  error={errors.building}
                />
                <Input
                  label="Квартира"
                  value={formData.apartment}
                  onChange={(e) => updateField('apartment', e.target.value)}
                  error={errors.apartment}
                />
                <Input
                  label="Индекс"
                  value={formData.postal_code}
                  onChange={(e) => updateField('postal_code', e.target.value)}
                  error={errors.postal_code}
                />
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-border-light bg-bg-surface p-6">
            <h2 className="text-lg font-bold text-text-primary">Способ оплаты</h2>
            {errors.payment_method && (
              <p className="mt-1 text-sm text-red-500">{errors.payment_method}</p>
            )}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => updateField('payment_method', method.value)}
                  className={cn(
                    'rounded-xl border-2 px-4 py-4 text-left text-sm font-medium transition-colors',
                    formData.payment_method === method.value
                      ? 'border-green-primary bg-green-subtle text-green-dark'
                      : 'border-border-light text-text-secondary hover:border-green-primary/50'
                  )}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border-light bg-bg-surface p-6">
            <h2 className="text-lg font-bold text-text-primary">Комментарий</h2>
            <div className="mt-4">
              <Textarea
                value={formData.customer_note}
                onChange={(e) => updateField('customer_note', e.target.value)}
                placeholder="Дополнительные пожелания к заказу..."
                rows={3}
              />
            </div>
          </section>
        </div>

        <div className="w-full shrink-0 lg:w-[380px]">
          <div className="sticky top-24 rounded-2xl border border-border-light bg-bg-surface p-7">
            <h2 className="text-xl font-bold text-text-primary">Ваш заказ</h2>

            <div className="mt-5 flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3">
                  {item.image ? (
                    <img src={item.image ?? ''} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-primary">
                      <Package className="h-5 w-5 text-text-tertiary/40" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-tertiary">{item.quantity} шт.</p>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="my-5 h-px bg-border-light" />

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Товары ({totalQty} шт.)</span>
                <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Доставка</span>
                <span className="text-text-tertiary">{isPickup ? 'Бесплатно' : 'Рассчитается'}</span>
              </div>
            </div>

            <div className="my-5 h-px bg-border-light" />

            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-text-primary">Итого</span>
              <span className="text-2xl font-bold text-green-dark">{formatPrice(total)}</span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-6 w-full rounded-xl bg-green-primary py-4 font-bold text-white transition-colors hover:bg-green-dark disabled:opacity-50"
            >
              {processing ? 'Оформляем...' : 'Подтвердить заказ'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
