import { Link } from 'react-router-dom';
import { ROUTES } from '@shared/config';
import { useSeo } from '@shared/hooks';

export default function Error404() {
  useSeo({ title: 'Страница не найдена' });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-bg-primary px-6 py-20">
      <span className="text-8xl font-bold text-green-primary/20">404</span>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">Страница не найдена</h1>
      <p className="mt-2 text-text-secondary">
        Возможно, она была удалена или вы перешли по неверной ссылке
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to={ROUTES.home}
          className="rounded-xl bg-green-primary px-8 py-3.5 font-bold text-white transition-colors hover:bg-green-dark"
        >
          На главную
        </Link>
        <Link
          to={ROUTES.catalog}
          className="rounded-xl border border-border-light px-8 py-3.5 font-bold text-text-secondary transition-colors hover:bg-green-subtle"
        >
          В каталог
        </Link>
      </div>
    </div>
  );
}
