import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '@entities/user';
import { useToast } from '@shared/ui';
import { ROUTES } from '@shared/config';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const register = useAuthStore(s => s.register);
  const navigate = useNavigate();
  const { addToast } = useToast();

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setErrors({});
    try {
      await register(formData);
      navigate(ROUTES.account);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(err.response.data.errors)) {
          fieldErrors[key] = (messages as string[])[0];
        }
        setErrors(fieldErrors);
      } else {
        addToast('error', 'Произошла ошибка при регистрации');
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
          Имя
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          autoFocus
          required
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Ваше имя"
          className="block w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-tertiary focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-email" className="block text-sm font-medium text-text-secondary">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="you@example.com"
          className="block w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-tertiary focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">
          Телефон <span className="text-text-tertiary">(необязательно)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="+7 (999) 123-45-67"
          className="block w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-tertiary focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
        />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reg-password" className="block text-sm font-medium text-text-secondary">
          Пароль
        </label>
        <div className="relative">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Минимум 8 символов"
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

      <div className="space-y-1.5">
        <label htmlFor="password-confirm" className="block text-sm font-medium text-text-secondary">
          Подтвердите пароль
        </label>
        <input
          id="password-confirm"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={formData.password_confirmation}
          onChange={(e) => updateField('password_confirmation', e.target.value)}
          placeholder="Повторите пароль"
          className="block w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary shadow-sm transition-colors placeholder:text-text-tertiary focus:border-green-primary focus:outline-none focus:ring-2 focus:ring-green-primary/20"
        />
        {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
      </div>

      <button
        type="submit"
        disabled={processing}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
        {processing ? 'Регистрация...' : 'Создать аккаунт'}
      </button>
    </form>
  );
}
