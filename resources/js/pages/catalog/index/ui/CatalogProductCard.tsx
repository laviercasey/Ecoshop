import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice } from '@shared/lib';
import { ROUTES } from '@shared/config';
import { useToast } from '@shared/ui';
import { useCartStore } from '@entities/cart';
import type { Product } from '@entities/product';

interface CatalogProductCardProps {
  product: Product;
}

function getCategoryBadgeStyle(categoryName: string): string {
  const lower = categoryName.toLowerCase();
  if (lower.includes('salad') || lower.includes('салат')) return 'bg-green-subtle text-green-dark';
  if (lower.includes('ant') || lower.includes('craft') || lower.includes('крафт')) return 'bg-orange-light text-[#E65100]';
  if (lower.includes('sushi') || lower.includes('суши')) return 'bg-[#E3F2FD] text-[#1565C0]';
  return 'bg-green-subtle text-green-dark';
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const qty = useCartStore(state => state.items[product.id] || 0);
  const { addItem, updateItem, removeItem } = useCartStore();
  const { addToast } = useToast();
  const imageUrl = product.image_url ?? product.images?.[0]?.url ?? null;
  const imageAlt = product.images?.[0]?.alt ?? product.name;
  const categoryName = product.category_names?.[0] ?? product.categories?.[0]?.name ?? null;
  const specs = product.attributes?.slice(0, 3).map(a => a.value).join(' \u2022 ');
  const inCart = qty > 0;

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const displayQty = editing ? editValue : String(qty);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
    if (!inCart) addToast('success', `${product.name} добавлен в корзину`);
  }

  function handleIncrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
  }

  function handleDecrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (qty <= 1) {
      removeItem(product.id);
    } else {
      updateItem(product.id, qty - 1);
    }
  }

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    removeItem(product.id);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
    setEditing(true);
    setEditValue(String(qty));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditValue(e.target.value.replace(/\D/g, ''));
  }

  function commitEdit() {
    setEditing(false);
    const val = parseInt(editValue, 10);
    if (isNaN(val) || val <= 0) {
      removeItem(product.id);
    } else if (val !== qty) {
      updateItem(product.id, val);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      commitEdit();
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-border-light bg-white">
      <Link to={`${ROUTES.catalog}/${product.slug}`} className="block">
        <div className="relative h-[220px] w-full overflow-hidden bg-bg-primary">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-text-tertiary/40" />
            </div>
          )}
          {inCart && (
            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-primary text-[11px] font-bold text-white">
              {qty}
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 pt-3">
        {categoryName && (
          <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${getCategoryBadgeStyle(categoryName)}`}>
            {categoryName}
          </span>
        )}

        <Link to={`${ROUTES.catalog}/${product.slug}`}>
          <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold text-text-primary">
            {product.name}
          </h3>
        </Link>

        {specs && (
          <p className="mt-1.5 text-xs text-text-tertiary">{specs}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-green-dark">
            {formatPrice(product.price)} / {product.unit || 'шт'}
          </span>

          {inCart ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0">
                <button
                  onClick={handleDecrement}
                  className="flex h-10 w-9 items-center justify-center rounded-l-[10px] border border-border-light text-text-secondary transition-colors hover:bg-green-subtle"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayQty}
                  onFocus={handleFocus}
                  onChange={handleInputChange}
                  onBlur={commitEdit}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="h-10 w-10 border-y border-border-light bg-white text-center text-sm font-bold text-text-primary outline-none"
                />
                <button
                  onClick={handleIncrement}
                  className="flex h-10 w-9 items-center justify-center rounded-r-[10px] border border-border-light text-text-secondary transition-colors hover:bg-green-subtle"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleRemove}
                className="flex h-10 w-9 items-center justify-center rounded-[10px] border border-border-light text-text-tertiary transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-green-primary text-white transition-colors hover:bg-green-dark"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
