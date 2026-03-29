import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api';
import { Breadcrumbs, Drawer, Pagination, Skeleton } from '@shared/ui';
import { useSeo } from '@shared/hooks';
import type { Product } from '@entities/product';
import { CatalogSidebar } from './CatalogSidebar';
import { CatalogProductCard } from './CatalogProductCard';
import { CatalogTopBar } from './CatalogTopBar';

const PER_PAGE = 12;

interface CatalogAllData {
  products: Product[];
  categories: { id: number; name: string; slug: string; sort_order: number; is_active: boolean; children: any[] }[];
  totalCount: number;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

function buildLinks(currentPage: number, lastPage: number, searchParams: URLSearchParams): PaginationLink[] {
  const make = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    return `/catalog?${params.toString()}`;
  };

  return [
    { url: currentPage > 1 ? make(currentPage - 1) : null, label: 'Previous', active: false },
    ...Array.from({ length: lastPage }, (_, i) => ({
      url: make(i + 1),
      label: String(i + 1),
      active: i + 1 === currentPage,
    })),
    { url: currentPage < lastPage ? make(currentPage + 1) : null, label: 'Next', active: false },
  ];
}

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const sort     = searchParams.get('sort')     || 'popular';
  const page     = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const { data, isPending, isError } = useQuery<CatalogAllData>({
    queryKey: ['catalog-all'],
    queryFn: async () => {
      const { data } = await api.get('/catalog/all');
      return data;
    },
  });

  const allProducts  = data?.products   ?? [];
  const categories   = data?.categories ?? [];
  const totalCount   = data?.totalCount ?? 0;

  const filteredByCategory = useMemo(() => {
    if (!category) return allProducts;
    return allProducts.filter(p => p.category_slugs?.includes(category));
  }, [allProducts, category]);

  const filteredBySearch = useMemo(() => {
    if (!search) return filteredByCategory;
    const q = search.toLowerCase();
    return filteredByCategory.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    );
  }, [filteredByCategory, search]);

  const sorted = useMemo(() => {
    const arr = [...filteredBySearch];
    switch (sort) {
      case 'price_asc':  return arr.sort((a, b) => a.price - b.price);
      case 'price_desc': return arr.sort((a, b) => b.price - a.price);
      case 'name':       return arr.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      default:           return arr;
    }
  }, [filteredBySearch, sort]);

  const totalFiltered  = sorted.length;
  const lastPage       = Math.max(1, Math.ceil(totalFiltered / PER_PAGE));
  const currentPage    = Math.min(page, lastPage);
  const pageProducts   = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const paginationLinks = buildLinks(currentPage, lastPage, searchParams);

  useEffect(() => {
    if (page > lastPage && !isPending) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params, { replace: true });
    }
  }, [lastPage, isPending]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProducts) {
      for (const slug of p.category_slugs ?? []) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    }
    return counts;
  }, [allProducts]);

  const activeCategory  = category || null;
  const categoryName    = categories.find(c => c.slug === activeCategory)?.name ?? null;
  const pageTitle       = categoryName || 'Все товары';
  const displayCount    = activeCategory ? (categoryCounts[activeCategory] ?? 0) : totalCount;

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
          ) : pageProducts.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {pageProducts.map((product) => (
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
