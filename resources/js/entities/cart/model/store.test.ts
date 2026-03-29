import { useCartStore } from './store';
import { api } from '@shared/api';

vi.mock('@shared/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
  },
}));

beforeEach(() => {
  useCartStore.setState({ items: {}, hydrated: false });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCartStore', () => {
  it('initializes with empty items and hydrated=false', () => {
    const { items, hydrated } = useCartStore.getState();
    expect(items).toEqual({});
    expect(hydrated).toBe(false);
  });

  describe('hydrate', () => {
    it('sets items and marks as hydrated', () => {
      useCartStore.getState().hydrate({ 1: 2, 3: 5 });
      const { items, hydrated } = useCartStore.getState();
      expect(items).toEqual({ 1: 2, 3: 5 });
      expect(hydrated).toBe(true);
    });
  });

  describe('addItem', () => {
    it('adds a new item with default quantity 1', () => {
      useCartStore.getState().addItem(42);
      expect(useCartStore.getState().items[42]).toBe(1);
    });

    it('adds a new item with specified quantity', () => {
      useCartStore.getState().addItem(10, 3);
      expect(useCartStore.getState().items[10]).toBe(3);
    });

    it('increments existing item quantity', () => {
      useCartStore.setState({ items: { 7: 2 }, hydrated: true });
      useCartStore.getState().addItem(7, 4);
      expect(useCartStore.getState().items[7]).toBe(6);
    });

    it('calls api.post on add', () => {
      useCartStore.getState().addItem(5, 2);
      expect(vi.mocked(api.post)).toHaveBeenCalledWith('/cart', { product_id: 5, quantity: 2 });
    });

    it('rolls back on api error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('network error'));
      useCartStore.setState({ items: { 1: 3 }, hydrated: true });
      useCartStore.getState().addItem(1, 2);
      expect(useCartStore.getState().items[1]).toBe(5);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(useCartStore.getState().items[1]).toBe(3);
    });
  });

  describe('updateItem', () => {
    it('updates item quantity', () => {
      useCartStore.setState({ items: { 9: 1 }, hydrated: true });
      useCartStore.getState().updateItem(9, 5);
      expect(useCartStore.getState().items[9]).toBe(5);
    });

    it('removes item when quantity <= 0 (negative)', () => {
      useCartStore.setState({ items: { 9: 3 }, hydrated: true });
      useCartStore.getState().updateItem(9, -1);
      expect(useCartStore.getState().items[9]).toBeUndefined();
    });

    it('removes item when quantity = 0', () => {
      useCartStore.setState({ items: { 9: 3 }, hydrated: true });
      useCartStore.getState().updateItem(9, 0);
      expect(useCartStore.getState().items[9]).toBeUndefined();
    });

    it('calls api.patch on update', () => {
      useCartStore.setState({ items: { 4: 1 }, hydrated: true });
      useCartStore.getState().updateItem(4, 7);
      expect(vi.mocked(api.patch)).toHaveBeenCalledWith('/cart/4', { quantity: 7 });
    });

    it('calls api.delete when quantity <= 0', () => {
      useCartStore.setState({ items: { 4: 2 }, hydrated: true });
      useCartStore.getState().updateItem(4, 0);
      expect(vi.mocked(api.delete)).toHaveBeenCalledWith('/cart/4');
    });

    it('rolls back on api error', async () => {
      vi.mocked(api.patch).mockRejectedValueOnce(new Error('network error'));
      useCartStore.setState({ items: { 2: 1 }, hydrated: true });
      useCartStore.getState().updateItem(2, 10);
      expect(useCartStore.getState().items[2]).toBe(10);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(useCartStore.getState().items[2]).toBe(1);
    });
  });

  describe('removeItem', () => {
    it('removes item from cart', () => {
      useCartStore.setState({ items: { 6: 3, 7: 1 }, hydrated: true });
      useCartStore.getState().removeItem(6);
      expect(useCartStore.getState().items[6]).toBeUndefined();
      expect(useCartStore.getState().items[7]).toBe(1);
    });

    it('calls api.delete on remove', () => {
      useCartStore.setState({ items: { 8: 2 }, hydrated: true });
      useCartStore.getState().removeItem(8);
      expect(vi.mocked(api.delete)).toHaveBeenCalledWith('/cart/8');
    });

    it('rolls back on api error', async () => {
      vi.mocked(api.delete).mockRejectedValueOnce(new Error('network error'));
      useCartStore.setState({ items: { 3: 4 }, hydrated: true });
      useCartStore.getState().removeItem(3);
      expect(useCartStore.getState().items[3]).toBeUndefined();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(useCartStore.getState().items[3]).toBe(4);
    });
  });
});
