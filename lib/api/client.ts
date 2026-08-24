import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, COMPANY_ID } from '../utils/constants';

// Extend axios config to allow _retry flag
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// --------------------------------------------------
// Request interceptor: attach Bearer token
// --------------------------------------------------
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// --------------------------------------------------
// Response interceptor: auto-refresh on 401
// --------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('refreshToken')
            : null;

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Clear auth state on refresh failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// --------------------------------------------------
// Helper to append companyId to all public calls
// --------------------------------------------------
export function withCompany(params: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...params, companyId: COMPANY_ID };
}

export default client;
