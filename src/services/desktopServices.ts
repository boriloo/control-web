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


    const response = await api.patch(`/desktop/${id}`, body)
    return response.data
}

export const deleteDesktopService = async (id: string) => {
    const response = await api.delete(`/desktop/${id}`,);

    return (response).data;
}

export const createDesktopInviteService = async (desktopId: string, receiverId: string) => {
    const response = await api.post(`/desktop/invite/${desktopId}/${receiverId}`);
    return response.data;
};

export const getPendingDesktopInvitesService = async (desktopId: string) => {
    const response = await api.get(`/desktop/invite/${desktopId}`);
    return response.data;
};

export const getPendingInvitesService = async () => {
    const response = await api.get("/desktop/invite");
    return response.data;
};

export const acceptDesktopInviteService = async (inviteId: string) => {
    const response = await api.put(`/desktop/accept/${inviteId}`);
    return response.data;
};

export const deleteDesktopInviteService = async (inviteId: string) => {
    const response = await api.delete(`/desktop/invite/${inviteId}`);
    return response.data;
};