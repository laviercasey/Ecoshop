import { useState, useEffect, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, Pencil, LayoutGrid, X, Loader2 } from 'lucide-react';
import { api } from '@shared/api';
import { formatPrice } from '@shared/lib';
import { useAdminPage } from '@shared/hooks';
import { Modal, useToast } from '@shared/ui';
import type { Product } from '@entities/product';
import type { Category } from '@entities/category';

interface ProductsResponse {
  products: Product[];
}

interface CategoriesResponse {
  categories: (Category & { products_count: number })[];
}

const SORT_OPTIONS = [
  { value: 'name', label: 'По названию' },
  { value: 'price_asc', label: 'По цене (возр.)' },
  { value: 'price_desc', label: 'По цене (убыв.)' },
  { value: 'created_at', label: 'По дате' },
] as const;

const PLACEHOLDER_COLORS = [
  'bg-green-100', 'bg-orange-100', 'bg-blue-100',
  'bg-emerald-100', 'bg-amber-100', 'bg-sky-100',
];

interface CategoryForm {
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_CATEGORY: CategoryForm = {
  name: '',
  description: '',
  sort_order: 0,
  is_active: true,
};

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { setPageMeta } = useAdminPage();
  const { addToast } = useToast();

  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? 'name';

  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<{ id: number; name: string } | null>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<{ id: number; name: string } | null>(null);

  const [catForm, setCatForm] = useState<CategoryForm>(EMPTY_CATEGORY);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useQuery<ProductsResponse>({
    queryKey: ['admin-products', search, categoryId, sort],
    queryFn: async () => {
      const res = await api.get('/admin/products', {
        params: { search, category: categoryId || undefined, sort },
      });
      return res.data;
    },
  });

  const { data: categoriesData } = useQuery<CategoriesResponse>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/admin/categories');
      return res.data;
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setConfirmDeleteProduct(null);
    },
    onError: () => addToast('error', 'Не удалось удалить товар'),
  });

  const saveCatMutation = useMutation({
    mutationFn: async (data: { id: number | null; form: CategoryForm }) => {
      if (data.id) {
        return api.put(`/admin/categories/${data.id}`, data.form);
      }
      return api.post('/admin/categories', data.form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeCatForm();
    },
    onError: () => addToast('error', 'Не удалось сохранить категорию'),
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      if (categoryId) updateParam('category', '');
      setConfirmDeleteCategory(null);
    },
    onError: () => addToast('error', 'Не удалось удалить категорию'),
  });

  const products = productsData?.products ?? [];
  const totalProducts = products.length;
  const categories = categoriesData?.categories ?? [];
  const totalCategories = categories.length;

  useEffect(() => {
    setPageMeta({
      title: 'Каталог товаров',
      subtitle: `${totalProducts} товаров / ${totalCategories} категорий`,
      actions: (
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342]"
          >
            <Plus className="h-4 w-4" />
            Добавить товар
          </Link>
        </div>
      ),
    });
  }, [setPageMeta, totalProducts, totalCategories]);

  function updateParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function handleDeleteProduct(id: number, name: string) {
    setConfirmDeleteProduct({ id, name });
  }

  function openCreateCategory() {
    setCatForm(EMPTY_CATEGORY);
    setEditingCatId(null);
    setShowCatForm(true);
  }

  function openEditCategory(cat: Category & { products_count: number }) {
    setCatForm({
      name: cat.name,
      description: cat.description ?? '',
      sort_order: cat.sort_order ?? 0,
      is_active: cat.is_active ?? true,
    });
    setEditingCatId(cat.id);
    setShowCatForm(true);
  }

  function closeCatForm() {
    setShowCatForm(false);
    setEditingCatId(null);
    setCatForm(EMPTY_CATEGORY);
  }

  function handleSaveCategory(e: FormEvent) {
    e.preventDefault();
    saveCatMutation.mutate({ id: editingCatId, form: catForm });
  }

  function handleDeleteCategory(id: number, name: string) {
    setConfirmDeleteCategory({ id, name });
  }

  return (
    <div className="-m-6 flex h-[calc(100%+48px)]">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-[#E0E0E0] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A1A]">Категории</h3>
          <button
            onClick={openCreateCategory}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#8BC34A] transition-colors hover:bg-[#8BC34A]/10"
            title="Добавить категорию"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showCatForm && (
          <form onSubmit={handleSaveCategory} className="mb-3 rounded-lg border border-[#8BC34A]/30 bg-[#8BC34A]/5 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1A1A1A]">
                {editingCatId ? 'Редактировать' : 'Новая категория'}
              </span>
              <button type="button" onClick={closeCatForm} className="text-[#7A7A7A] hover:text-[#1A1A1A]">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={catForm.name}
              onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Название"
              required
              className="mb-2 w-full rounded-md border border-[#E0E0E0] px-3 py-1.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
            />
            <textarea
              value={catForm.description}
              onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Описание (необяз.)"
              rows={2}
              className="mb-2 w-full rounded-md border border-[#E0E0E0] px-3 py-1.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
            />
            <div className="mb-2 flex items-center gap-3">
              <div className="flex-1">
                <label className="mb-0.5 block text-[11px] text-[#7A7A7A]">Сортировка</label>
                <input
                  type="number"
                  value={catForm.sort_order}
                  onChange={(e) => setCatForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                  min={0}
                  className="w-full rounded-md border border-[#E0E0E0] px-3 py-1.5 text-sm text-[#1A1A1A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                />
              </div>
              <label className="flex items-center gap-1.5 pt-3">
                <input
                  type="checkbox"
                  checked={catForm.is_active}
                  onChange={(e) => setCatForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-[#E0E0E0] text-[#8BC34A] focus:ring-[#8BC34A]/20"
                />
                <span className="text-xs text-[#4A4A4A]">Активна</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={saveCatMutation.isPending || !catForm.name.trim()}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[#8BC34A] py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#7CB342] disabled:opacity-50"
            >
              {saveCatMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {editingCatId ? 'Сохранить' : 'Создать'}
            </button>
          </form>
        )}

        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => updateParam('category', '')}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                !categoryId ? 'bg-[#8BC34A]/10 font-medium text-[#1A1A1A]' : 'text-[#4A4A4A] hover:bg-gray-50'
              }`}
            >
              <span>Все товары</span>
              <span className="text-xs text-[#7A7A7A]">{totalProducts}</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id} className="group">
              <div
                className={`flex items-center rounded-lg transition-colors ${
                  categoryId === String(cat.id) ? 'bg-[#8BC34A]/10' : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => updateParam('category', String(cat.id))}
                  className={`flex min-w-0 flex-1 items-center justify-between px-3 py-2 text-sm ${
                    categoryId === String(cat.id) ? 'font-medium text-[#1A1A1A]' : 'text-[#4A4A4A]'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="ml-1 shrink-0 text-xs text-[#7A7A7A]">{cat.products_count}</span>
                </button>
                <div className="flex shrink-0 items-center gap-0.5 pr-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                    className="rounded p-1 text-[#7A7A7A] hover:bg-gray-100 hover:text-[#1A1A1A]"
                    title="Редактировать"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }}
                    disabled={deleteCatMutation.isPending}
                    className="rounded p-1 text-[#7A7A7A] hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                    title="Удалить"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7A7A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Поиск товаров..."
              className="w-full rounded-lg border border-[#E0E0E0] bg-white py-2 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
            />
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="appearance-none rounded-lg border border-[#E0E0E0] bg-white py-2 pl-4 pr-10 text-sm text-[#4A4A4A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Сортировать: {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-[#E0E0E0] bg-white p-4">
                <div className="mb-4 h-40 rounded-lg bg-gray-100" />
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-100" />
                <div className="mb-2 h-3 w-1/2 rounded bg-gray-100" />
                <div className="h-4 w-1/4 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#E0E0E0] bg-white py-20">
            <LayoutGrid className="mb-4 h-12 w-12 text-[#7A7A7A]" />
            <p className="text-lg font-medium text-[#1A1A1A]">Товары не найдены</p>
            <p className="mt-1 text-sm text-[#7A7A7A]">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-xl border border-[#E0E0E0] bg-white transition-shadow hover:shadow-md"
              >
                <div className={`flex h-40 items-center justify-center ${PLACEHOLDER_COLORS[idx % PLACEHOLDER_COLORS.length]}`}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <LayoutGrid className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1A1A1A]">{product.name}</h3>
                  <p className="mt-0.5 text-xs text-[#7A7A7A]">Артикул: {product.sku}</p>
                  <p className="mt-2 text-lg font-bold text-[#8BC34A]">
                    {formatPrice(product.price)}
                  </p>
                  <p className="mt-1 text-xs text-[#7A7A7A]">В наличии: {product.stock}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      to={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#8BC34A] px-3 py-1.5 text-xs font-medium text-[#8BC34A] transition-colors hover:bg-[#8BC34A]/5"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      disabled={deleteProductMutation.isPending}
                      className="inline-flex items-center rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                      title="Удалить товар"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={confirmDeleteProduct !== null}
        onClose={() => setConfirmDeleteProduct(null)}
        title="Удалить товар?"
      >
        <p className="mb-4 text-sm text-[#4A4A4A]">
          Вы уверены, что хотите удалить товар &quot;{confirmDeleteProduct?.name}&quot;? Это действие нельзя отменить.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmDeleteProduct(null)}
            className="rounded-lg border border-[#E0E0E0] px-4 py-2 text-sm font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              if (confirmDeleteProduct) {
                deleteProductMutation.mutate(confirmDeleteProduct.id);
              }
            }}
            disabled={deleteProductMutation.isPending}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            Удалить
          </button>
        </div>
      </Modal>

      <Modal
        open={confirmDeleteCategory !== null}
        onClose={() => setConfirmDeleteCategory(null)}
        title="Удалить категорию?"
      >
        <p className="mb-4 text-sm text-[#4A4A4A]">
          Вы уверены, что хотите удалить категорию &quot;{confirmDeleteCategory?.name}&quot;? Товары останутся без категории.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmDeleteCategory(null)}
            className="rounded-lg border border-[#E0E0E0] px-4 py-2 text-sm font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={() => {
              if (confirmDeleteCategory) {
                deleteCatMutation.mutate(confirmDeleteCategory.id);
              }
            }}
            disabled={deleteCatMutation.isPending}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            Удалить
          </button>
        </div>
      </Modal>
    </div>
  );
}
