import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { formatPrice } from '@shared/lib';
import { ROUTES } from '@shared/config';
import type { Product } from '@entities/product';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.compare_price !== null && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const image = product.images?.[0];

  return (
    <Link
      to={`${ROUTES.catalog}/${product.slug}`}
      className="group block rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-bg-primary">
        {image ? (
          <img
            src={image.url}
            alt={image.alt || product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-text-tertiary/40" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-lg bg-orange-primary px-2 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-base font-bold text-text-primary">{product.name}</h3>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-lg font-bold text-text-primary">{formatPrice(product.price)}</span>
        {hasDiscount && (
          <span className="text-sm text-text-tertiary line-through">{formatPrice(product.compare_price!)}</span>
        )}
      </div>
    </Link>
  );
}
