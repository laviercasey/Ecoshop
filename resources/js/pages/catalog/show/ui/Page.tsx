import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api';
import { cn, formatPrice } from '@shared/lib';
import { ROUTES } from '@shared/config';
import { useSeo } from '@shared/hooks';
import { Breadcrumbs, useToast } from '@shared/ui';
import type { Product, ProductImage } from '@entities/product';
import { useCartStore } from '@entities/cart';

interface ProductData {
  product: Product;
  relatedProducts: Product[];
}

function ImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-bg-primary">
        <Package className="h-24 w-24 text-text-tertiary/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-bg-primary">
        <img
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || productName}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              aria-label="Предыдущее изображение"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-text-primary shadow-md backdrop-blur-sm hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              aria-label="Следующее изображение"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-text-primary shadow-md backdrop-blur-sm hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors',
                i === activeIndex ? 'border-green-primary' : 'border-transparent hover:border-border-light'
              )}
            >
              <img
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];

  return (
    <Link
      to={`${ROUTES.catalog}/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-border-light bg-white"
    >
      <div className="relative h-[180px] w-full overflow-hidden bg-bg-primary">
        {image ? (
          <img
            src={image.url}
            alt={image.alt || product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-text-tertiary/40" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">{product.name}</h3>
        <p className="mt-2 text-sm font-bold text-green-dark">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToast } = useToast();
  const addCartItem = useCartStore(state => state.addItem);

  const { data: productData, isError } = useQuery<ProductData>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/catalog/${slug}`);
      return data;
    },
    enabled: !!slug,
  });

  const product = productData?.product;
  const relatedProducts = productData?.relatedProducts ?? [];

  useSeo({
    title: product?.meta_title || product?.name || 'Товар',
    description: product?.meta_description || product?.description?.slice(0, 160) || undefined,
    ogImage: product?.images?.[0]?.url || undefined,
  });

  useEffect(() => {
    if (product?.min_order_qty) setQty(product.min_order_qty);
  }, [product]);

  if (isError) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-text-secondary">Не удалось загрузить товар.</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-green-primary underline">Попробовать снова</button>
    </div>
  );

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-green-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const category = product.categories?.[0];
  const hasDiscount = product.compare_price !== null && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: ROUTES.catalog },
    ...(category ? [{ label: category.name, href: `${ROUTES.catalog}?category=${category.slug}` }] : []),
    { label: product.name },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description || '',
            sku: product.sku || undefined,
            image: product.images?.[0]?.url ?? undefined,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'RUB',
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          }).replace(/&/g, '\\u0026').replace(/</g, '\\u003c').replace(/>/g, '\\u003e'),
        }}
      />

      <div className="bg-bg-primary px-6 py-4 lg:px-20">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <section className="bg-bg-primary px-6 pb-16 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ImageGallery images={product.images || []} productName={product.name} />
            </div>

            <div>
              {category && (
                <span className="inline-block rounded-full bg-green-subtle px-3 py-1 text-xs font-semibold text-green-dark">
                  {category.name}
                </span>
              )}

              <h1 className="mt-3 text-3xl font-bold text-text-primary lg:text-[32px]">
                {product.name}
              </h1>

              {product.sku && (
                <p className="mt-2 text-sm text-text-tertiary">Артикул: {product.sku}</p>
              )}

              <div className="mt-6 rounded-2xl border border-border-light bg-white p-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-green-dark">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-text-tertiary">/ {product.unit || 'шт'}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-lg text-text-tertiary line-through">
                        {formatPrice(product.compare_price!)}
                      </span>
                      <span className="rounded-lg bg-orange-primary px-2 py-0.5 text-xs font-bold text-white">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                {product.min_order_qty > 1 && (
                  <p className="mt-2 text-sm text-text-secondary">
                    Минимальный заказ: {product.min_order_qty} {product.unit || 'шт'}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <div className="flex items-center rounded-xl border border-border-light">
                    <button
                      onClick={() => setQty(Math.max(product.min_order_qty || 1, qty - (product.min_order_qty || 1)))}
                      className="px-4 py-3 text-text-secondary hover:text-text-primary"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[60px] text-center text-sm font-bold text-text-primary">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(product.stock ?? 9999, qty + (product.min_order_qty || 1)))}
                      disabled={product.stock !== null && qty >= product.stock}
                      className="px-4 py-3 text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      if (added) return;
                      addCartItem(product.id, qty);
                      setAdded(true);
                      addToast('success', `${product.name} добавлен в корзину`);
                      setTimeout(() => setAdded(false), 2000);
                    }}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-bold text-white transition-all',
                      added ? 'bg-green-dark' : 'bg-green-primary hover:bg-green-dark'
                    )}
                  >
                    {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                    {added ? 'Добавлено!' : 'В корзину'}
                  </button>
                </div>

                {product.stock > 0 && (
                  <p className="mt-3 text-sm text-green-dark">В наличии: {product.stock} {product.unit || 'шт'}</p>
                )}
              </div>

              {product.description && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-text-primary">Описание</h2>
                  <p className="mt-3 leading-relaxed text-text-secondary">{product.description}</p>
                </div>
              )}

              {product.attributes && product.attributes.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-text-primary">Характеристики</h2>
                  <div className="mt-3 overflow-hidden rounded-xl border border-border-light">
                    {product.attributes.map((attr, i) => (
                      <div
                        key={attr.id}
                        className={cn(
                          'flex justify-between px-5 py-3 text-sm',
                          i % 2 === 0 ? 'bg-bg-primary' : 'bg-white'
                        )}
                      >
                        <span className="text-text-secondary">{attr.name}</span>
                        <span className="font-medium text-text-primary">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(product.dimensions || product.weight) && (
                <div className="mt-6 flex gap-6">
                  {product.dimensions && (
                    <div>
                      <span className="text-sm text-text-tertiary">Размеры</span>
                      <p className="text-sm font-medium text-text-primary">{product.dimensions}</p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="text-sm text-text-tertiary">Вес</span>
                      <p className="text-sm font-medium text-text-primary">{product.weight} кг</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-bg-surface px-6 py-16 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-text-primary">Похожие товары</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <RelatedProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
