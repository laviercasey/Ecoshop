import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Truck, HeadphonesIcon } from 'lucide-react';
import { RegisterForm } from '@features/auth';
import { useSeo } from '@shared/hooks';

export default function Page() {
  useSeo({ title: 'Регистрация' });

  return (
    <>
      <div className="hidden w-[480px] shrink-0 flex-col justify-between bg-gradient-to-b from-[#0D1F0D] via-[#1A3A1A] to-[#0D2A0D] p-10 lg:flex xl:w-[520px]">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-primary">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">EcoShop</span>
            </div>
          </Link>

          <div className="mt-16">
            <h1 className="text-[28px] font-bold leading-tight text-white">
              Присоединяйтесь
              <br />
              к EcoShop
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Создайте аккаунт для персональных условий, истории заказов и быстрого оформления покупок.
            </p>
          </div>

          <div className="mt-12 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                <ShieldCheck className="h-5 w-5 text-green-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Безопасные платежи</p>
                <p className="text-xs text-white/40">Защищённая оплата картой и СБП</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                <Truck className="h-5 w-5 text-green-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Быстрая доставка</p>
                <p className="text-xs text-white/40">СДЭК, самовывоз, Почта России</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                <HeadphonesIcon className="h-5 w-5 text-green-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Поддержка 24/7</p>
                <p className="text-xs text-white/40">Менеджер всегда на связи</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/25">
          &copy; {new Date().getFullYear()} EcoShop. Все права защищены.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-bg-primary px-6 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-primary">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">EcoShop</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-text-primary">Создать аккаунт</h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Заполните данные для регистрации
          </p>

          <div className="mt-8">
            <RegisterForm />
          </div>

          <p className="mt-8 text-center text-sm text-text-tertiary">
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              className="font-semibold text-green-primary transition-colors hover:text-green-dark"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
