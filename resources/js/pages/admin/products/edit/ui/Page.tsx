import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Upload, Plus, X, Loader2, GripVertical } from 'lucide-react';
import { api } from '@shared/api';
import { useAdminPage } from '@shared/hooks';
import { ToggleSwitch, useToast } from '@shared/ui';
import type { Product, ProductImage } from '@entities/product';
import type { Category } from '@entities/category';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  sku: string;
  unit: string;
  slug: string;
  meta_title: string;
  is_published: boolean;
  category_id: string;
  attributes: { id: string; name: string; value: string }[];
}

const EMPTY_FORM: ProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  sku: '',
  unit: 'шт',
  slug: '',
  meta_title: '',
  is_published: true,
  category_id: '',
  attributes: [],
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setPageMeta } = useAdminPage();
  const { addToast } = useToast();
  const isEdit = !!id && id !== 'new';

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: number; url: string }>>([]);

  const { data: productData, isLoading } = useQuery<{ product: Product }>({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const res = await api.get(`/admin/products/${id}`);
      return res.data;
    },
    enabled: isEdit,
  });

  const { data: categoriesData } = useQuery<{ categories: Category[] }>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/admin/categories');
      return res.data;
    },
  });

  const categories = categoriesData?.categories ?? [];

  const saveMutation = useMutation({
    mutationFn: async (formData: ProductForm) => {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        sku: formData.sku,
        unit: formData.unit,
        slug: formData.slug,
        meta_title: formData.meta_title,
        is_published: formData.is_published,
        categories: formData.category_id ? [Number(formData.category_id)] : [],
        attributes: formData.attributes.filter((a) => a.name && a.value),
      };

      const formPayload = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item) => formPayload.append(`${key}[]`, String(item)));
          } else {
            formPayload.append(key, String(value));
          }
        }
      });
      imageFiles.forEach((file) => formPayload.append('images[]', file));
      existingImages.forEach((img) => formPayload.append('existing_image_ids[]', String(img.id)));

      const jsonPayload = { ...payload, existing_image_ids: existingImages.map((img) => img.id) };

      return api({
        method: isEdit ? 'put' : 'post',
        url: isEdit ? `/admin/products/${id}` : '/admin/products',
        data: imageFiles.length > 0 ? formPayload : jsonPayload,
        headers: imageFiles.length > 0 ? { 'Content-Type': 'multipart/form-data' } : {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      navigate('/admin/products');
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = (messages as string[])[0];
        }
        setErrors(fieldErrors);
      } else {
        addToast('error', 'Не удалось сохранить товар');
      }
    },
  });

  useEffect(() => {
    if (productData?.product) {
      const p = productData.product;
      setForm({
        name: p.name,
        description: p.description ?? '',
        price: String(p.price),
        stock: String(p.stock),
        sku: p.sku,
        unit: p.unit ?? 'шт',
        slug: p.slug,
        meta_title: p.meta_title ?? '',
        is_published: p.is_published,
        category_id: p.categories?.[0]?.id ? String(p.categories[0].id) : '',
        attributes: p.attributes?.length
          ? p.attributes.map((a) => ({ id: crypto.randomUUID(), name: a.name, value: a.value }))
          : EMPTY_FORM.attributes,
      });
      setExistingImages(p.images?.map((img: ProductImage) => ({ id: img.id, url: img.url })) ?? []);
      setImagePreviews([]);
    }
  }, [productData]);

  useEffect(() => {
    setPageMeta({
      title: isEdit ? 'Редактировать товар' : 'Новый товар',
      subtitle: isEdit ? productData?.product?.name : 'Создание нового товара',
      actions: (
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="rounded-lg border border-[#E0E0E0] px-4 py-2 text-sm font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
          >
            Отменить
          </Link>
          <button
            type="submit"
            form="product-form"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342] disabled:opacity-50"
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Сохранить товар
          </button>
        </div>
      ),
    });
  }, [setPageMeta, isEdit, productData?.product?.name, saveMutation.isPending]);

  function updateField(field: keyof ProductForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function updateAttribute(index: number, field: 'name' | 'value', value: string) {
    setForm((prev) => {
      const attrs = [...prev.attributes];
      attrs[index] = { ...attrs[index], [field]: value };
      return { ...prev, attributes: attrs };
    });
  }

  function addAttribute() {
    setForm((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { id: crypto.randomUUID(), name: '', value: '' }],
    }));
  }

  function removeAttribute(index: number) {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const MAX_BYTES = 5 * 1024 * 1024;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    const all = Array.from(e.target.files ?? []);
    const valid = all.filter((f) => ALLOWED.includes(f.type) && f.size <= MAX_BYTES);
    if (valid.length < all.length) {
      addToast('error', 'Только JPG/PNG/WebP до 5 МБ');
    }
    setImageFiles((prev) => [...prev, ...valid]);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingImage(imgId: number) {
    setExistingImages((prev) => prev.filter((img) => img.id !== imgId));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    saveMutation.mutate(form);
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#8BC34A]" />
      </div>
    );
  }

  return (
    <form id="product-form" onSubmit={handleSubmit}>
      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Основная информация</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                  Название товара <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Введите название товара"
                  className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Описание товара</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  placeholder="Описание товара для карточки"
                  className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Цены и наличие</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Цена (₽)</label>
                <input type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} placeholder="0" min="0" className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]" />
                {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Остаток на складе</label>
                <input type="number" value={form.stock} onChange={(e) => updateField('stock', e.target.value)} placeholder="0" min="0" className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Артикул</label>
                <input type="text" value={form.sku} onChange={(e) => updateField('sku', e.target.value)} placeholder="SKU-001" className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]" />
                {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Единица измерения</label>
                <input type="text" value={form.unit} onChange={(e) => updateField('unit', e.target.value)} placeholder="шт" className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Характеристики</h2>
              <button type="button" onClick={addAttribute} className="inline-flex items-center gap-1 text-sm font-medium text-[#8BC34A] transition-colors hover:text-[#7CB342]">
                <Plus className="h-4 w-4" />
                Добавить
              </button>
            </div>
            <div className="space-y-3">
              {form.attributes.map((attr, i) => (
                <div key={attr.id} className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 shrink-0 text-[#7A7A7A]" />
                  <input type="text" value={attr.name} onChange={(e) => updateAttribute(i, 'name', e.target.value)} placeholder="Название" className="w-40 rounded-lg border border-[#E0E0E0] px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]" />
                  <input type="text" value={attr.value} onChange={(e) => updateAttribute(i, 'value', e.target.value)} placeholder="Значение" className="flex-1 rounded-lg border border-[#E0E0E0] px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]" />
                  <button type="button" onClick={() => removeAttribute(i)} className="rounded-lg p-1.5 text-[#7A7A7A] transition-colors hover:bg-red-50 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-80 shrink-0 space-y-6">
          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Фото товара</h2>
            <div className="space-y-3">
              {existingImages.map((img) => (
                <div key={img.id} className="relative overflow-hidden rounded-lg">
                  <img src={img.url} alt="" className="h-32 w-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(img.id)} aria-label="Удалить изображение" className="absolute right-2 top-2 rounded-full bg-white/80 p-1 transition-colors hover:bg-white">
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
              {imagePreviews.map((src, i) => (
                <div key={src} className="relative overflow-hidden rounded-lg">
                  <img src={src} alt="" className="h-32 w-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} aria-label="Удалить изображение" className="absolute right-2 top-2 rounded-full bg-white/80 p-1 transition-colors hover:bg-white">
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[#E0E0E0] px-4 py-8 text-center transition-colors hover:border-[#8BC34A] hover:bg-[#8BC34A]/5">
                <Upload className="h-8 w-8 text-[#7A7A7A]" />
                <span className="text-sm font-medium text-[#4A4A4A]">Загрузить фото</span>
                <span className="text-xs text-[#7A7A7A]">Перетащите или нажмите для выбора</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Категории и SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Категория</label>
                <select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)} className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]">
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">URL-адрес товара</label>
                <input type="text" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="product-slug" className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]" />
                {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Meta Title</label>
                <input type="text" value={form.meta_title} onChange={(e) => updateField('meta_title', e.target.value)} placeholder="SEO заголовок" className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Статус публикации</h2>
            <ToggleSwitch
              checked={form.is_published}
              onChange={(checked) => updateField('is_published', checked)}
              label="Опубликован"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
