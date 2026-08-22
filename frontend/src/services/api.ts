import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach Auth Token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Uniform Error Transformation
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    let customMessage = 'An unexpected server error occurred.';
    if (error.response) {
      const data = error.response.data as { detail?: string; message?: string };
      customMessage = data.detail || data.message || `HTTP ${error.response.status} Error`;
    } else if (error.request) {
      customMessage = 'Unable to reach backend API. Is FastAPI server running at http://127.0.0.1:8000?';
    }
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;
