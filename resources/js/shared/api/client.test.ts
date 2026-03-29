import { configureAuth, api } from './client';

const clearMock = vi.fn();
let mockToken: string | null = null;

configureAuth(
  () => mockToken,
  () => clearMock(),
);

beforeEach(() => {
  mockToken = null;
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('api client', () => {
  it('has correct baseURL', () => {
    expect((api.defaults as any).baseURL).toBe('/api');
  });

  it('has withCredentials = true', () => {
    expect(api.defaults.withCredentials).toBe(true);
  });

  it('has correct default Content-Type header', () => {
    const headers = api.defaults.headers as any;
    expect(headers['Content-Type']).toBe('application/json');
  });

  describe('request interceptor', () => {
    it('adds Bearer token when token exists', () => {
      mockToken = 'store-token';

      const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
      const config = { headers: {} as Record<string, string> };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer store-token');
    });

    it('skips Authorization header when no token', () => {
      mockToken = null;

      const requestInterceptor = (api.interceptors.request as any).handlers[0].fulfilled;
      const config = { headers: {} as Record<string, string> };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor (401 handling)', () => {
    it('calls onUnauthorized on 401', async () => {
      const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;
      const error401 = { response: { status: 401 } };

      await expect(responseErrorInterceptor(error401)).rejects.toEqual(error401);
      expect(clearMock).toHaveBeenCalled();
    });

    it('passes through non-401 errors without calling onUnauthorized', async () => {
      const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;
      const error500 = { response: { status: 500 } };

      await expect(responseErrorInterceptor(error500)).rejects.toEqual(error500);
      expect(clearMock).not.toHaveBeenCalled();
    });

    it('passes through errors without a response', async () => {
      const responseErrorInterceptor = (api.interceptors.response as any).handlers[0].rejected;
      const networkError = new Error('Network Error');

      await expect(responseErrorInterceptor(networkError)).rejects.toEqual(networkError);
      expect(clearMock).not.toHaveBeenCalled();
    });
  });
});
