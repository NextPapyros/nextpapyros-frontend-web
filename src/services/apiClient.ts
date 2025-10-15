import axios from "axios";
import { useUserStore } from "@/store/userStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const { token } = useUserStore();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      const user = useUserStore();
      user.logout();
      // La redirección la maneja el router guard al siguiente intento
    }
    return Promise.reject(err);
  }
);
