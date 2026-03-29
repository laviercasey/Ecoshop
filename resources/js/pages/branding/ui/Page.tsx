import { Upload, MessageSquare, Printer, CheckCircle, Package } from 'lucide-react';
import { useSeo } from '@shared/hooks';

export default function Page() {
  useSeo({ title: 'Брендирование упаковки', description: 'Нанесение логотипа и фирменного стиля на экологичную упаковку EcoShop. Флексопечать, индивидуальный дизайн, тираж от 1 000 штук.' });

  return (
    <>
      <section className="bg-gradient-to-br from-[#0D1F0D] via-[#1A3A1A] to-[#0D2A0D] px-6 py-16 text-center lg:px-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-white">Брендирование упаковки</h1>
          <p className="mt-4 text-lg text-text-on-dark">Нанесём ваш логотип и фирменный стиль на любую упаковку из каталога</p>
        </div>
      </section>

      <section className="bg-bg-surface px-6 py-16 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-text-primary">Процесс брендирования</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Upload, title: 'Загрузите макет', desc: 'Отправьте нам логотип или макет в форматах AI, EPS, PDF' },
              { icon: MessageSquare, title: 'Согласование', desc: 'Наш дизайнер адаптирует макет под выбранную упаковку и пришлёт превью' },
              { icon: Printer, title: 'Печать', desc: 'Производим печать на выбранной упаковке с использованием современного оборудования' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border-light bg-bg-primary p-8 text-center">
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

      <section className="bg-bg-primary px-6 py-16 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-[60px]">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-text-primary">Условия брендирования</h2>
            <ul className="mt-8 space-y-4">
              {[
                'Минимальный тираж — от 1 000 штук',
                'Срок изготовления — 5-7 рабочих дней',
                'Пятицветная флексопечать до 5 цветов',
                'Бесплатная доработка макета дизайнером',
                'Скидки при тираже от 10 000 штук',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-primary" />
                  <span className="text-base text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-[340px] w-full max-w-[480px] overflow-hidden rounded-2xl bg-green-subtle">
            <div className="flex h-full items-center justify-center">
              <Package className="h-20 w-20 text-green-primary/40" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
