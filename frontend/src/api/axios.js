import axios from "axios";
import { handleDemoRequest, isDemoMode } from "./demoData";

const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    }
    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `http://${hostname}:8080/api`;
    }
    // In production environments (e.g. Vercel) where VITE_API_URL isn't explicitly configured,
    // fallback to relative /api or placeholder to avoid mixed content errors
    return "/api";
};

const API_URL = getApiUrl();

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    // Route to interactive in-memory demo adapter if Demo Mode is active
    if (isDemoMode()) {
        config.adapter = handleDemoRequest;
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If 401/403 unauthorized, redirect to login unless already there
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
                localStorage.removeItem("token");
                localStorage.removeItem("name");
                localStorage.removeItem("email");
                localStorage.removeItem("spendix_demo_mode");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
