import axios from "axios";

const API = axios.create({
  baseURL: "Backend_URL/api/auth",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ FIX 1: Ignore 401s from login, register, and refresh routes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh-token") &&
      !originalRequest.url.includes("/login") && 
      !originalRequest.url.includes("/register") 
    ) {
      originalRequest._retry = true;

      try {
        const res = await API.post("/refresh-token");
        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");

        // Do not perform a hard redirect here (causes reload loops).
        // Let the app detect missing auth via `getMe()` / AuthProvider and handle navigation.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// REGISTER
export const registerUser = (data: any) => API.post("/register", data);

// LOGIN
export const loginUser = async (data: any) => {
  const res = await API.post("/login", data);
  if (res.data?.accessToken) {
    localStorage.setItem("accessToken", res.data.accessToken);
  }
  return res;
};

// GET ME
export const getMe = () => API.get("/me");

// REFRESH TOKEN
export const refreshToken = () => API.post("/refresh-token");

// LOGOUT
export const logoutUser = async () => {
  const res = await API.post("/logout");
  localStorage.removeItem("accessToken");
  return res;
};

export default API;