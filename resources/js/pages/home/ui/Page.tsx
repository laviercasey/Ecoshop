import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Truck, Award, Printer, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@shared/api';
import { ROUTES } from '@shared/config';
import { useSeo } from '@shared/hooks';
import { HeroSection } from './HeroSection';
import { BrandingShowcase } from './BrandingShowcase';
import { BannerCarousel } from './BannerCarousel';
import type { Banner } from '@entities/banner';
import type { Product } from '@entities/product';

interface HomeData {
  banners: Banner[];
  featuredProducts: Product[];
  discountedProducts: Product[];
}

export default function Page() {
  const { data } = useQuery<HomeData>({
    queryKey: ['home'],
    queryFn: async () => {
      const res = await api.get('/home');
      return res.data;
    },
  });

  useSeo({
    title: 'Экологичная упаковка оптом',
    description: 'EcoShop — экологичная бумажная упаковка для бизнеса. Биоразлагаемые контейнеры, стаканы, пакеты оптом от производителя.',
  });

  const banners = data?.banners ?? [];

  return (
    <>
      {/* SECURITY: Only pass JSON.stringify(...) to __html here. Never interpolate server-fetched strings directly. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'EcoShop',
            description: 'Экологичная одноразовая упаковка для пищевой промышленности',
            url: window.location.origin,
          }),
        }}
      />

      <HeroSection />

      <section className="bg-bg-surface px-6 py-20 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-green-subtle px-3.5 py-1.5 text-[13px] font-bold text-green-dark">Почему мы</span>
            <h2 className="mt-4 text-4xl font-bold text-text-primary">Преимущества EcoShop</h2>
            <p className="mt-4 text-lg text-text-secondary">Мы создаём упаковку, которая защищает вашу еду и вашу репутацию</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Leaf, title: '100% Экологичность', desc: 'Вся наша продукция изготовлена из биоразлагаемых материалов, безопасных для природы', accent: 'green' as const },
              { icon: Printer, title: 'Брендирование', desc: 'Нанесём ваш логотип на любую упаковку из каталога. Срок — от 5 рабочих дней', accent: 'orange' as const },
              { icon: Truck, title: 'Доставка по России', desc: 'Отгрузка со склада в течение 24 часов. Доставка транспортными компаниями по всей России', accent: 'green' as const },
              { icon: Award, title: 'Сертификация', desc: 'Вся продукция сертифицирована и соответствует стандартам безопасности для пищевой промышленности', accent: 'orange' as const },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border-light bg-bg-primary p-7">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.accent === 'green' ? 'bg-green-subtle' : 'bg-orange-light'}`}>
                  <item.icon className={`h-6 w-6 ${item.accent === 'green' ? 'text-green-dark' : 'text-orange-primary'}`} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-primary px-6 py-20 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-[60px]">
          <BrandingShowcase />
          <div className="flex-1">
            <span className="inline-block rounded-full bg-orange-light px-3.5 py-1.5 text-[13px] font-bold text-orange-primary">Брендирование</span>
            <h2 className="mt-4 text-4xl font-bold leading-tight text-text-primary">Ваш логотип на каждой упаковке</h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              Выделите свой бренд среди конкурентов. Мы нанесём ваш логотип на любую упаковку из нашего каталога — от контейнеров до стаканов.
            </p>
            <div className="mt-6 space-y-4">
              {['Печать в 1-4 цвета', 'Минимальный тираж от 1 000 штук', 'Срок изготовления — от 5 рабочих дней'].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-primary" />
                  <span className="text-sm text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
            <Link to={ROUTES.branding} className="mt-8 inline-block rounded-xl bg-green-primary px-8 py-4 font-bold text-white hover:bg-green-dark">
              Подробнее
            </Link>
          </div>
        </div>
      </section>

      {banners.length > 0 && (
        <section className="bg-bg-surface px-6 py-20 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <BannerCarousel banners={banners} />
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-[#1A3A1A] to-[#0D2A0D] px-6 py-16 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-8">
          {[
            { value: '500+', label: 'Довольных клиентов', color: 'text-green-primary' },
            { value: '50+', label: 'Видов упаковки', color: 'text-green-primary' },
            { value: '24ч', label: 'Отгрузка со склада', color: 'text-orange-primary' },
            { value: '100%', label: 'Экологичность', color: 'text-green-primary' },
          ].map((stat, i, arr) => (
            <Fragment key={stat.value}>
              <div className="flex flex-col items-center gap-2">
                <span className={`text-5xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-[15px] text-text-on-dark">{stat.label}</span>
              </div>
              {i < arr.length - 1 && <div className="hidden h-[60px] w-px bg-white/[0.13] lg:block" />}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="bg-bg-surface px-6 py-20 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-gradient-to-br from-green-primary to-green-dark px-8 py-16 text-center lg:px-20">
            <span className="inline-block rounded-full bg-white/20 px-4 py-2 text-[13px] font-bold text-white">Специальное предложение</span>
            <h2 className="mt-6 text-4xl font-bold text-white">Скидка 10% на первый заказ</h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/80">
              Оставьте заявку и получите персональную скидку на любой товар из каталога
            </p>
            <Link to="/contacts" className="mt-8 inline-block rounded-xl bg-green-primary px-8 py-3 font-semibold text-white hover:bg-green-dark transition-colors">
              Связаться с нами
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
