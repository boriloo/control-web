import { UserPlus, X } from "lucide-react"
import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects } from "../../types/auth";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    createDesktopInviteService,
    getPendingDesktopInvitesService,
    deleteDesktopInviteService
} from "../../services/desktopServices";
import { useFileContext } from "../../context/FileContext";
import { getUserByIdService } from "../../services/userServices";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SendInviteWindow() {
    const { t } = useTranslation();
    const { changeRootFiles } = useFileContext();
    const { sendInvite } = useWindowContext();
    const [loading, setLoading] = useState<string[]>([]);
    const [availableFriends, setAvailableFriends] = useState<any[]>([]);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);

    useEffect(() => {
        const friends = sendInvite.friends.filter(
            (friend) => !pendingInvites.some((invite) => invite.userId === friend.id)
        );
        setAvailableFriends(friends);
    }, [sendInvite.friends, pendingInvites]);


    useEffect(() => {
        const fetchPendingInvites = async () => {
            try {
                const data = await getPendingDesktopInvitesService(sendInvite.desktop?.id as string);
                const pendingData = await Promise.all(
                    data.map(async (invite: any) => {
                        const user = await getUserByIdService(invite.receiver_id);
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
                console.log(pendingData)
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
            setLoading(prev => [...prev, receiverId])
            await createDesktopInviteService(sendInvite.desktop?.id as string, receiverId);
            const data = await getPendingDesktopInvitesService(sendInvite.desktop?.id as string);
            const pendingData = await Promise.all(
                data.map(async (invite: any) => {
                    const user = await getUserByIdService(invite.receiver_id);
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
        } finally {
            setLoading(prev => prev.filter((receiver) => receiver != receiverId))
        }
    }

    const cancelInvite = async (inviteId: string) => {
        try {
            setLoading(prev => [...prev, inviteId])
            await deleteDesktopInviteService(inviteId);
            setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(prev => prev.filter((receiver) => receiver != inviteId))
        }
    }

    return (
        sendInvite.currentStatus !== 'closed' && <div onClick={handleAreaClick} className={`${sendInvite.currentStatus === 'open' ? returnFilterEffects() : 'pointer-events-none '} 
        transition-all duration-500 fixed z-100 w-full h-screen flex justify-center items-center p-4 pb-[50px] cursor-pointer`}>
            <div style={{ transition: 'background-color 1s, scale 0.2s, opacity 0.2s' }} className={`${sendInvite.currentStatus === 'open' ? 'scale-100' : 'scale-50 opacity-0'} 
            cursor-default bg-(--color-dark) origin-center rounded-md p-4 w-full  border-1 border-(--color-whity)/10
                max-w-[700px] max-h-full flex flex-col gap-4 overflow-y-auto transition-all relative pb-10 `}>
                <X onClick={sendInvite.minimizeWindow} size={35} className="absolute top-0 right-0 p-2 rounded-bl-lg cursor-pointer transition-all hover:bg-red-500" />

                <h1 className="text-[24px]">Convidar para <span className="text-(--color-whity) font-medium">{sendInvite.desktop?.name} </span><span className="text-rose-500">(desktop)</span></h1>

                <div className="flex flex-col gap-2 h-full max-h-[400px] overflow-y-auto">


                    <div className={` ${availableFriends.length > 0 ? ' opacity-75' : 'opacity-0 h-0'} transition-all overflow-hidden text-md`}>Amigos disponíveis</div>
                    {availableFriends.map((friend) => (
                        <div onClick={() => createInvite(friend.id)} key={friend.id} className={`group flex flex-row justify-between items-center gap-3 py-2.5 px-3.5 rounded-md transition-all 
                                border-1 border-transparent  cursor-pointer ${loading.includes(friend.id) ? 'bg-white/3 scale-95' : 'bg-white/8 hover:bg-green-950/60 hover:border-green-500'}
                                 relative`}>
                            <div className={`${loading.includes(friend.id) ? 'opacity-100' : 'opacity-0'} transition-all absolute w-full h-full flex justify-center 
                                    items-center top-0 left-0  overflow-hidden`}>
                                <DotLottieReact
                                    src="assets/images/pending.lottie"
                                    className="w-70 p-0"
                                    loop
                                    autoplay
                                />
                            </div>

                            <div className={`${loading.includes(friend.id) ? 'opacity-70' : 'opacity-100'} flex flex-row gap-3 items-center`}>
                                <img src={`${friend.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-10 h-10 rounded-full transition-all" />
                                <div className="flex flex-col">
                                    <h1 className={`${loading.includes(friend.id) ? '' : 'group-hover:text-green-400'} text-lg `}>{friend.name}</h1>
                                    <p className={`${loading.includes(friend.id) ? '' : 'group-hover:text-green-400'} text-[14px] opacity-75 `}>{friend.email}</p>
                                </div>
                            </div>


                            <p className={`${loading.includes(friend.id) ? '' : 'group-hover:opacity-100'} text-green-300 bg-black/40 rounded-md p-1 px-2 mr-[-10px] transition-all opacity-0 group-hover:mr-0`}>Convidar para Desktop</p>
                        </div>
                    ))}




                    <div className={`${availableFriends.length > 0 && 'mt-2'} ${pendingInvites.length > 0 ? ' opacity-75' : 'opacity-0 h-0'} transition-all overflow-hidden text-md`}>Pendente</div>
                    {pendingInvites.map((invite) => (
                        <div onClick={() => cancelInvite(invite.id)} key={invite.id} className={`group flex flex-row justify-between items-center gap-3 py-2.5 px-3.5 rounded-md transition-all 
                                border-1 border-transparent cursor-pointer ${loading.includes(invite.id) ? 'bg-white/3 scale-95' : 'bg-white/8 hover:bg-red-950/60 hover:border-red-500'}
                                 relative`}>
                            <div className={`${loading.includes(invite.id) ? 'opacity-100' : 'opacity-0'} transition-all absolute w-full h-full flex justify-center 
                                    items-center top-0 left-0 overflow-hidden`}>
                                <DotLottieReact
                                    src="assets/images/pending.lottie"
                                    className="w-70 p-0"
                                    loop
                                    autoplay
                                />
                            </div>

                            <div className={`${loading.includes(invite.id) ? 'opacity-70' : 'opacity-100'} flex flex-row gap-3 items-center`}>
                                <img src={`${invite.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-10 h-10 rounded-full transition-all" />
                                <div className="flex flex-col">
                                    <h1 className={`${loading.includes(invite.id) ? '' : 'group-hover:text-red-400'} text-lg `}>{invite.name}</h1>
                                    <p className={`${loading.includes(invite.id) ? '' : 'group-hover:text-red-400'} text-[14px] opacity-75 `}>{invite.email}</p>
                                </div>
                            </div>


                            <p className={`${loading.includes(invite.id) ? '' : 'group-hover:opacity-100'} text-red-300 bg-black/40 rounded-md p-1 px-2 mr-[-10px] transition-all 
                                    opacity-0 group-hover:mr-0`}>Cancelar convite</p>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}