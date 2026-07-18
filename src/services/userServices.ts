import { api } from "../lib/axiosConfig"
import { updateUserData } from "../types/auth";

export const getMeService = async () => {
    const response = await api.get("/user/me");

    return (response).data;
}

export const getUserByEmailService = async (userEmail: string) => {
    const response = await api.get(`/user/email/${userEmail}`);

    return (response).data;
}

export const getUserByIdService = async (userId: string) => {
    const response = await api.get(`/user/${userId}`);

    return (response).data;
}

export const updateUserService = async (data: updateUserData) => {
    const body: any = {};

    if (data.name) body.name = data.name;
    if (data.profileImage) body.profileImage = data.profileImage;

    const response = await api.patch(`/user`, body);

    return response.data;
}

export const deleteUserService = async () => {
    const response = await api.delete(`/user`)

    return (response).data;
}