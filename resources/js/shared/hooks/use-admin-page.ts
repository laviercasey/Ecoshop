import { createContext, useContext, type ReactNode } from 'react';

export interface AdminPageContextValue {
  title: string;
  subtitle: string;
  actions: ReactNode | null;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  setActions: (actions: ReactNode | null) => void;
  setPageMeta: (meta: { title: string; subtitle?: string; actions?: ReactNode }) => void;
}

export const AdminPageContext = createContext<AdminPageContextValue | null>(null);

export function useAdminPage() {
  const ctx = useContext(AdminPageContext);
  if (!ctx) throw new Error('useAdminPage must be used within AdminLayout');
  return ctx;
}
