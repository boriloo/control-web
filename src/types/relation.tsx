export interface RelationData {
    id: string,
    senderId: string,
    receiverId: string,
    blockerId: string | null,
    status: 'accepted' | 'pending' | 'blocked',
    createdAt: string,
}
