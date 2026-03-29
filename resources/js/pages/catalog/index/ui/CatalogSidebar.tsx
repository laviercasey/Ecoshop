import { useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, Box, UtensilsCrossed, Square, Package } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@shared/lib';
import { Skeleton } from '@shared/ui';

interface SharedCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  children: SharedCategory[];
}

interface CatalogSidebarProps {
  categories: SharedCategory[];
  categoryCounts: Record<string, number>;
  totalCount: number;
  currentCategory: string | null;
  currentSearch: string;
  isPending?: boolean;
  mobile?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'salad-bowl': UtensilsCrossed,
  'old-school': Box,
  'sushi-box': Square,
  'craft-box': Package,
  default: Box,
};

function getCategoryIcon(slug: string): React.ElementType {
  return CATEGORY_ICONS[slug] || CATEGORY_ICONS.default;
}

export function CatalogSidebar({
  categories,
  categoryCounts,
  totalCount,
  currentCategory,
  currentSearch,
  isPending = false,
  mobile,
}: CatalogSidebarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
  }

  function handleCategoryClick(slug: string | null) {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    setSearchParams(params);
  }

  return (
    <aside className={mobile ? '' : 'hidden w-[280px] shrink-0 border-r border-border-light pr-0 lg:block'}>
      <div className={mobile ? '' : 'pr-6 pt-6'}>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Поиск по каталогу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[10px] border border-border-light bg-white py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-green-primary focus:outline-none focus:ring-1 focus:ring-green-primary"
            />
          </div>
        </form>

        <div className="mt-6">
          <h3 className="text-base font-bold text-text-primary">Категории</h3>

          {isPending ? (
            <div className="mt-3 space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <nav className="mt-3 space-y-1">
              <button
                onClick={() => handleCategoryClick(null)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  !currentCategory
                    ? 'bg-green-subtle text-green-dark'
                    : 'text-text-secondary hover:bg-green-subtle/50'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="flex-1 text-left">Все товары</span>
                <span className={cn(
                  'text-xs font-bold',
                  !currentCategory ? 'text-green-primary' : 'text-text-tertiary'
                )}>
                  {totalCount}
                </span>
              </button>

              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                const count = categoryCounts[cat.slug] || 0;
                const isActive = currentCategory === cat.slug;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors',
                      isActive
                        ? 'bg-green-subtle font-medium text-green-dark'
                        : 'text-text-secondary hover:bg-green-subtle/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{cat.name}</span>
                    <span className={cn(
                      'text-xs font-bold',
                      isActive ? 'text-green-primary' : 'text-text-tertiary'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
}
