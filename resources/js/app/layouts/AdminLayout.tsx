import { useState, useCallback, type ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@entities/user';
import { AdminSidebar } from '@widgets/admin-sidebar';
import { AdminTopBar } from '@widgets/admin-topbar';
import { Toaster } from '@shared/ui';
import { AdminPageContext } from '@shared/hooks';

export function AdminLayout() {
  const { isAuthenticated, isStaff, isLoading } = useAuthStore();

  const [title, setTitle] = useState('Дашборд');
  const [subtitle, setSubtitle] = useState('');
  const [actions, setActions] = useState<ReactNode | null>(null);

  const setPageMeta = useCallback(
    (meta: { title: string; subtitle?: string; actions?: ReactNode }) => {
      setTitle(meta.title);
      setSubtitle(meta.subtitle ?? '');
      setActions(meta.actions ?? null);
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F5F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#8BC34A] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !isStaff) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminPageContext.Provider value={{ title, subtitle, actions, setTitle, setSubtitle, setActions, setPageMeta }}>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopBar title={title} subtitle={subtitle} actions={actions} />
          <main className="flex-1 overflow-y-auto bg-[#F5F5F0] p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster />
    </AdminPageContext.Provider>
  );
}
