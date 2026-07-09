import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
                localStorage.removeItem("token");
                localStorage.removeItem("name");
                localStorage.removeItem("email");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
