import { api } from "../lib/axiosConfig"

export const getStorageService = async (path: string) => {
    const response = await api.get(`/storage/${path}`);

    return (response).data;
}

