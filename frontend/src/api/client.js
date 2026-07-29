import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient = {
  get: async (path) => (await client.get(path)).data,
  post: async (path, body) => (await client.post(path, body)).data,
  put: async (path, body) => (await client.put(path, body)).data,
  delete: async (path) => (await client.delete(path)).data,
};