import { Link } from 'react-router-dom';
import { ROUTES } from '@shared/config';

const HERO_CARDS = [
  { label: 'Популярное', name: 'Контейнер для еды', spec: '750 мл · Крафт', color: 'bg-green-primary' },
  { label: 'Новинка', name: 'Салатник круглый', spec: '500 мл · Белый', color: 'bg-[#1565C0]' },
  { label: 'Хит продаж', name: 'Стакан для кофе', spec: '300 мл · Крафт', color: 'bg-orange-primary' },
  { label: 'Эко', name: 'Ланч-бокс двухсекционный', spec: '1000 мл · Крафт', color: 'bg-green-primary' },
  { label: 'Новинка', name: 'Контейнер для супа', spec: '450 мл · Белый', color: 'bg-[#1565C0]' },
  { label: 'Популярное', name: 'Тарелка глубокая', spec: '500 мл · Крафт', color: 'bg-orange-primary' },
];

function HeroCard({ card, index }: { card: typeof HERO_CARDS[0]; index: number }) {
  return (
    <div className="w-[200px] shrink-0 rounded-2xl bg-white p-4 shadow-xl">
      <div className="aspect-square rounded-xl bg-bg-primary" />
      <span className={`mt-3 inline-block rounded px-2.5 py-1 text-[11px] font-bold text-white ${card.color}`}>
        {card.label}
      </span>
      <p className="mt-2 text-sm font-bold leading-snug text-text-primary">{card.name}</p>
      <p className="mt-1 text-[12px] text-text-tertiary">{card.spec}</p>
    </div>
  );
}

export function HeroSection() {
  const cards = [...HERO_CARDS, ...HERO_CARDS];

  return (
    <section className="overflow-hidden bg-gradient-to-br from-[#0D1F0D] via-[#1A3A1A] to-[#0D2A0D] px-6 lg:px-20">
      <div className="mx-auto flex max-w-7xl items-center gap-[60px]">
        <div className="flex-1 py-20 max-lg:py-14">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#8BC34A55] bg-[#8BC34A22] px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-green-primary" />
            <span className="text-[13px] font-bold text-green-primary">Экологичная упаковка нового поколения</span>
          </span>

          <h1 className="mt-8 max-w-[580px] text-4xl font-bold leading-[1.1] text-white lg:text-[56px]">
            Сделайте свой бизнес экологически чистым
          </h1>

          <p className="mt-6 max-w-[500px] text-lg leading-relaxed text-text-on-dark">
            Одноразовая бумажная упаковка для пищевой промышленности с возможностью брендирования. Ваш логотип — на каждом контейнере.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to={ROUTES.catalog}
              className="rounded-xl bg-green-primary px-8 py-4 text-center font-bold text-white hover:bg-green-dark"
            >
              Перейти в каталог
            </Link>
            <Link
              to={ROUTES.contacts}
              className="rounded-xl border border-white/25 px-8 py-4 text-center font-bold text-white hover:bg-white/10"
            >
              Оставить заявку
            </Link>
          </div>
        </div>

        <div className="relative hidden h-[600px] w-[440px] shrink-0 lg:flex items-center gap-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-[#0D1F0D] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#0D2A0D] to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#8BC34A18_0%,transparent_70%)]" />

          <div className="relative h-full w-[200px] overflow-hidden">
            <div className="hero-scroll-up flex flex-col gap-5">
              {cards.map((card, i) => (
                <HeroCard key={`col1-${i}`} card={card} index={i} />
              ))}
            </div>
          </div>

          <div className="relative h-full w-[200px] overflow-hidden">
            <div className="hero-scroll-down flex flex-col gap-5">
              {[...cards.slice(3), ...cards.slice(0, 3)].map((card, i) => (
                <HeroCard key={`col2-${i}`} card={card} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
