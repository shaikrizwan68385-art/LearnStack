import axios from 'axios';

const getBaseURL = () => {
    // If an environment variable is provided, use it.
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // In local development, use port 5000.
        // In production (Vercel), we MUST have NEXT_PUBLIC_API_URL set.
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://${hostname}:5000/api`;
        }
    }
    
    // Default fallback to local backend for safety
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
});


api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const res = await axios.post(`${getBaseURL()}/auth/refresh`, { token: refreshToken });
                    localStorage.setItem('accessToken', res.data.accessToken);
                    return api(originalRequest);
                }
            } catch (err) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
