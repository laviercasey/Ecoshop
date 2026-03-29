import { create } from 'zustand';
import { api } from '@shared/api';

interface CartStore {
  items: Record<number, number>;
  hydrated: boolean;
  fetchCart: () => Promise<void>;
  hydrate: (items: Record<number, number>) => void;
  clearCart: () => void;
  addItem: (productId: number, quantity?: number) => void;
  updateItem: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: {},
  hydrated: false,

  hydrate: (items) => set({ items, hydrated: true }),
  clearCart: () => set({ items: {}, hydrated: true }),

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart');
      const serverItems: Record<number, number> = {};
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item.product_id && item.quantity > 0) {
            serverItems[item.product_id] = item.quantity;
          }
        }
      }
      set({ items: serverItems, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  addItem: (productId, quantity = 1) => {
    const prev = { ...get().items };
    set({ items: { ...prev, [productId]: (prev[productId] || 0) + quantity } });
    api.post('/cart', { product_id: productId, quantity }).catch(() =>
      set({ items: prev }),
    );
  },

  updateItem: (productId, quantity) => {
    const prev = { ...get().items };
    if (quantity <= 0) {
      const next = { ...prev };
      delete next[productId];
      set({ items: next });
      api.delete(`/cart/${productId}`).catch(() => set({ items: prev }));
    } else {
      set({ items: { ...prev, [productId]: quantity } });
      api.patch(`/cart/${productId}`, { quantity }).catch(() =>
        set({ items: prev }),
      );
    }
  },

  removeItem: (productId) => {
    const prev = { ...get().items };
    const next = { ...prev };
    delete next[productId];
    set({ items: next });
    api.delete(`/cart/${productId}`).catch(() => set({ items: prev }));
  },
}));
