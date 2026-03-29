import { useEffect, useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Shield, ShoppingBag, FileEdit, Loader2 } from 'lucide-react';
import axios from 'axios';
import { api } from '@shared/api';
import { useAdminPage } from '@shared/hooks';
import { Modal, useToast } from '@shared/ui';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
  email_verified_at: string | null;
  created_at: string;
}

interface UsersResponse {
  users: AdminUser[];
}

const ROLE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: typeof Shield }> = {
  admin: {
    label: 'Администратор',
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: Shield,
  },
  order_manager: {
    label: 'Менеджер заказов',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    icon: ShoppingBag,
  },
  content_manager: {
    label: 'Контент-менеджер',
    bg: 'bg-blue-100',
    text: 'text-[#1976D2]',
    icon: FileEdit,
  },
  customer: {
    label: 'Покупатель',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: ShoppingBag,
  },
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Полный доступ ко всем разделам панели управления, настройкам и управлению пользователями',
  order_manager: 'Управление заказами, просмотр каталога товаров и работа с клиентами',
  content_manager: 'Управление контентом сайта, баннерами, страницами и SEO настройками',
  customer: 'Покупатель интернет-магазина',
};

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор' },
  { value: 'order_manager', label: 'Менеджер заказов' },
  { value: 'content_manager', label: 'Контент-менеджер' },
  { value: 'customer', label: 'Покупатель' },
];

const AVATAR_COLORS = [
  'bg-[#8BC34A]',
  'bg-[#FF9800]',
  'bg-[#1976D2]',
  'bg-[#E91E63]',
  'bg-[#9C27B0]',
  'bg-[#00BCD4]',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface EditForm {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface CreateForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

const EMPTY_CREATE: CreateForm = { name: '', email: '', password: '', phone: '', role: 'order_manager' };

export default function Page() {
  const { setPageMeta } = useAdminPage();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', email: '', phone: '', role: '' });

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: usersData, isLoading } = useQuery<UsersResponse>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, form }: { id: number; form: EditForm }) => {
      const res = await api.put(`/admin/users/${id}`, form);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    },
    onError: () => addToast('error', 'Не удалось обновить пользователя'),
  });

  const createMutation = useMutation({
    mutationFn: async (form: CreateForm) => {
      const res = await api.post('/admin/users', form);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      setCreateError(null);
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.response?.data?.errors?.email?.[0] ?? 'Ошибка создания')
        : 'Ошибка создания';
      setCreateError(msg);
    },
  });

  const users = usersData?.users ?? [];

  const roleCounts = users.reduce(
    (acc, user) => {
      for (const role of user.roles) {
        acc[role] = (acc[role] ?? 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  useEffect(() => {
    setPageMeta({
      title: 'Пользователи и роли',
      subtitle: `${users.length} пользователей`,
      actions: (
        <button
          onClick={() => { setCreateForm(EMPTY_CREATE); setCreateError(null); setShowCreate(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342]"
        >
          <Plus className="h-4 w-4" />
          Добавить сотрудника
        </button>
      ),
    });
  }, [setPageMeta, users.length]);

  function getRoleConfig(role: string) {
    return ROLE_CONFIG[role] ?? { label: role, bg: 'bg-gray-100', text: 'text-gray-700', icon: Shield };
  }

  function getAccessLabel(roles: string[]): string {
    if (roles.includes('admin')) return 'Полный доступ';
    if (roles.includes('order_manager')) return 'Заказы, каталог';
    if (roles.includes('content_manager')) return 'Контент, SEO';
    if (roles.includes('customer')) return 'Покупатель';
    return 'Ограниченный';
  }

  function openEdit(user: AdminUser) {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.roles[0] ?? 'customer',
    });
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    updateMutation.mutate({ id: editingUser.id, form: editForm });
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    createMutation.mutate(createForm);
  }

  const inputCls =
    'w-full rounded-lg border border-[#E0E0E0] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#7A7A7A] focus:border-[#8BC34A] focus:outline-none focus:ring-1 focus:ring-[#8BC34A]';

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {(['admin', 'order_manager', 'content_manager'] as const).map((roleKey) => {
          const config = ROLE_CONFIG[roleKey];
          const Icon = config.icon;
          return (
            <div key={roleKey} className="rounded-xl border border-[#E0E0E0] bg-white p-5">
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                  <Icon className={`h-5 w-5 ${config.text}`} />
                </div>
                <span className="text-2xl font-bold text-[#1A1A1A]">{roleCounts[roleKey] ?? 0}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[#1A1A1A]">{config.label}</h3>
              <p className="mt-1 text-xs text-[#7A7A7A]">{ROLE_DESCRIPTIONS[roleKey]}</p>
            </div>
          );
        })}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Добавить сотрудника">
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Имя</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                required
                className={inputCls}
                placeholder="Иван Иванов"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Email</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                required
                className={inputCls}
                placeholder="ivan@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Пароль</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={8}
                className={inputCls}
                placeholder="Минимум 8 символов"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Телефон</label>
              <input
                type="text"
                value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputCls}
                placeholder="+7 (999) 999-99-99"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Роль</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
                className={inputCls}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {createError && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{createError}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-[#E0E0E0] px-4 py-2 text-sm font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342] disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Создать
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Редактировать пользователя">
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Имя</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Телефон</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputCls}
                placeholder="+7 (999) 999-99-99"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">Роль</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                className={inputCls}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="rounded-lg border border-[#E0E0E0] px-4 py-2 text-sm font-medium text-[#4A4A4A] transition-colors hover:bg-gray-50"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#8BC34A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7CB342] disabled:opacity-50"
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Сохранить
            </button>
          </div>
        </form>
      </Modal>

      <div className="rounded-xl border border-[#E0E0E0] bg-white">
        <div className="border-b border-[#E0E0E0] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Сотрудники</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#8BC34A]" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E0E0E0] bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7A7A7A]">
                  Сотрудник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7A7A7A]">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7A7A7A]">
                  Доступ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7A7A7A]">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#7A7A7A]">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {users.map((user) => {
                const primaryRole = user.roles[0] ?? 'customer';
                const roleConfig = getRoleConfig(primaryRole);
                return (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${getAvatarColor(user.name)}`}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{user.name}</p>
                          <p className="text-xs text-[#7A7A7A]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleConfig.bg} ${roleConfig.text}`}
                      >
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#4A4A4A]">{getAccessLabel(user.roles)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.email_verified_at
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.email_verified_at ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        {user.email_verified_at ? 'Подтверждён' : 'Не подтверждён'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEdit(user)}
                        className="rounded-lg p-1.5 text-[#7A7A7A] transition-colors hover:bg-gray-100 hover:text-[#1A1A1A]"
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#7A7A7A]">
                    Нет сотрудников
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
