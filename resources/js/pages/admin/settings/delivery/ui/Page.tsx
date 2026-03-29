import { useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, MapPin, Mail as MailIcon, Loader2, Settings } from 'lucide-react';
import { api } from '@shared/api';
import { useAdminPage } from '@shared/hooks';
import { useToast } from '@shared/ui';

interface DeliverySettings {
  cdek_enabled: boolean;
  cdek_description: string;
  pickup_enabled: boolean;
  pickup_address: string;
  pickup_schedule: string;
  russian_post_enabled: boolean;
  russian_post_description: string;
  free_delivery_enabled: boolean;
  free_delivery_threshold: string;
  free_delivery_regions: string;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  cdek_enabled: false,
  cdek_description: '',
  pickup_enabled: false,
  pickup_address: '',
  pickup_schedule: '',
  russian_post_enabled: false,
  russian_post_description: '',
  free_delivery_enabled: false,
  free_delivery_threshold: '',
  free_delivery_regions: '',
};

export default function Page() {
  const queryClient = useQueryClient();
  const { setPageMeta } = useAdminPage();
  const { addToast } = useToast();
  const [form, setForm] = useState<DeliverySettings>(DEFAULT_SETTINGS);

  const BOOLEAN_KEYS: (keyof DeliverySettings)[] = ['cdek_enabled', 'pickup_enabled', 'russian_post_enabled', 'free_delivery_enabled'];

  const { data, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['admin-settings-delivery'],
    queryFn: async () => {
      const res = await api.get('/admin/settings', { params: { group: 'shipping' } });
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
      setForm({ ...DEFAULT_SETTINGS, ...parsed as unknown as DeliverySettings });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (settings: DeliverySettings) => {
      const payload = Object.entries(settings).map(([key, value]) => ({
        group: 'shipping',
        key,
        value: String(value),
      }));
      return api.put('/admin/settings', { settings: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings-delivery'] });
    },
    onError: () => addToast('error', 'Не удалось сохранить настройки'),
  });

  function updateField<K extends keyof DeliverySettings>(key: K, value: DeliverySettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate(form);
  }

  useEffect(() => {
    setPageMeta({
      title: 'Настройки доставки',
      subtitle: 'Зоны, тарифы и правила доставки',
      actions: (
        <button
          type="submit"
          form="delivery-form"
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

  return (
    <div className="mx-auto max-w-3xl">
        <form id="delivery-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">СДЭК — курьер и ПВЗ</h3>
                  <p className="text-sm text-[#7A7A7A]">{form.cdek_description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {form.cdek_enabled && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0E0E0] px-3 py-1.5 text-xs font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Тарифы
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => updateField('cdek_enabled', !form.cdek_enabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    form.cdek_enabled ? 'bg-[#8BC34A]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.cdek_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                  <MapPin className="h-6 w-6 text-[#FF9800]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A1A1A]">Самовывоз со склада</h3>
                  <p className="text-sm text-[#7A7A7A]">{form.pickup_address}</p>
                  <p className="text-xs text-[#7A7A7A]">{form.pickup_schedule}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateField('pickup_enabled', !form.pickup_enabled)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  form.pickup_enabled ? 'bg-[#8BC34A]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.pickup_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {form.pickup_enabled && (
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[#E0E0E0] pt-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Адрес склада</label>
                  <input
                    type="text"
                    value={form.pickup_address}
                    onChange={(e) => updateField('pickup_address', e.target.value)}
                    className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Расписание работы</label>
                  <input
                    type="text"
                    value={form.pickup_schedule}
                    onChange={(e) => updateField('pickup_schedule', e.target.value)}
                    className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <MailIcon className="h-6 w-6 text-[#1976D2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">Почта России</h3>
                  <p className="text-sm text-[#7A7A7A]">{form.russian_post_description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateField('russian_post_enabled', !form.russian_post_enabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.russian_post_enabled ? 'bg-[#8BC34A]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.russian_post_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Бесплатная доставка</h3>
              <button
                type="button"
                onClick={() => updateField('free_delivery_enabled', !form.free_delivery_enabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.free_delivery_enabled ? 'bg-[#8BC34A]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.free_delivery_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {form.free_delivery_enabled && (
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#E0E0E0] pt-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                    При сумме заказа от (₽)
                  </label>
                  <input
                    type="number"
                    value={form.free_delivery_threshold}
                    onChange={(e) => updateField('free_delivery_threshold', e.target.value)}
                    min="0"
                    className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Регионы</label>
                  <input
                    type="text"
                    value={form.free_delivery_regions}
                    onChange={(e) => updateField('free_delivery_regions', e.target.value)}
                    placeholder="Москва, Санкт-Петербург"
                    className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                  />
                </div>
              </div>
            )}
          </div>
        </form>
    </div>
  );
}
