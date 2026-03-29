import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, Package, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api';
import { Breadcrumbs } from '@shared/ui';
import { formatPrice, pluralize } from '@shared/lib';
import { ROUTES } from '@shared/config';
import { useSeo } from '@shared/hooks';
import { useCartStore } from '@entities/cart';
import { useAuthStore } from '@entities/user';

interface CartPageItem {
  product_id: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string | null;
  specs: string | null;
  unit: string | null;
}

function QuantityControl({ productId, quantity, name }: { productId: number; quantity: number; name: string }) {
  const { updateItem, removeItem } = useCartStore();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const displayQty = editing ? editValue : String(quantity);

  function handleDecrement() {
    if (quantity <= 1) {
      removeItem(productId);
    } else {
      updateItem(productId, quantity - 1);
    }
  }

  function handleIncrement() {
    updateItem(productId, quantity + 1);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
    setEditing(true);
    setEditValue(String(quantity));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditValue(e.target.value.replace(/\D/g, ''));
  }

  function commitEdit() {
    setEditing(false);
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val <= 0) {
      removeItem(productId);
    } else if (val !== quantity) {
      updateItem(productId, val);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      commitEdit();
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div className="flex items-center gap-0">
      <button
        onClick={handleDecrement}
        aria-label={`Уменьшить количество ${name}`}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-[10px] border border-border-light text-text-secondary transition-colors hover:bg-green-subtle"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={displayQty}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        className="h-10 w-14 border-y border-border-light bg-white text-center text-sm font-bold text-text-primary outline-none"
      />
      <button
        onClick={handleIncrement}
        aria-label={`Увеличить количество ${name}`}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-[10px] border border-border-light text-text-secondary transition-colors hover:bg-green-subtle"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function CartItemCard({ item }: { item: CartPageItem }) {
  const { removeItem } = useCartStore();
  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-light bg-bg-surface p-5 sm:flex-row sm:items-center sm:gap-5">
      <Link to={`${ROUTES.catalog}/${item.slug}`} className="shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-[100px] w-[100px] rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-xl bg-bg-primary">
            <Package className="h-8 w-8 text-text-tertiary/40" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`${ROUTES.catalog}/${item.slug}`} className="block">
          <h3 className="text-base font-bold text-text-primary">{item.name}</h3>
        </Link>
        {item.specs && (
          <p className="mt-1 text-[13px] text-text-tertiary">{item.specs}</p>
        )}
        <p className="mt-1 text-sm text-text-secondary">
          {formatPrice(item.price)} / {item.unit || 'шт'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <QuantityControl productId={item.product_id} quantity={item.quantity} name={item.name} />

        <span className="text-lg font-bold text-text-primary sm:w-24 sm:text-right">
          {formatPrice(itemTotal)}
        </span>

        <button
          onClick={() => removeItem(item.product_id)}
          aria-label={`Удалить ${item.name} из корзины`}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const cartStoreItems = useCartStore(state => state.items);
  const hydrated = useCartStore(state => state.hydrated);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useSeo({ title: 'Корзина', description: 'Ваша корзина покупок в EcoShop. Проверьте выбранные товары и оформите заказ на экологичную упаковку.' });

  const productIds = Object.keys(cartStoreItems).map(Number).filter(id => cartStoreItems[id] > 0);

  const { data: serverItems = [] } = useQuery<CartPageItem[]>({
    queryKey: ['cart-details'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      return data.items ?? [];
    },
    enabled: hydrated && productIds.length > 0,
  });

  const activeItems = serverItems
    .map(item => ({
      ...item,
      quantity: cartStoreItems[item.product_id] ?? 0,
    }))
    .filter(item => item.quantity > 0);

  const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const totalQty = activeItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-green-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (productIds.length === 0) {
    return (
      <>
        <div className="bg-bg-primary px-6 py-4 lg:px-20">
          <Breadcrumbs
            items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]}
          />
        </div>
        <div className="flex flex-col items-center justify-center bg-bg-primary px-6 py-20 lg:px-20">
          <ShoppingBag className="h-16 w-16 text-text-tertiary/30" />
          <h1 className="mt-6 text-2xl font-bold text-text-primary">
            Ваша корзина пуста
          </h1>
          <p className="mt-2 text-text-secondary">
            Добавьте товары из каталога
          </p>
          <Link
            to={ROUTES.catalog}
            className="mt-6 rounded-xl bg-green-primary px-8 py-3.5 font-bold text-white transition-colors hover:bg-green-dark"
          >
            Перейти в каталог
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-bg-primary px-6 py-4 lg:px-20">
        <Breadcrumbs
          items={[{ label: 'Главная', href: '/' }, { label: 'Корзина' }]}
        />
      </div>

      <div className="flex flex-col gap-8 bg-bg-primary px-6 pb-10 pt-2 lg:flex-row lg:px-20">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Корзина</h1>
            <span className="text-sm text-text-tertiary">
              {pluralize(totalQty, 'товар', 'товара', 'товаров')}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {activeItems.map((item) => (
              <CartItemCard key={item.product_id} item={item} />
            ))}
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-[380px]">
          <div className="sticky top-24 rounded-2xl border border-border-light bg-bg-surface p-7">
            <h2 className="text-xl font-bold text-text-primary">Итого</h2>

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  Товары ({totalQty} шт.)
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Доставка</span>
                <span className="text-sm text-text-tertiary">Рассчитается</span>
              </div>
            </div>

            <div className="my-5 h-px bg-border-light" />

            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-text-primary">
                К оплате
              </span>
              <span className="text-2xl font-bold text-green-dark">
                {formatPrice(total)}
              </span>
            </div>

            {isAuthenticated ? (
              <Link
                to={ROUTES.checkout}
                className="mt-6 block w-full rounded-xl bg-green-primary py-4 text-center font-bold text-white transition-colors hover:bg-green-dark"
              >
                Оформить заказ
              </Link>
            ) : (
              <Link
                to={ROUTES.login}
                state={{ from: '/checkout' }}
                className="mt-6 block w-full rounded-xl bg-green-primary py-4 text-center font-bold text-white transition-colors hover:bg-green-dark"
              >
                Войти и оформить
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
