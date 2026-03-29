import { Leaf, Shield, Handshake } from 'lucide-react';
import { useSeo } from '@shared/hooks';

export default function Page() {
  useSeo({ title: 'О бренде', description: 'EcoShop — российский производитель экологичной бумажной упаковки. Качественная и доступная упаковка из биоразлагаемых материалов.' });

  return (
    <>
      <section className="bg-bg-surface px-6 py-16 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row">
          <div className="flex-1">
            <span className="inline-block rounded-full bg-green-subtle px-3.5 py-1.5 text-[13px] font-bold text-green-dark">О бренде</span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-text-primary lg:text-5xl">
              EcoShop — экологичная упаковка для вашего бизнеса
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              Мы — российский производитель одноразовой бумажной упаковки для пищевой промышленности. Наша миссия — сделать бизнес экологичнее, выпуская качественную и доступную упаковку из биоразлагаемых материалов.
            </p>
          </div>
          <div className="h-[360px] w-full max-w-[500px] overflow-hidden rounded-2xl bg-green-subtle">
            <div className="flex h-full items-center justify-center">
              <Leaf className="h-20 w-20 text-green-primary/40" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-primary px-6 py-16 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-text-primary">Наши ценности</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Leaf, title: 'Экологичность', desc: 'Вся наша продукция изготовлена из возобновляемых и биоразлагаемых материалов, сертифицированных по международным стандартам.' },
              { icon: Shield, title: 'Качество', desc: 'Строгий контроль качества на каждом этапе производства. Наша упаковка надёжно защищает продукты и сохраняет их свежесть.' },
              { icon: Handshake, title: 'Партнёрство', desc: 'Мы выстраиваем долгосрочные отношения с клиентами, предлагая индивидуальный подход и гибкие условия сотрудничества.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border-light bg-bg-surface p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-subtle">
                  <item.icon className="h-7 w-7 text-green-dark" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-surface px-6 py-16 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-text-primary">Как мы работаем</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { num: '01', title: 'Заявка', desc: 'Вы оставляете заявку на сайте или звоните нам' },
              { num: '02', title: 'Подбор', desc: 'Менеджер помогает подобрать оптимальную упаковку под ваши потребности' },
              { num: '03', title: 'Производство', desc: 'Изготавливаем заказ с учётом всех требований и сроков' },
              { num: '04', title: 'Доставка', desc: 'Отгрузка со склада в течение 24 часов, доставка по всей России' },
            ].map((step) => (
              <div key={step.num} className="rounded-2xl border border-border-light bg-bg-primary p-6">
                <span className="text-4xl font-bold text-green-primary">{step.num}</span>
                <h3 className="mt-3 text-lg font-bold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
