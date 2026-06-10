import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@shared/api';
import { Breadcrumbs, Drawer, Pagination, Skeleton } from '@shared/ui';
import { useSeo } from '@shared/hooks';
import type { Product } from '@entities/product';
import { CatalogSidebar } from './CatalogSidebar';
import { CatalogProductCard } from './CatalogProductCard';
import { CatalogTopBar } from './CatalogTopBar';

interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  children: CatalogCategory[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface CatalogData {
  products: {
    data: Product[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  categories: CatalogCategory[];
  currentCategory: string | null;
  categoryName: string | null;
  currentSort: string;
  currentSearch: string;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const sort     = searchParams.get('sort')     || 'popular';
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const { data, isPending, isError } = useQuery<CatalogData>({
    queryKey: ['catalog', category, search, sort, page],
    queryFn: async () => {
      const { data } = await api.get('/catalog', {
        params: {
          category: category || undefined,
          search: search || undefined,
          sort,
          page,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const products        = data?.products.data ?? [];
  const categories      = data?.categories ?? [];
  const totalCount      = data?.totalCount ?? 0;
  const categoryCounts  = data?.categoryCounts ?? {};
  const lastPage        = data?.products.last_page ?? 1;
  const paginationLinks = data?.products.links ?? [];

  useEffect(() => {
    if (data && page > lastPage) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params, { replace: true });
    }
  }, [data, page, lastPage, searchParams, setSearchParams]);

  const activeCategory = category || null;
  const categoryName   = data?.categoryName ?? null;
  const pageTitle      = categoryName || 'Все товары';
  const displayCount   = activeCategory ? (categoryCounts[activeCategory] ?? 0) : totalCount;

  const currentSearch = search;

  useSeo({
    title: categoryName ? `${categoryName} — Каталог` : 'Каталог',
    description: categoryName
      ? `${categoryName} — экологичная упаковка в каталоге EcoShop. Выгодные цены, доставка по России.`
      : 'Каталог экологичной одноразовой упаковки. Контейнеры, стаканы, салатники, лотки оптом от производителя.',
  });

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    ...(activeCategory
      ? [{ label: 'Каталог', href: '/catalog' }, { label: categoryName || '' }]
      : [{ label: 'Каталог' }]),
  ];

  return (
    <>
      <div className="bg-bg-primary px-6 py-4 lg:px-20">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <div className="flex bg-bg-primary px-6 pb-10 lg:px-20">
        <CatalogSidebar
          categories={categories}
          categoryCounts={categoryCounts}
          totalCount={totalCount}
          currentCategory={activeCategory}
          currentSearch={currentSearch}
          isPending={isPending}
        />

        <div className="min-w-0 flex-1 pt-6 lg:pl-8">
          <div className="flex items-start justify-between gap-4">
            {isPending ? (
              <div className="space-y-1">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <CatalogTopBar
                title={pageTitle}
                totalCount={displayCount}
                currentSort={sort}
              />
            )}
            <button
              onClick={() => setFiltersOpen(true)}
              className="mt-1 flex shrink-0 items-center gap-2 rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-green-subtle lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
            </button>
          </div>

          <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left">
            <div className="px-4 pb-6">
              <CatalogSidebar
                categories={categories}
                categoryCounts={categoryCounts}
                totalCount={totalCount}
                currentCategory={activeCategory}
                currentSearch={currentSearch}
                mobile
              />
            </div>
          </Drawer>

          {isError ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-600">
              Не удалось загрузить товары. Попробуйте обновить страницу.
            </div>
          ) : isPending ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border-light bg-white">
                  <Skeleton className="h-52 w-full rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="mt-3 h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <CatalogProductCard key={product.id} product={product} />
                ))}
              </div>
              {lastPage > 1 && (
                <Pagination links={paginationLinks} className="mt-8" />
              )}
            </>
          ) : (
            <div className="mt-12 text-center">
              <p className="text-lg text-text-secondary">Товары не найдены</p>
              <p className="mt-2 text-sm text-text-tertiary">Попробуйте изменить параметры поиска</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
