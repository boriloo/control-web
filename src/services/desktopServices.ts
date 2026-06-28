import { api } from "../lib/axiosConfig"
import { CreateDesktopData, UpdateDesktopData } from "../types/desktop";

export const createDesktopService = async (data: CreateDesktopData) => {

    const response = await api.post("/desktop", data);
    return response.data;
}

export const getDesktopByIdService = async (id: string) => {
    const response = await api.get(`/desktop/${id}`);

    return (response).data;
}

export const getDesktopByOwnerService = async () => {
    const response = await api.get("/desktop");

    return (response).data;
}

export const updateDesktopService = async (id: string, data: UpdateDesktopData) => {
    const body: any = {}

    if (data.name) body.name = data.name
    if (data.backgroundImage) body.backgroundImage = data.backgroundImage
    if (data.desktopType) body.desktopType = data.desktopType

    console.log('BODY PRA REQ', body)

    const response = await api.patch(`/desktop/${id}`, body)
    return response.data
}

export const deleteDesktopService = async (id: string) => {
    const response = await api.delete(`/desktop/${id}`,);

    return (response).data;
}