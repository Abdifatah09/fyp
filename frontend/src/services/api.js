import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

/* =====================
   REQUEST INTERCEPTOR
   ===================== */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* =====================
   RESPONSE INTERCEPTOR
   ===================== */

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If there's no response (network error etc), just reject
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only handle 401s, and only retry once
    if (error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if refresh endpoint itself failed (avoid infinite loop)
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return Promise.reject(error);
    }

    // If refresh is already happening, queue this request until it finishes
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      // IMPORTANT: use plain axios here so we don't trigger this interceptor again
      const { data } = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken; // only if you implement rotation

      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
