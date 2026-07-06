import { UserPlus, X } from "lucide-react"
import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects } from "../../types/auth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    createDesktopInviteService,
    getPendingDesktopInvitesService,
    deleteDesktopInviteService
} from "../../services/desktopServices";
import { useFileContext } from "../../context/FileContext";
import { getUserByIdService } from "../../services/userServices";

export default function SendInviteWindow() {
    const { t } = useTranslation();
    const { changeRootFiles } = useFileContext();
    const { sendInvite } = useWindowContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);

    const availableFriends = sendInvite.friends.filter(
        (friend) => !pendingInvites.some((invite) => invite.userId === friend.id)
    );


    useEffect(() => {
        const fetchPendingInvites = async () => {
            try {
                const data = await getPendingDesktopInvitesService(sendInvite.desktop?.id as string);
                const pendingData = await Promise.all(
                    data.map(async (invite: any) => {
                        const user = await getUserByIdService(invite.receiver_id);
                        console.log('PEGUEI USER', user)
                        return {
                            id: invite.id,
                            userId: user.id,
                            name: user.name,
                            email: user.email,
                            profileImage: user.profile_image,
                            desktopId: invite.desktop_id
                        };
                    })
                );
                setPendingInvites(pendingData);
            } catch (err) {
                console.error("Erro ao buscar convites pendentes", err);
            }
        };

        fetchPendingInvites();

    }, [sendInvite.desktop]);

    const handleAreaClick = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target !== e.currentTarget) return;
        sendInvite.minimizeWindow();
    }

    const createInvite = async (receiverId: string) => {
        try {
            await createDesktopInviteService(sendInvite.desktop?.id as string, receiverId);
            const data = await getPendingDesktopInvitesService(sendInvite.desktop?.id as string);
            const pendingData = await Promise.all(
                data.map(async (invite: any) => {
                    const user = await getUserByIdService(invite.receiver_id);
                    console.log('PEGUEI USER', user)
                    return {
                        id: invite.id,
                        userId: user.id,
                        name: user.name,
                        email: user.email,
                        profileImage: user.profile_image,
                        desktopId: invite.desktop_id
                    };
                })
            );
            setPendingInvites(pendingData);
        } catch (err) {
            console.error(err);
        }
    }

    const cancelInvite = async (inviteId: string) => {
        try {
            await deleteDesktopInviteService(inviteId);
            setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        sendInvite.currentStatus !== 'closed' && <div onClick={handleAreaClick} className={`${sendInvite.currentStatus === 'open' ? returnFilterEffects() : 'pointer-events-none '} 
        transition-all duration-500 fixed z-100 w-full h-screen flex justify-center items-center p-4 pb-[50px] cursor-pointer`}>
            <div style={{ transition: 'background-color 1s, scale 0.2s, opacity 0.2s' }} className={`${sendInvite.currentStatus === 'open' ? 'scale-100' : 'scale-50 opacity-0'} 
            cursor-default bg-(--color-dark) origin-center rounded-md p-4 w-full 
                max-w-[700px] max-h-full flex flex-col gap-4 overflow-y-auto transition-all relative pb-10 `}>
                <X onClick={sendInvite.minimizeWindow} size={35} className="absolute top-0 right-0 p-2 rounded-bl-lg cursor-pointer transition-all hover:bg-red-500" />

                <h1 className="text-[24px]">Convidar para <span className="text-(--color-whity) font-medium">{sendInvite.desktop?.name} (desktop)</span></h1>

                <div className="flex flex-col gap-2 h-full max-h-[400px] overflow-y-auto">

                    {availableFriends.length > 0 && (
                        <>
                            <div className="text-md opacity-75 mb-2">Amigos disponíveis</div>
                            {availableFriends.map((friend) => (
                                <div key={friend.relationId} className="group flex flex-row items-center gap-3 py-2.5 px-3.5 rounded-md bg-white/6">
                                    <img src={`${friend?.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-10 h-10 rounded-full" />
                                    <div className="flex flex-col">
                                        <h1 className="text-lg">{friend.name}</h1>
                                        <p className="text-[14px] opacity-75">{friend.email}</p>
                                    </div>

                                    <div className="flex flex-row gap-4 ml-auto">
                                        <UserPlus
                                            onClick={() => createInvite(friend.id)}
                                            className="cursor-pointer transition-all opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100 hover:bg-green-500/10 hover:border-green-300 hover:text-green-300 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md"
                                        />
                                    </div>
                                </div>
                            ))}
                        </>
                    )}


                    {pendingInvites.length > 0 && (
                        <>
                            <div className="text-md opacity-75">Pendente</div>
                            {pendingInvites.map((invite) => (
                                <div key={invite.id} className="group flex flex-row items-center gap-3 py-2.5 px-3.5 rounded-md bg-white/6">
                                    <img src={`${invite.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-10 h-10 rounded-full" />
                                    <div className="flex flex-col">
                                        <h1 className="text-lg">{invite.name}</h1>
                                        <p className="text-[14px] opacity-75">{invite.email}</p>
                                    </div>

                                    <div className="flex flex-row gap-4 ml-auto">
                                        <X
                                            onClick={() => cancelInvite(invite.id)}
                                            className="cursor-pointer transition-all opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100 hover:bg-red-500/10 
                                hover:border-red-300 hover:text-red-300 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}