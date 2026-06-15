import { api } from "../lib/axiosConfig"

export const createRelationService = async (receiverId: string) => {
    console.log('dentro da REQ', receiverId)

    const response = await api.post(`/relation/${receiverId}`);

    return response.data;
}

export const getAcceptedRelationsService = async () => {
    const response = await api.get("/relation/accepted");

    return response.data;
}

export const getPendingRelationsService = async () => {
    const response = await api.get("/relation/pending");

    return response.data;
}

export const getBlockedRelationsService = async () => {
    const response = await api.get("/relation/blocked");

    return response.data;
}

export const deleteRelationService = async (relationId: string) => {
    const response = await api.delete("/relation", { data: { relationId } });

    return response.data;
}