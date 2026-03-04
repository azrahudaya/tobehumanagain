import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

let accessToken: string | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      refreshHandler &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/signup") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      const newToken = await refreshHandler();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    throw error;
  },
);

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setRefreshHandler = (handler: (() => Promise<string | null>) | null) => {
  refreshHandler = handler;
};

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? "Request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
};
