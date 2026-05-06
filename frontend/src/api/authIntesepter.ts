import axios, {
  AxiosError,
} from "axios";
import type {
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export type UserRole = "client" | "writer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  user?: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  user?: AuthUser;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const API = axios.create({
  baseURL: `${BACKEND_URL}/api/auth`,
  withCredentials: true,
});

// REQUEST INTERCEPTOR
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryableAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";
    const isRefreshCall = requestUrl.includes("/refresh-token");
    const isLoginCall = requestUrl.includes("/login");
    const isRegisterCall = requestUrl.includes("/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall &&
      !isLoginCall &&
      !isRegisterCall
    ) {
      originalRequest._retry = true;

      try {
        const res = await API.post<RefreshResponse>("/refresh-token");
        const newAccessToken = res.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("New access token not received");
        }

        localStorage.setItem("accessToken", newAccessToken);

        if (!originalRequest.headers) {
          originalRequest.headers = {} as AxiosRequestHeaders;
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return API(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");

        // Avoid forcing a full-page redirect from here to stop potential reload loops.
        // Upstream code (AuthProvider) will observe missing/invalid auth and navigate appropriately.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// REGISTER
export const registerUser = async (
  data: RegisterPayload
): Promise<AxiosResponse<AuthResponse>> => {
  const res = await API.post<AuthResponse>("/register", data);

  if (res.data?.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
  }

  return res;
};

// LOGIN
export const loginUser = async (
  data: LoginPayload
): Promise<AxiosResponse<AuthResponse>> => {
  const res = await API.post<AuthResponse>("/login", data);

  if (res.data?.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
  }

  return res;
};

// GET ME
export const getMe = () => API.get<{ success: boolean; user: AuthUser }>("/me");

// REFRESH TOKEN
export const refreshToken = async (): Promise<AxiosResponse<RefreshResponse>> => {
  const res = await API.post<RefreshResponse>("/refresh-token");

  if (res.data?.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
  }

  return res;
};

// LOGOUT
export const logoutUser = async (): Promise<
  AxiosResponse<{ success: boolean; message: string }>
> => {
  const res = await API.post<{ success: boolean; message: string }>("/logout");
  localStorage.removeItem("accessToken");
  return res;
};

export default API;
