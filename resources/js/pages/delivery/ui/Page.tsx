import { Truck, MapPin, Bike, Building2, Banknote, CreditCard } from 'lucide-react';
import { useSeo } from '@shared/hooks';

export default function Page() {
  useSeo({ title: 'Доставка и оплата', description: 'Доставка экологичной упаковки EcoShop по всей России. Отгрузка со склада в Москве в течение 24 часов. Безналичный расчёт, онлайн-оплата.' });

  return (
    <>
      <section className="bg-gradient-to-br from-[#0D1F0D] via-[#1A3A1A] to-[#0D2A0D] px-6 py-16 text-center lg:px-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-white">Доставка и оплата</h1>
          <p className="mt-4 text-lg text-text-on-dark">Отгрузка со склада в Москве в течение 24 часов</p>
        </div>
      </section>

      <section className="bg-bg-surface px-6 py-16 lg:px-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Способы доставки</h2>
            <div className="mt-6 space-y-4">
              {[
                { icon: Truck, title: 'Транспортная компания', desc: 'СДЭК, Деловые Линии, ПЭК — по всей России' },
                { icon: MapPin, title: 'Самовывоз', desc: 'Со склада в Москве, пн-пт 9:00-17:00' },
                { icon: Bike, title: 'Курьерская доставка по Москве', desc: 'В пределах МКАД, на следующий день' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-xl border border-border-light bg-bg-primary p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-subtle">
                    <item.icon className="h-5 w-5 text-green-dark" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">{item.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary">Способы оплаты</h2>
            <div className="mt-6 space-y-4">
              {[
                { icon: Building2, title: 'Безналичный расчёт', desc: 'Для юридических лиц и ИП по счёту' },
                { icon: Banknote, title: 'Наличный расчёт', desc: 'При самовывозе со склада' },
                { icon: CreditCard, title: 'Онлайн-оплата', desc: 'Картой на сайте для физических лиц' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-xl border border-border-light bg-bg-primary p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-subtle">
                    <item.icon className="h-5 w-5 text-green-dark" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary">{item.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
