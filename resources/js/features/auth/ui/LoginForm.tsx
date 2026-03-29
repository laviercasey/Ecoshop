import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@entities/user';
import { useToast } from '@shared/ui';
import { ROUTES } from '@shared/config';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const redirectTo = (location.state as { from?: string })?.from || ROUTES.account;

  function updateField(field: string, value: string | boolean) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      await login(formData.email, formData.password, formData.remember);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = (messages as string[])[0];
        }
        setErrors(fieldErrors);
      } else {
        addToast('error', 'Неверный email или пароль');
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="you@example.com"
          className="block w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-tertiary focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
          Пароль
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Введите пароль"
            className="block w-full rounded-xl border border-border-light bg-white px-4 py-3 pr-11 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-tertiary focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-tertiary transition-colors hover:text-text-secondary"
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={formData.remember}
            onChange={(e) => updateField('remember', e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-border-light text-green-primary focus:ring-green-primary/20"
          />
          <span className="text-sm text-text-secondary">Запомнить меня</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? 'Входим...' : 'Войти'}
      </button>
    </form>
  );
}
