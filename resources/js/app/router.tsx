import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { lazy, Suspense } from 'react';
import { useAuthStore } from '@entities/user';

const HomePage = lazy(() => import('@pages/home/ui/Page'));
const CatalogPage = lazy(() => import('@pages/catalog/index/ui/Page'));
const ProductPage = lazy(() => import('@pages/catalog/show/ui/Page'));
const CartPage = lazy(() => import('@pages/cart/ui/Page'));
const CheckoutPage = lazy(() => import('@pages/checkout/ui/Page'));
const CheckoutSuccessPage = lazy(() => import('@pages/checkout/success/ui/Page'));
const AboutPage = lazy(() => import('@pages/about/ui/Page'));
const BrandingPage = lazy(() => import('@pages/branding/ui/Page'));
const DeliveryPage = lazy(() => import('@pages/delivery/ui/Page'));
const ContactsPage = lazy(() => import('@pages/contacts/ui/Page'));

const LoginPage = lazy(() => import('@pages/auth/login/ui/Page'));
const RegisterPage = lazy(() => import('@pages/auth/register/ui/Page'));

const AccountPage = lazy(() => import('@pages/account/ui/Page'));
const OrderDetailPage = lazy(() => import('@pages/account/order/ui/Page'));

const AdminDashboard = lazy(() => import('@pages/admin/dashboard/ui/Page'));
const AdminOrders = lazy(() => import('@pages/admin/orders/ui/Page'));
const AdminOrderDetail = lazy(() => import('@pages/admin/orders/detail/ui/Page'));
const AdminProducts = lazy(() => import('@pages/admin/products/ui/Page'));
const AdminProductEdit = lazy(() => import('@pages/admin/products/edit/ui/Page'));
const AdminContent = lazy(() => import('@pages/admin/content/ui/Page'));
const AdminUsers = lazy(() => import('@pages/admin/users/ui/Page'));
const AdminPayment = lazy(() => import('@pages/admin/settings/payment/ui/Page'));
const AdminDelivery = lazy(() => import('@pages/admin/settings/delivery/ui/Page'));
const AdminGeneral = lazy(() => import('@pages/admin/settings/general/ui/Page'));
const AdminLogin = lazy(() => import('@pages/admin/login/ui/Page'));

const NotFoundPage = lazy(() => import('@pages/errors/404'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-3 border-green-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }
  render() {
    if (this.state.hasError) return <div style={{padding:'2rem',textAlign:'center'}}>Что-то пошло не так. <button onClick={() => window.location.reload()}>Повторить</button></div>;
    return this.props.children;
  }
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}

function AdminProtectedRoute() {
  const { isAuthenticated, isStaff, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isStaff) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AdminOnlyRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/catalog/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/branding" element={<BrandingPage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/contacts" element={<ContactsPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/account" element={<AccountPage />} />
                <Route path="/account/orders/:id" element={<OrderDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/success/:orderId" element={<CheckoutSuccessPage />} />
              </Route>
            </Route>


            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>


            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/:id/edit" element={<AdminProductEdit />} />
                <Route path="/admin/products/new" element={<AdminProductEdit />} />
                <Route path="/admin/content" element={<AdminContent />} />


                <Route element={<AdminOnlyRoute />}>
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/settings/payment" element={<AdminPayment />} />
                  <Route path="/admin/settings/delivery" element={<AdminDelivery />} />
                  <Route path="/admin/settings/general" element={<AdminGeneral />} />
                </Route>
              </Route>
            </Route>


            <Route path="/admin/login" element={<AdminLogin />} />


            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
