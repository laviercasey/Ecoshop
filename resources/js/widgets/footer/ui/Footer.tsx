import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { ROUTES, PHONE_DISPLAY, PHONE_HREF, ADDRESS } from '@shared/config';

const COMPANY_LINKS = [
  { href: ROUTES.about, label: 'О бренде' },
  { href: ROUTES.delivery, label: 'Доставка' },
  { href: ROUTES.contacts, label: 'Оплата' },
  { href: ROUTES.contacts, label: 'FAQ' },
];

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0D1F0D] to-[#0A170A] px-6 py-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to={ROUTES.home} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-primary">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">EcoShop</span>
            </Link>
            <p className="mt-4 max-w-[280px] text-sm text-text-on-dark">
              Экологичная одноразовая упаковка для пищевой промышленности
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Каталог</h3>
            <ul className="mt-3 flex flex-col gap-3">
              <li>
                <Link
                  to={ROUTES.catalog}
                  className="text-[13px] text-text-on-dark transition-colors hover:text-green-primary"
                >
                  Все товары
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Компания</h3>
            <ul className="mt-3 flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[13px] text-text-on-dark transition-colors hover:text-green-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">Контакты</h3>
            <div className="mt-3 flex flex-col gap-3 text-[13px] text-text-on-dark">
              <a
                href={PHONE_HREF}
                className="transition-colors hover:text-green-primary"
              >
                {PHONE_DISPLAY}
              </a>
              <p>{ADDRESS}</p>
              <p>Пн-Пт: 9:00 - 18:00</p>
              <a href="#" className="text-green-primary transition-colors hover:text-green-light">
                Telegram поддержка
              </a>
            </div>
          </div>
        </div>

        <div className="my-8 h-px bg-white/15" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} EcoShop. Все права защищены.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-white/40 transition-colors hover:text-white/60">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-xs text-white/40 transition-colors hover:text-white/60">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
