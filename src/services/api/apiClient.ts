import axios, { type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "../../utils/authStorage";

export const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
});

function resolveRequestPath(url?: string): string {
  if (!url) {
    return "";
  }

  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return new URL(url).pathname;
    }
  } catch {
    return url;
  }

  return url;
}

function isPublicAuthEndpoint(url?: string): boolean {
  const path = resolveRequestPath(url);

  return (
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/forgot-password") ||
    path.includes("/auth/reset-password")
  );
}

function isPublicApiEndpoint(url?: string): boolean {
  const path = resolveRequestPath(url);

  return path.includes("/public/");
}

function clearAuthorizationHeader(config: InternalAxiosRequestConfig) {
  config.headers.delete("Authorization");
}

apiClient.interceptors.request.use((config) => {
  if (isPublicAuthEndpoint(config.url) || isPublicApiEndpoint(config.url)) {
    clearAuthorizationHeader(config);
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
