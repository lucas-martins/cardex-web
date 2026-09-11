import axios from "axios";
import { authStorage } from "../../utils/authStorage";

export const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
});

function isPublicAuthEndpoint(url?: string): boolean {
  if (!url) {
    return false;
  }

  return (
    url.startsWith("/auth/login") ||
    url.startsWith("/auth/register") ||
    url.startsWith("/auth/forgot-password") ||
    url.startsWith("/auth/reset-password")
  );
}

function isPublicApiEndpoint(url?: string): boolean {
  if (!url) {
    return false;
  }

  return url.startsWith("/public/");
}

apiClient.interceptors.request.use((config) => {
  if (isPublicAuthEndpoint(config.url) || isPublicApiEndpoint(config.url)) {
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
      const requestUrl = error.config?.url;
      const onPublicPage =
        window.location.pathname.startsWith("/share/") ||
        window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname === "/forgot-password" ||
        window.location.pathname === "/reset-password";

      if (
        !isPublicAuthEndpoint(requestUrl) &&
        !isPublicApiEndpoint(requestUrl)
      ) {
        authStorage.removeToken();

        if (!onPublicPage) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);
