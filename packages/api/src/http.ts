import axios from "axios";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach Token if available
http.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && token !== "undefined" && token !== "null") {
        // Remove quotes if they exist (sometimes JSON.stringify adds them)
        const cleanToken = token.replace(/"/g, "");
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap Data
http.interceptors.response.use(
  (response) => {
    // Return actual data from backend if available, skipping the axios 'data' wrapper
    return response.data ?? response;
  },
  (error) => {
    // If backend returns a structured error, reject with that specific data
    if (error?.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);