import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:8002";

export const ACCESS_TOKEN_KEY =
  "dynamic_pricing_access_token";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        ACCESS_TOKEN_KEY,
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath =
        window.location.pathname;

      const isAuthPage =
        currentPath === "/login" ||
        currentPath === "/register";

      if (!isAuthPage) {
        localStorage.removeItem(
          ACCESS_TOKEN_KEY,
        );

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;