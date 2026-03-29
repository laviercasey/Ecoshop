import { Outlet } from 'react-router-dom';
import { Toaster } from '@shared/ui';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <Outlet />
      <Toaster />
    </div>
  );
}
