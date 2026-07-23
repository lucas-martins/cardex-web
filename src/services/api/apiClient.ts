import axios from "axios";
import { authStorage } from "../../utils/authStorage";

export const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const isAuthEndpoint =
    config.url?.startsWith("/auth/login") ||
    config.url?.startsWith("/auth/register");

  if (isAuthEndpoint) {
    return config;
  }

  const token = authStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      authStorage.removeToken();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
