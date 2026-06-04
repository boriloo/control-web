import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }   
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login')) {

            originalRequest._retry = true;

            try {
                const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
                    withCredentials: true
                });

                const token = response.data.session?.access_token

                if (!token) throw new Error('No token in refresh response')

                localStorage.setItem("accessToken", token);
                originalRequest.headers.Authorization = `Bearer ${token}`;

                return axios(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);