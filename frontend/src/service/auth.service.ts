import axios from "axios";

/* ================= TYPES ================= */

export type UserRole = "job_poster" | "job_seeker" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "admin">; // self register only job_poster / job_seeker
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  user?: User;
}

export interface GetMeResponse {
  success: boolean;
  user: User;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

/* ================= AXIOS INSTANCE ================= */

const authAPI = axios.create({
  baseURL: "Backend_URL/api/auth",
  withCredentials: true,
});

/* ================= REQUEST INTERCEPTOR ================= */

authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================= RESPONSE INTERCEPTOR ================= */
/* Optional: auto refresh on 401 */

authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/login") &&
      !originalRequest.url?.includes("/register") &&
      !originalRequest.url?.includes("/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await authAPI.post<RefreshTokenResponse>(
          "/refresh-token"
        );

        const newAccessToken = refreshResponse.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return authAPI(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        throw refreshError;
      }
    }

    throw error;
  }
);

/* ================= API METHODS ================= */

// REGISTER
export const registerUser = async (data: RegisterPayload) => {
  const res = await authAPI.post<AuthSuccessResponse>("/register", data);

  if (res.data.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
  }

  return res.data;
};

// LOGIN
export const loginUser = async (data: LoginPayload) => {
  const res = await authAPI.post<AuthSuccessResponse>("/login", data);

  if (res.data.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
  }

  return res.data;
};

// LOGOUT
export const logoutUser = async () => {
  const res = await authAPI.post<AuthSuccessResponse>("/logout");

  localStorage.removeItem("accessToken");

  return res.data;
};

// GET ME
export const getMe = async () => {
  const res = await authAPI.get<GetMeResponse>("/me");
  return res.data;
};

// REFRESH TOKEN
export const refreshAccessToken = async () => {
  const res = await authAPI.post<RefreshTokenResponse>("/refresh-token");

  if (res.data.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
  }

  return res.data;
};

export default authAPI;