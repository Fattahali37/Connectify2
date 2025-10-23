import axios from "axios";
import { url } from "../baseUrl";

const axiosInstance = axios.create({});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Preserve any Authorization header already set elsewhere
    const existingAuthHeader =
      config.headers?.Authorization || config.headers?.authorization;

    if (existingAuthHeader) {
      return config;
    }

    // Prefer admin token if available
    const adminAuthRaw = localStorage.getItem("adminAuth");
    const adminToken = (() => {
      try {
        return adminAuthRaw ? JSON.parse(adminAuthRaw)?.token : null;
      } catch (_) {
        return null;
      }
    })();

    const userAccessToken = localStorage.getItem("access_token");

    const tokenToUse = adminToken || userAccessToken;

    if (!config.headers) config.headers = {};
    if (tokenToUse) {
      config.headers["Authorization"] = `Bearer ${tokenToUse}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if error.response exists (network errors won't have a response)
    if (!error.response) {
      console.error("Network Error: Backend server may be down", error.message);
      // Add a more user-friendly error message
      error.message =
        "Unable to connect to server. Please ensure the backend is running on " +
        (error.config?.baseURL || "http://localhost:8000");
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axiosInstance.post(`${url}/auth/token`, {
            token: refreshToken,
          });
          localStorage.setItem("access_token", response.data.access_token);

          axiosInstance.defaults.headers["Authorization"] =
            "Bearer " + response.data.access_token;
          originalRequest.headers["Authorization"] =
            "Bearer " + response.data.access_token;
          return await axiosInstance(originalRequest);
        } catch (err) {
          console.log(err);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const api = axiosInstance;
