import axios from 'axios';

type TokenGetter = () => string | null;
type OnUnauthorized = () => void;

let getToken: TokenGetter = () => null;
let onUnauthorized: OnUnauthorized = () => {};

export function configureAuth(tokenGetter: TokenGetter, unauthorizedHandler: OnUnauthorized) {
  getToken = tokenGetter;
  onUnauthorized = unauthorizedHandler;
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export { api };
