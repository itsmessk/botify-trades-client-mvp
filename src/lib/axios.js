import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token from memory
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Paths that should never trigger a token refresh
const skipRefreshPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/me'];

// Response interceptor: handle 401 by refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestPath = originalRequest.url?.replace(/^\/api/, '');

    // Don't retry auth endpoints — just let them fail gracefully
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      skipRefreshPaths.some((p) => requestPath?.startsWith(p))
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      localStorage.setItem('accessToken', data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('accessToken');
      return Promise.reject(refreshError);
    }
  }
);

export default api;
