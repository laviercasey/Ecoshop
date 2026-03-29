import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Image,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '@shared/api';
import { useAdminPage } from '@shared/hooks';
import { useToast } from '@shared/ui';
interface BannerItem {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface PageItem {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  meta: { title: string | null; description: string | null };
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface BannersResponse {
  banners: BannerItem[];
}

interface PagesResponse {
  pages: PageItem[];
}

const TABS = [
  { id: 'banners', label: 'Баннеры главной', icon: Image },
  { id: 'pages', label: 'Страницы сайта', icon: FileText },
] as const;

type TabId = (typeof TABS)[number]['id'];

const BANNER_COLORS = [
  'bg-green-200', 'bg-orange-200', 'bg-blue-200',
  'bg-emerald-200', 'bg-amber-200', 'bg-pink-200',
];

interface BannerFormData {
  title: string;
  subtitle: string;
  link: string;
  is_active: boolean;
  image: File | null;
}

const emptyBannerForm: BannerFormData = {
  title: '',
  subtitle: '',
  link: '',
  is_active: true,
  image: null,
};

function BannerForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
  addToast,
}: {
  initial?: BannerItem;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  addToast: (type: 'error' | 'success', message: string) => void;
}) {
  const [form, setForm] = useState<BannerFormData>(
    initial
      ? {
          title: initial.title,
          subtitle: initial.subtitle ?? '',
          link: initial.link ?? '',
          is_active: initial.is_active,
          image: null,
        }
      : emptyBannerForm,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.link && !/^(https?:\/\/|\/)/.test(form.link)) {
      addToast('error', 'Ссылка должна начинаться с / или http(s)://');
      return;
    }
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('subtitle', form.subtitle);
    fd.append('link', form.link);
    fd.append('is_active', form.is_active ? '1' : '0');
    if (form.image) {
      fd.append('image', form.image);
    }
    if (initial) {
      fd.append('_method', 'PUT');
    }
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#E0E0E0] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          {initial ? 'Редактировать баннер' : 'Новый баннер'}
        </h3>
        <button type="button" onClick={onCancel} className="text-[#7A7A7A] hover:text-[#1A1A1A]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Заголовок *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="h-9 w-full rounded-lg border border-[#E0E0E0] bg-[#FAFAF8] px-3 text-sm text-[#3D3D3D] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Подзаголовок</label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            className="h-9 w-full rounded-lg border border-[#E0E0E0] bg-[#FAFAF8] px-3 text-sm text-[#3D3D3D] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Ссылка</label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            className="h-9 w-full rounded-lg border border-[#E0E0E0] bg-[#FAFAF8] px-3 text-sm text-[#3D3D3D] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">
            Изображение{initial ? '' : ' *'}
          </label>
          <input
            type="file"
            accept="image/*"
            required={!initial}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.files?.[0] ?? null }))}
            className="h-9 w-full text-sm text-[#3D3D3D] file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-[#8BC34A]/10 file:px-3 file:text-sm file:font-medium file:text-[#4A4A4A]"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[#4A4A4A]">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-[#E0E0E0] text-[#8BC34A] focus:ring-[#8BC34A]"
          />
          Активен
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#E0E0E0] px-4 py-2 text-sm font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342] disabled:opacity-50"
        >
          {isSubmitting ? 'Сохранение...' : initial ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}

interface PageFormData {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
}

const emptyPageForm: PageFormData = {
  title: '',
  content: '',
  meta_title: '',
  meta_description: '',
  is_published: true,
};

function PageForm({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initial?: PageItem;
  onSubmit: (data: PageFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<PageFormData>(
    initial
      ? {
          title: initial.title,
          content: initial.content ?? '',
          meta_title: initial.meta.title ?? '',
          meta_description: initial.meta.description ?? '',
          is_published: initial.is_published,
        }
      : emptyPageForm,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#E0E0E0] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">
          {initial ? 'Редактировать страницу' : 'Новая страница'}
        </h3>
        <button type="button" onClick={onCancel} className="text-[#7A7A7A] hover:text-[#1A1A1A]">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Заголовок *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="h-9 w-full rounded-lg border border-[#E0E0E0] bg-[#FAFAF8] px-3 text-sm text-[#3D3D3D] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">META заголовок</label>
          <input
            type="text"
            value={form.meta_title}
            onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
            className="h-9 w-full rounded-lg border border-[#E0E0E0] bg-[#FAFAF8] px-3 text-sm text-[#3D3D3D] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">META описание</label>
          <input
            type="text"
            value={form.meta_description}
            onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
            className="h-9 w-full rounded-lg border border-[#E0E0E0] bg-[#FAFAF8] px-3 text-sm text-[#3D3D3D] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
          />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-[#4A4A4A]">Содержимое</label>
          <textarea
            rows={6}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="w-full rounded-lg border border-[#E0E0E0] bg-[#FAFAF8] px-3 py-2 text-sm text-[#3D3D3D] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[#4A4A4A]">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
            className="h-4 w-4 rounded border-[#E0E0E0] text-[#8BC34A] focus:ring-[#8BC34A]"
          />
          Опубликована
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#E0E0E0] px-4 py-2 text-sm font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342] disabled:opacity-50"
        >
          {isSubmitting ? 'Сохранение...' : initial ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  );
}

function DeleteConfirm({
  label,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <span className="text-sm text-[#4A4A4A]">Удалить {label}?</span>
      <button
        onClick={onConfirm}
        disabled={isDeleting}
        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
      >
        {isDeleting ? 'Удаление...' : 'Удалить'}
      </button>
      <button
        onClick={onCancel}
        className="rounded-lg border border-[#E0E0E0] px-3 py-1.5 text-xs font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
      >
        Отмена
      </button>
    </div>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('banners');
  const queryClient = useQueryClient();
  const { setPageMeta } = useAdminPage();
  const { addToast } = useToast();

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<number | null>(null);

  const [showPageForm, setShowPageForm] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);

  useEffect(() => {
    setPageMeta({ title: 'Управление контентом', subtitle: 'Баннеры и страницы сайта' });
  }, [setPageMeta]);

  const { data: bannersData, isLoading: bannersLoading } = useQuery<BannersResponse>({
    queryKey: ['admin-banners'],
    queryFn: async () => { const res = await api.get('/admin/banners'); return res.data; },
    enabled: activeTab === 'banners',
  });

  const { data: pagesData, isLoading: pagesLoading } = useQuery<PagesResponse>({
    queryKey: ['admin-pages'],
    queryFn: async () => { const res = await api.get('/admin/pages'); return res.data; },
    enabled: activeTab === 'pages',
  });

  const banners = bannersData?.banners ?? [];
  const pages = pagesData?.pages ?? [];

  const closeBannerForm = useCallback(() => {
    setShowBannerForm(false);
    setEditingBanner(null);
  }, []);

  const toggleBannerMutation = useMutation({
    mutationFn: (banner: BannerItem) =>
      api.patch(`/admin/banners/${banner.id}`, { is_active: !banner.is_active }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); },
    onError: () => addToast('error', 'Произошла ошибка. Попробуйте снова.'),
  });

  const createBannerMutation = useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/admin/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      closeBannerForm();
    },
    onError: () => addToast('error', 'Произошла ошибка. Попробуйте снова.'),
  });

  const updateBannerMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      api.post(`/admin/banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      closeBannerForm();
    },
    onError: () => addToast('error', 'Произошла ошибка. Попробуйте снова.'),
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setDeletingBannerId(null);
    },
    onError: () => addToast('error', 'Произошла ошибка. Попробуйте снова.'),
  });

  const closePageForm = useCallback(() => {
    setShowPageForm(false);
    setEditingPage(null);
  }, []);

  const togglePageMutation = useMutation({
    mutationFn: (page: PageItem) =>
      api.patch(`/admin/pages/${page.id}`, { is_published: !page.is_published }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-pages'] }); },
    onError: () => addToast('error', 'Произошла ошибка. Попробуйте снова.'),
  });

  const createPageMutation = useMutation({
    mutationFn: (data: PageFormData) => api.post('/admin/pages', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      closePageForm();
    },
    onError: () => addToast('error', 'Произошла ошибка. Попробуйте снова.'),
  });

  const updatePageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PageFormData }) =>
      api.put(`/admin/pages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      closePageForm();
    },
    onError: () => addToast('error', 'Произошла ошибка. Попробуйте снова.'),
  });

  const deletePageMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      setDeletingPageId(null);
    },
    onError: () => addToast('error', 'Произошла ошибка. Попробуйте снова.'),
  });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div className="-m-6 flex h-[calc(100%+48px)]">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-[#E0E0E0] bg-white p-4">
        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activeTab === tab.id ? 'bg-[#8BC34A]/10 font-medium text-[#1A1A1A]' : 'text-[#4A4A4A] hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'banners' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Баннеры главной страницы</h2>
              <button
                onClick={() => { setEditingBanner(null); setShowBannerForm(true); }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342]"
              >
                <Plus className="h-4 w-4" />
                Добавить баннер
              </button>
            </div>

            {(showBannerForm || editingBanner) && (
              <div className="mb-6">
                <BannerForm
                  initial={editingBanner ?? undefined}
                  onSubmit={(formData) => {
                    if (editingBanner) {
                      updateBannerMutation.mutate({ id: editingBanner.id, formData });
                    } else {
                      createBannerMutation.mutate(formData);
                    }
                  }}
                  onCancel={closeBannerForm}
                  isSubmitting={createBannerMutation.isPending || updateBannerMutation.isPending}
                  addToast={addToast}
                />
              </div>
            )}

            {bannersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-[#E0E0E0] bg-white p-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-40 rounded-lg bg-gray-100" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-gray-100" />
                        <div className="h-3 w-2/3 rounded bg-gray-100" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner, idx) => (
                  <div key={banner.id}>
                    {deletingBannerId === banner.id && (
                      <div className="mb-2">
                        <DeleteConfirm
                          label={`"${banner.title}"`}
                          onConfirm={() => deleteBannerMutation.mutate(banner.id)}
                          onCancel={() => setDeletingBannerId(null)}
                          isDeleting={deleteBannerMutation.isPending}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4 rounded-xl border border-[#E0E0E0] bg-white p-4 transition-shadow hover:shadow-md">
                      <div className={`flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg ${BANNER_COLORS[idx % BANNER_COLORS.length]}`}>
                        {banner.image_url ? (
                          <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
                        ) : (
                          <Image className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1A1A1A]">{banner.title}</h3>
                        {banner.subtitle && <p className="mt-0.5 text-sm text-[#4A4A4A]">{banner.subtitle}</p>}
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-xs text-[#7A7A7A]">Позиция: {banner.sort_order}</span>
                          <span className="text-xs text-[#7A7A7A]">{formatDate(banner.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {banner.is_active ? 'Активен' : 'Скрыт'}
                        </span>
                        <button
                          role="switch"
                          aria-checked={banner.is_active}
                          aria-label={`Активность баннера "${banner.title}"`}
                          onClick={() => toggleBannerMutation.mutate(banner)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${banner.is_active ? 'bg-[#8BC34A]' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${banner.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <button
                          onClick={() => { setShowBannerForm(false); setEditingBanner(banner); }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0E0E0] px-3 py-1.5 text-xs font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Редактировать
                        </button>
                        <button
                          onClick={() => setDeletingBannerId(banner.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-[#E0E0E0] p-1.5 text-[#7A7A7A] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                          title="Удалить"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {banners.length === 0 && (
                  <div className="rounded-xl border border-[#E0E0E0] bg-white py-12 text-center">
                    <Image className="mx-auto mb-3 h-10 w-10 text-[#7A7A7A]" />
                    <p className="text-sm text-[#7A7A7A]">Баннеров пока нет</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pages' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Страницы сайта</h2>
              <button
                onClick={() => { setEditingPage(null); setShowPageForm(true); }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342]"
              >
                <Plus className="h-4 w-4" />
                Добавить страницу
              </button>
            </div>

            {(showPageForm || editingPage) && (
              <div className="mb-6">
                <PageForm
                  initial={editingPage ?? undefined}
                  onSubmit={(data) => {
                    if (editingPage) {
                      updatePageMutation.mutate({ id: editingPage.id, data });
                    } else {
                      createPageMutation.mutate(data);
                    }
                  }}
                  onCancel={closePageForm}
                  isSubmitting={createPageMutation.isPending || updatePageMutation.isPending}
                />
              </div>
            )}

            {pagesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-[#E0E0E0] bg-white p-4">
                    <div className="h-4 w-1/3 rounded bg-gray-100" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {pages.map((page) => (
                  <div key={page.id}>
                    {deletingPageId === page.id && (
                      <div className="mb-2">
                        <DeleteConfirm
                          label={`"${page.title}"`}
                          onConfirm={() => deletePageMutation.mutate(page.id)}
                          onCancel={() => setDeletingPageId(null)}
                          isDeleting={deletePageMutation.isPending}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between rounded-xl border border-[#E0E0E0] bg-white p-4 transition-shadow hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#7A7A7A]" />
                        <div>
                          <h3 className="font-semibold text-[#1A1A1A]">{page.title}</h3>
                          <p className="text-xs text-[#7A7A7A]">/{page.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${page.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {page.is_published ? 'Активна' : 'Скрыта'}
                        </span>
                        <button
                          role="switch"
                          aria-checked={page.is_published}
                          aria-label={`Публикация страницы "${page.title}"`}
                          onClick={() => togglePageMutation.mutate(page)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${page.is_published ? 'bg-[#8BC34A]' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${page.is_published ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <button
                          onClick={() => { setShowPageForm(false); setEditingPage(page); }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0E0E0] px-3 py-1.5 text-xs font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Редактировать
                        </button>
                        <button
                          onClick={() => setDeletingPageId(page.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-[#E0E0E0] p-1.5 text-[#7A7A7A] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                          title="Удалить"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pages.length === 0 && (
                  <div className="rounded-xl border border-[#E0E0E0] bg-white py-12 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-[#7A7A7A]" />
                    <p className="text-sm text-[#7A7A7A]">Страниц пока нет</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
