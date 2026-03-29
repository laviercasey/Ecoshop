import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './app/router';
import { useAuthStore } from '@entities/user';
import { useCartStore } from '@entities/cart';
import { useEffect } from 'react';
import { api, configureAuth } from '@shared/api';

configureAuth(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState().clear(),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min: no refetch if data is fresh
      gcTime:    10 * 60 * 1000,  // 10 min: keep in memory after unmount
      retry: 1,
    },
  },
});

queryClient.prefetchQuery({
  queryKey: ['catalog-all'],
  queryFn: async () => {
    const { data } = await api.get('/catalog/all');
    return data;
  },
});

function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    fetchUser();
    fetchCart();
  }, [fetchUser, fetchCart]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

const container = document.getElementById('app');
if (container) {
  createRoot(container).render(<App />);
}
