import { useState, useEffect, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Banknote, Smartphone, Loader2, ExternalLink } from 'lucide-react';
import { api } from '@shared/api';
import { useAdminPage } from '@shared/hooks';
import { useToast } from '@shared/ui';

interface PaymentSettings {
  card_enabled: boolean;
  cash_enabled: boolean;
  sbp_enabled: boolean;
  yukassa_shop_id: string;
  yukassa_secret_key: string;
  yukassa_test_mode: boolean;
  currency: string;
}

const DEFAULT_SETTINGS: PaymentSettings = {
  card_enabled: true,
  cash_enabled: true,
  sbp_enabled: false,
  yukassa_shop_id: '',
  yukassa_secret_key: '',
  yukassa_test_mode: true,
  currency: 'RUB',
};

const CURRENCIES = [
  { value: 'RUB', label: 'Российский рубль (₽)' },
  { value: 'USD', label: 'Доллар США ($)' },
  { value: 'EUR', label: 'Евро (EUR)' },
];

export default function Page() {
  const queryClient = useQueryClient();
  const { setPageMeta } = useAdminPage();
  const { addToast } = useToast();
  const [form, setForm] = useState<PaymentSettings>(DEFAULT_SETTINGS);

  const BOOLEAN_KEYS: (keyof PaymentSettings)[] = ['card_enabled', 'cash_enabled', 'sbp_enabled', 'yukassa_test_mode'];

  const { data, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['admin-settings-payment'],
    queryFn: async () => {
      const res = await api.get('/admin/settings', { params: { group: 'payment' } });
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
      if (parsed['yukassa_secret_key'] === '***') {
        parsed['yukassa_secret_key'] = '';
      }
      setForm({ ...DEFAULT_SETTINGS, ...parsed as unknown as PaymentSettings });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (settings: PaymentSettings) => {
      const payload = Object.entries(settings).map(([key, value]) => ({
        group: 'payment',
        key,
        value: String(value),
      }));
      return api.put('/admin/settings', { settings: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings-payment'] });
    },
    onError: () => addToast('error', 'Не удалось сохранить настройки'),
  });

  function updateField<K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate(form);
  }

  useEffect(() => {
    setPageMeta({
      title: 'Настройки оплаты',
      subtitle: 'Подключение и настройка платёжных систем',
      actions: (
        <button
          type="submit"
          form="payment-form"
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
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <CreditCard className="h-6 w-6 text-[#1976D2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">Онлайн оплата картой (ЮKassa)</h3>
                  <p className="text-sm text-[#7A7A7A]">Visa, Mastercard, МИР через ЮKassa</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {form.card_enabled && (
                  <span className="text-sm font-medium text-[#8BC34A]">Настроить</span>
                )}
                <button
                  type="button"
                  onClick={() => updateField('card_enabled', !form.card_enabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    form.card_enabled ? 'bg-[#8BC34A]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.card_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <Banknote className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">Оплата при получении</h3>
                  <p className="text-sm text-[#7A7A7A]">Наличными или картой курьеру</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateField('cash_enabled', !form.cash_enabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.cash_enabled ? 'bg-[#8BC34A]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.cash_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">СБП (Система быстрых платежей)</h3>
                  <p className="text-sm text-[#7A7A7A]">Оплата по QR-коду через мобильный банк</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!form.sbp_enabled && (
                  <span className="text-sm font-medium text-[#1976D2]">Подключить</span>
                )}
                <button
                  type="button"
                  onClick={() => updateField('sbp_enabled', !form.sbp_enabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    form.sbp_enabled ? 'bg-[#8BC34A]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      form.sbp_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {form.card_enabled && (
            <div className="rounded-xl border border-[#E0E0E0] bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Настройки ЮKassa</h3>
                <a
                  href="https://yookassa.ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#1976D2] hover:underline"
                >
                  Документация
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Shop ID</label>
                  <input
                    type="text"
                    value={form.yukassa_shop_id}
                    onChange={(e) => updateField('yukassa_shop_id', e.target.value)}
                    placeholder="Введите Shop ID"
                    className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Секретный ключ</label>
                  <input
                    type="password"
                    value={form.yukassa_secret_key}
                    onChange={(e) => updateField('yukassa_secret_key', e.target.value)}
                    placeholder={data?.yukassa_secret_key ? '••••••••••••••••' : 'Введите секретный ключ'}
                    autoComplete="off"
                    autoCorrect="off"
                    className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-[#4A4A4A]">Режим</label>
                    <p className="text-xs text-[#7A7A7A]">
                      {form.yukassa_test_mode ? 'Тестовый — платежи не списываются' : 'Боевой — реальные платежи'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${form.yukassa_test_mode ? 'text-[#7A7A7A]' : 'font-medium text-[#1A1A1A]'}`}>
                      Боевой
                    </span>
                    <button
                      type="button"
                      onClick={() => updateField('yukassa_test_mode', !form.yukassa_test_mode)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        form.yukassa_test_mode ? 'bg-[#FF9800]' : 'bg-[#8BC34A]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          form.yukassa_test_mode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-sm ${form.yukassa_test_mode ? 'font-medium text-[#FF9800]' : 'text-[#7A7A7A]'}`}>
                      Тестовый
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Валюта</label>
                  <select
                    value={form.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    className="w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>
    </div>
  );
}
