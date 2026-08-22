import axios from "axios";
import { toast } from "sonner";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("salesgenie_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || error.message || "Something went wrong.";
    toast.error(typeof message === "string" ? message : "An error occurred");
    return Promise.reject(error);
  }
);

export const apiClient = {
  get: async (path, config = {}) => (await client.get(path, config)).data,
  post: async (path, body, config = {}) => (await client.post(path, body, config)).data,
  put: async (path, body, config = {}) => (await client.put(path, body, config)).data,
  delete: async (path, config = {}) => (await client.delete(path, config)).data,
};

export default client;