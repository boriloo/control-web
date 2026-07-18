import { api } from "../lib/axiosConfig"
import { UploadStorageData } from "../types/storage";

export const getStorageService = async (path: string) => {
    const response = await api.get(`/storage/${path}`, {
        responseType: 'blob'
    });

    return URL.createObjectURL(response.data);
}

export const getProxyStorageService = async (path: string) => {
    const response = await api.get(`/storage/proxy/${path}`, {
        responseType: 'blob'
    });

    return URL.createObjectURL(response.data);
}

export const uploadStorageService = async (data: UploadStorageData) => {
    const formData = new FormData();

    formData.append('file', data.file);
    formData.append('type', data.typeOfUpload)


    if (data.desktopId) {
        formData.append('desktopId', data.desktopId);
    }

    const response = await api.post('/storage/upload', formData)

    return response.data
}