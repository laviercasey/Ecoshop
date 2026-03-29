import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Leaf, ShieldCheck, BarChart3, Settings } from 'lucide-react';
import { useAuthStore } from '@entities/user';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, remember);
      const { isStaff } = useAuthStore.getState();
      if (!isStaff) {
        setError('У вас нет прав администратора');
        await useAuthStore.getState().logout();
      } else {
        navigate('/admin', { replace: true });
      }
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-b from-[#0D1F0D] to-[#1A3A1A] p-12 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8BC34A]">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EcoShop</span>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            Управляйте вашим магазином
          </h2>
          <p className="mt-4 text-base text-white/60">
            Панель управления для контроля товаров, заказов, контента и настроек
          </p>

          <div className="mt-10 space-y-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Безопасный доступ',
                desc: 'Ролевая система с разграничением прав',
              },
              {
                icon: BarChart3,
                title: 'Аналитика в реальном времени',
                desc: 'Следите за продажами и заказами',
              },
              {
                icon: Settings,
                title: 'Полный контроль',
                desc: 'Управляйте каталогом, ценами и доставкой',
              },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <feature.icon className="h-5 w-5 text-[#8BC34A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-white/50">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/30">EcoShop Admin Panel</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-[#F5F5F0] px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8BC34A]">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A1A]">EcoShop</span>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Вход в систему</h1>
            <p className="mt-1 text-sm text-[#7A7A7A]">Войдите в панель администратора</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-[#4A4A4A]">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecoshop.ru"
                  className="block w-full rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 text-sm text-[#1A1A1A] shadow-sm placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-2 focus:ring-[#8BC34A]/20"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-[#4A4A4A]">
                  Пароль
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="block w-full rounded-xl border border-[#E0E0E0] bg-white px-4 py-3 pr-11 text-sm text-[#1A1A1A] shadow-sm placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-2 focus:ring-[#8BC34A]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A7A] transition-colors hover:text-[#4A4A4A]"
                    aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-[#E0E0E0] text-[#8BC34A] focus:ring-[#8BC34A]/20"
                />
                <span className="text-sm text-[#4A4A4A]">Запомнить меня</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8BC34A] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#7CB342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8BC34A] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Входим...' : 'Войти'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
