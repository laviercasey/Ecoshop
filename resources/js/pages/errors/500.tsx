import { Link } from 'react-router-dom';
import { ROUTES } from '@shared/config';
import { useSeo } from '@shared/hooks';

export default function Error500() {
  useSeo({ title: 'Ошибка сервера' });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-bg-primary px-6 py-20">
      <span className="text-8xl font-bold text-red-200">500</span>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">Что-то пошло не так</h1>
      <p className="mt-2 text-center text-text-secondary">
        Произошла ошибка на сервере. Мы уже работаем над исправлением.
      </p>
      <Link
        to={ROUTES.home}
        className="mt-8 rounded-xl bg-green-primary px-8 py-3.5 font-bold text-white transition-colors hover:bg-green-dark"
      >
        На главную
      </Link>
    </div>
  );
}
