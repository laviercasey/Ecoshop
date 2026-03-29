import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, Globe, Eye } from 'lucide-react';
import { api } from '@shared/api';
import { useAdminPage } from '@shared/hooks';
import { useToast } from '@shared/ui';

interface GeneralSettings {
  store_name: string;
  store_email: string;
  store_phone: string;
  store_website: string;
  city: string;
  postal_code: string;
  legal_address: string;
  inn: string;
  ogrn: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  logo: string;
  notify_new_order: boolean;
  notify_status_change: boolean;
  notify_low_stock: boolean;
  social_vk: string;
  social_telegram: string;
  social_instagram: string;
}

const BOOLEAN_KEYS: (keyof GeneralSettings)[] = ['notify_new_order', 'notify_status_change', 'notify_low_stock'];

const DEFAULT_SETTINGS: GeneralSettings = {
  store_name: '',
  store_email: '',
  store_phone: '',
  store_website: '',
  city: '',
  postal_code: '',
  legal_address: '',
  inn: '',
  ogrn: '',
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  logo: '',
  notify_new_order: true,
  notify_status_change: true,
  notify_low_stock: false,
  social_vk: '',
  social_telegram: '',
  social_instagram: '',
};

export default function Page() {
  const queryClient = useQueryClient();
  const { setPageMeta } = useAdminPage();
  const { addToast } = useToast();
  const [form, setForm] = useState<GeneralSettings>(DEFAULT_SETTINGS);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['admin-settings-general'],
    queryFn: async () => {
      const res = await api.get('/admin/settings', { params: { group: 'general' } });
      const settings: Record<string, string> = {};
      for (const item of res.data.settings) {
        settings[item.key] = item.value ?? '';
      }
      return settings;
    },
  });

  useEffect(() => {
    if (data) {
      const parsed: Record<string, unknown> = { ...data };
      for (const key of BOOLEAN_KEYS) {
        parsed[key] = data[key] === '1' || data[key] === 'true';
      }
      setForm({ ...DEFAULT_SETTINGS, ...parsed as unknown as GeneralSettings });
      if (data.logo) {
        setLogoPreview(data.logo);
      }
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (settings: GeneralSettings) => {
      if (logoFile) {
        const formPayload = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
          if (key !== 'logo') {
            formPayload.append(key, String(value));
          }
        });
        formPayload.append('logo', logoFile);
        return api.post('/admin/settings/general', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      const payload = Object.entries(settings).map(([key, value]) => ({
        group: 'general',
        key,
        value: String(value),
      }));
      return api.put('/admin/settings', { settings: payload });
    },
    onSuccess: () => {
      setLogoFile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-settings-general'] });
    },
    onError: () => addToast('error', 'Не удалось сохранить настройки'),
  });

  function updateField<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_BYTES = 5 * 1024 * 1024;
      const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
      if (!ALLOWED.includes(file.type) || file.size > MAX_BYTES) {
        addToast('error', 'Только JPG/PNG/WebP до 5 МБ');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate(form);
  }

  useEffect(() => {
    setPageMeta({
      title: 'Общие настройки магазина',
      subtitle: 'Основная информация, реквизиты, SEO и социальные сети',
      actions: (
        <button
          type="submit"
          form="general-form"
          disabled={saveMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342] disabled:opacity-50"
        >
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Сохранить изменения
        </button>
      ),
    });
  }, [setPageMeta, saveMutation.isPending]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#8BC34A]" />
      </div>
    );
  }

  const previewTitle = form.meta_title || form.store_name || 'EcoShop';
  const previewDesc = form.meta_description || 'Описание вашего магазина';

  return (
    <div>
        <form id="general-form" onSubmit={handleSubmit}>
          <div className="flex gap-8">
            <div className="flex-1 space-y-6">
              <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Информация о магазине</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                      Название <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.store_name}
                      onChange={(e) => updateField('store_name', e.target.value)}
                      placeholder="EcoShop"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.store_email}
                      onChange={(e) => updateField('store_email', e.target.value)}
                      placeholder="info@ecoshop.ru"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Телефон</label>
                    <input
                      type="tel"
                      value={form.store_phone}
                      onChange={(e) => updateField('store_phone', e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Сайт</label>
                    <input
                      type="url"
                      value={form.store_website}
                      onChange={(e) => updateField('store_website', e.target.value)}
                      placeholder="https://ecoshop.ru"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Адрес и реквизиты</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Город</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Москва"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Индекс</label>
                    <input
                      type="text"
                      value={form.postal_code}
                      onChange={(e) => updateField('postal_code', e.target.value)}
                      placeholder="123456"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Юридический адрес</label>
                    <input
                      type="text"
                      value={form.legal_address}
                      onChange={(e) => updateField('legal_address', e.target.value)}
                      placeholder="г. Москва, ул. Примерная, д. 1, офис 10"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">ИНН</label>
                    <input
                      type="text"
                      value={form.inn}
                      onChange={(e) => updateField('inn', e.target.value)}
                      placeholder="1234567890"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">ОГРН</label>
                    <input
                      type="text"
                      value={form.ogrn}
                      onChange={(e) => updateField('ogrn', e.target.value)}
                      placeholder="1234567890123"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">SEO настройки</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Meta Title</label>
                    <input
                      type="text"
                      value={form.meta_title}
                      onChange={(e) => updateField('meta_title', e.target.value)}
                      placeholder="EcoShop — экологичная упаковка"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Meta Description</label>
                    <textarea
                      value={form.meta_description}
                      onChange={(e) => updateField('meta_description', e.target.value)}
                      rows={3}
                      placeholder="Описание магазина для поисковых систем"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Ключевые слова</label>
                    <input
                      type="text"
                      value={form.meta_keywords}
                      onChange={(e) => updateField('meta_keywords', e.target.value)}
                      placeholder="экологичная упаковка, биоразлагаемая, EcoShop"
                      className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                    />
                  </div>

                  <div className="rounded-lg border border-[#E0E0E0] bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#7A7A7A]" />
                      <span className="text-xs font-medium text-[#7A7A7A]">Предварительный просмотр в Google</span>
                    </div>
                    <div>
                      <p className="text-lg text-[#1976D2]">{previewTitle}</p>
                      <p className="text-sm text-green-700">
                        {form.store_website || 'https://ecoshop.ru'}
                      </p>
                      <p className="mt-1 text-sm text-[#4A4A4A]">{previewDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-80 shrink-0 space-y-6">
              <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Логотип магазина</h2>
                {logoPreview ? (
                  <div className="relative mb-3 overflow-hidden rounded-lg border border-[#E0E0E0]">
                    <img src={logoPreview} alt="Логотип" className="h-32 w-full object-contain p-2" />
                  </div>
                ) : null}
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[#E0E0E0] px-4 py-8 text-center transition-colors hover:border-[#8BC34A] hover:bg-[#8BC34A]/5">
                  <Upload className="h-8 w-8 text-[#7A7A7A]" />
                  <span className="text-sm font-medium text-[#4A4A4A]">Загрузить логотип</span>
                  <span className="text-xs text-[#7A7A7A]">PNG, SVG до 2 МБ</span>
                  <input
                    type="file"
                    accept="image/png,image/svg+xml"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Уведомления</h2>
                <div className="space-y-4">
                  {[
                    { key: 'notify_new_order' as const, label: 'Email при новом заказе' },
                    { key: 'notify_status_change' as const, label: 'SMS при изменении статуса' },
                    { key: 'notify_low_stock' as const, label: 'Уведомление о низком остатке' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-[#4A4A4A]">{label}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={form[key]}
                        onClick={() => updateField(key, !form[key])}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          form[key] ? 'bg-[#8BC34A]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            form[key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-[#1A1A1A]">Социальные сети</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">VKontakte</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7A7A]" />
                      <input
                        type="url"
                        value={form.social_vk}
                        onChange={(e) => updateField('social_vk', e.target.value)}
                        placeholder="https://vk.com/ecoshop"
                        className="w-full rounded-lg border border-[#E0E0E0] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Telegram</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7A7A]" />
                      <input
                        type="url"
                        value={form.social_telegram}
                        onChange={(e) => updateField('social_telegram', e.target.value)}
                        placeholder="https://t.me/ecoshop"
                        className="w-full rounded-lg border border-[#E0E0E0] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Instagram</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7A7A]" />
                      <input
                        type="url"
                        value={form.social_instagram}
                        onChange={(e) => updateField('social_instagram', e.target.value)}
                        placeholder="https://instagram.com/ecoshop"
                        className="w-full rounded-lg border border-[#E0E0E0] py-2.5 pl-10 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
    </div>
  );
}
