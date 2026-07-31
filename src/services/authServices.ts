import { api } from "../lib/axiosConfig"
import { LoginData, RegisterData } from "../types/auth"

export const authRegisterService = async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);

    return (response).data;
}

export const authLoginService = async (data: LoginData) => {
    const response = await api.post("/auth/login", data);

    return (response).data;
}

export const authRefreshService = async () => {
    const response = await api.post(`/auth/refresh`);

    return (response).data;
}

export const authLogoutService = async () => {
    const response = await api.post(`/auth/logout`);

    return (response).data;
}

export const authGoogleLoginService = async () => {
    const response = await api.get('/auth/google')
    const { url } = response.data
    window.location.href = url
}

export const authSetRefreshService = async (refreshToken: string) => {
    const response = await api.post('/auth/set-refresh', { refreshToken })
    return response.data
}

export const authForgotPasswordService = async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
}

export const authResetPasswordService = async (accessToken: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { accessToken, newPassword })
    return response.data
}