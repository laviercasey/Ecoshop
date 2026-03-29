import { useState } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import { Button, Input, useToast } from '@shared/ui';
import { api } from '@shared/api';
import { PHONE_DISPLAY, PHONE_HREF, EMAIL, ADDRESS } from '@shared/config';
import { useSeo } from '@shared/hooks';

export default function Page() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useSeo({ title: 'Контакты', description: 'Свяжитесь с EcoShop — телефон, email, адрес склада в Москве. Форма обратной связи для заказа экологичной упаковки.' });

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      const { data } = await api.post('/contacts', formData);
      setSuccessMessage(data.message || 'Сообщение отправлено!');
      setFormData({ name: '', email: '', phone: '', message: '' });
      addToast('success', 'Сообщение отправлено!');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = (messages as string[])[0];
        }
        setErrors(fieldErrors);
      } else {
        addToast('error', 'Произошла ошибка. Попробуйте позже.');
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <section className="bg-gradient-to-br from-[#0D1F0D] via-[#1A3A1A] to-[#0D2A0D] px-6 py-16 text-center lg:px-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-white">Контакты</h1>
          <p className="mt-4 text-lg text-text-on-dark">Свяжитесь с нами любым удобным способом</p>
        </div>
      </section>

      <section className="bg-bg-surface px-6 py-16 lg:px-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Наши контакты</h2>
            <div className="mt-8 space-y-6">
              {[
                { icon: Phone, label: 'Телефон', value: PHONE_DISPLAY, href: PHONE_HREF },
                { icon: Mail, label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
                { icon: MapPin, label: 'Адрес', value: ADDRESS },
                { icon: Clock, label: 'Режим работы', value: 'Пн\u2013Пт: 9:00 \u2013 17:00' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-subtle">
                    <item.icon className="h-5 w-5 text-green-dark" />
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">{item.label}</p>
                    {'href' in item && item.href ? (
                      <a href={item.href} className="text-base font-medium text-text-primary hover:text-green-primary">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-base font-medium text-text-primary">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border-light bg-bg-primary p-8">
            <h2 className="text-2xl font-bold text-text-primary">Напишите нам</h2>

            {successMessage && (
              <div className="mt-4 rounded-xl bg-green-subtle p-4 text-sm text-green-dark">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <Input
                label="Имя"
                placeholder="Ваше имя"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Сообщение</label>
                <textarea
                  rows={4}
                  placeholder="Ваше сообщение..."
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  className="block w-full rounded-xl border border-border-light bg-bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-green-primary focus:outline-none focus:ring-1 focus:ring-green-primary"
                />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
              </div>
              <Button type="submit" loading={processing} className="w-full">
                Отправить
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
