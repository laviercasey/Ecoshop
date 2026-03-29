import { useAuthStore } from './auth-store';
import { api } from '@shared/api';

vi.mock('@shared/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCustomer = { id: 1, name: 'Test User', email: 'test@test.com', roles: ['customer'] };
const mockAdmin = { id: 2, name: 'Admin', email: 'admin@test.com', roles: ['admin'] };

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    isStaff: false,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAuthStore', () => {
  describe('login', () => {
    it('sets user, token, isAuthenticated on success', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { token: 'abc123', user: mockCustomer },
      });

      await useAuthStore.getState().login('test@test.com', 'password');
      const { user, token, isAuthenticated } = useAuthStore.getState();

      expect(user).toEqual(mockCustomer);
      expect(token).toBe('abc123');
      expect(isAuthenticated).toBe(true);
    });

    it('sets isAdmin=true for admin users', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { token: 'tok', user: mockAdmin },
      });

      await useAuthStore.getState().login('admin@test.com', 'password');
      expect(useAuthStore.getState().isAdmin).toBe(true);
    });

    it('sets isAdmin=false for non-admin users', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { token: 'tok', user: mockCustomer },
      });

      await useAuthStore.getState().login('test@test.com', 'password');
      expect(useAuthStore.getState().isAdmin).toBe(false);
    });

    it('throws on api error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Unauthorized'));
      await expect(
        useAuthStore.getState().login('test@test.com', 'wrong'),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('register', () => {
    it('sets user and token on success', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { token: 'reg-token', user: mockCustomer },
      });

      await useAuthStore.getState().register({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password',
        password_confirmation: 'password',
      });

      const { user, token, isAuthenticated } = useAuthStore.getState();
      expect(user).toEqual(mockCustomer);
      expect(token).toBe('reg-token');
      expect(isAuthenticated).toBe(true);
    });

    it('isAdmin is false after register', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { token: 'reg-token', user: mockCustomer },
      });

      await useAuthStore.getState().register({
        name: 'Customer',
        email: 'customer@test.com',
        password: 'password',
        password_confirmation: 'password',
      });

      expect(useAuthStore.getState().isAdmin).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user and token', async () => {
      useAuthStore.setState({ user: mockCustomer, token: 'tok', isAuthenticated: true });
      vi.mocked(api.post).mockResolvedValueOnce({});

      await useAuthStore.getState().logout();
      const { user, token } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(token).toBeNull();
    });

    it('sets isAuthenticated=false', async () => {
      useAuthStore.setState({ isAuthenticated: true });
      vi.mocked(api.post).mockResolvedValueOnce({});

      await useAuthStore.getState().logout();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('completes even if api call fails', async () => {
      useAuthStore.setState({ user: mockCustomer, token: 'tok', isAuthenticated: true });
      vi.mocked(api.post).mockRejectedValueOnce(new Error('network error'));

      await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('fetchUser', () => {
    it('sets user data on success', async () => {
      useAuthStore.setState({ token: 'valid-token' });
      vi.mocked(api.get).mockResolvedValueOnce({ data: { user: mockCustomer } });

      await useAuthStore.getState().fetchUser();
      expect(useAuthStore.getState().user).toEqual(mockCustomer);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('sets isLoading=false after fetch', async () => {
      useAuthStore.setState({ token: 'valid-token', isLoading: true });
      vi.mocked(api.get).mockResolvedValueOnce({ data: { user: mockCustomer } });

      await useAuthStore.getState().fetchUser();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('calls the API even when token is null', async () => {
      useAuthStore.setState({ token: null, isLoading: true });
      vi.mocked(api.get).mockResolvedValueOnce({ data: { user: mockCustomer } });

      await useAuthStore.getState().fetchUser();
      expect(api.get).toHaveBeenCalledWith('/auth/user');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('clears user on 401 error', async () => {
      useAuthStore.setState({ token: 'expired-token', user: mockCustomer, isAuthenticated: true });
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().fetchUser();
      const { user, token, isAuthenticated } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(token).toBeNull();
      expect(isAuthenticated).toBe(false);
    });

    it('sets isAdmin=true for admin user', async () => {
      useAuthStore.setState({ token: 'valid-token' });
      vi.mocked(api.get).mockResolvedValueOnce({ data: { user: mockAdmin } });

      await useAuthStore.getState().fetchUser();
      expect(useAuthStore.getState().isAdmin).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all auth state', () => {
      useAuthStore.setState({
        user: mockCustomer,
        token: 'tok',
        isAuthenticated: true,
        isAdmin: true,
      });

      useAuthStore.getState().clear();
      const { user, token, isAuthenticated, isAdmin } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(token).toBeNull();
      expect(isAuthenticated).toBe(false);
      expect(isAdmin).toBe(false);
    });

  });
});
