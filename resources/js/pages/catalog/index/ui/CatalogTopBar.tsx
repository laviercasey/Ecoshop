import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List } from 'lucide-react';
import { pluralize } from '@shared/lib';

interface CatalogTopBarProps {
  title: string;
  totalCount: number;
  currentSort: string;
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'newest', label: 'Новинки' },
  { value: 'price_asc', label: 'По цене \u2191' },
  { value: 'price_desc', label: 'По цене \u2193' },
  { value: 'name', label: 'По названию' },
];

export function CatalogTopBar({ title, totalCount, currentSort }: CatalogTopBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  function handleSortChange(sort: string) {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    params.delete('page');
    setSearchParams(params);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[28px] font-bold text-text-primary">{title}</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          {pluralize(totalCount, 'товар', 'товара', 'товаров')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-tertiary">Сортировка:</span>
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="rounded-lg border border-border-light bg-white px-4 py-2 text-[13px] font-medium text-text-primary focus:border-green-primary focus:outline-none focus:ring-1 focus:ring-green-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex">
          <button className="rounded-l-lg border border-border-light bg-green-primary p-2 text-white">
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button className="rounded-r-lg border border-l-0 border-border-light bg-white p-2 text-text-tertiary hover:text-text-secondary">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
