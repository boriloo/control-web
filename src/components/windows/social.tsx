import { Ban, Check, Clipboard, Maximize, Minus, UserRoundX, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useUser } from "../../context/AuthContext";
import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects, UserData } from "../../types/auth";
import { getUserByEmailService, getUserByIdService } from "../../services/userServices";
import { createRelationService, getAcceptedRelationsService, getBlockedRelationsService, getPendingRelationsService } from "../../services/relationServices";
import { RelationData } from "../../types/relation";
// import { userWithEmailExists } from "../../services/auth";
// import { createRelation } from "../../services/relations";
// import { getPublicUserByEmail } from "../../services/public";

type section = "friends" | "pending" | "blocked"

export default function SocialWindow() {
    const { user } = useUser();
    const { social } = useWindowContext();
    const [friendListSection, setFriendListSection] = useState<section>('friends')
    const [isFullsceen, setIsFullscreen] = useState<boolean>(false)
    const [canSend, setCanSend] = useState<boolean>(false)
    const [emailReq, setEmailReq] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [allFriends, setAllFriends] = useState<UserData[]>([])
    const [allPending, setAllPending] = useState<UserData[]>([])
    const [allReceived, setAllReceived] = useState<UserData[]>([])
    const [allBlocked, setAllBlocked] = useState<UserData[]>([])


    const handleAreaClick = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target != e.currentTarget) return;
        social.closeWindow();
    }

    useEffect(() => {
        const myId = user?.id
        const getAllLists = async () => {
            const friends = await getAcceptedRelationsService()
            const pending = await getPendingRelationsService()
            const blocked = await getBlockedRelationsService()

            // friends — converte todos para o user que não é eu
            const friendUsers = await Promise.all(
                friends.map(async (relation: any) => {
                    const otherId = relation.sender_id === myId
                        ? relation.receiver_id
                        : relation.sender_id
                    return await getUserByIdService(otherId)
                })
            )
            setAllFriends(friendUsers)


            const receivedPending = pending.filter((r: any) => r.receiver_id === myId)
            const sentPending = pending.filter((r: any) => r.sender_id === myId)

            const receivedUsers = await Promise.all(
                receivedPending.map(async (relation: any) => await getUserByIdService(relation.sender_id))
            )
            const sentUsers = await Promise.all(
                sentPending.map(async (relation: any) => await getUserByIdService(relation.receiver_id))
            )

            setAllPending([...sentUsers])

            setAllReceived([...receivedUsers])

            // blocked — converte todos para o user que não é eu
            const blockedUsers = await Promise.all(
                blocked.map(async (relation: any) => {
                    const otherId = relation.sender_id === myId
                        ? relation.receiver_id
                        : relation.sender_id
                    return await getUserByIdService(otherId)
                })
            )
            setAllBlocked(blockedUsers)
        }

        getAllLists()
    }, [])


    useEffect(() => {
        if (!user) return;
        const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if (regex.test(emailReq.toLowerCase())) {
            if (emailReq === user.email) {
                setCanSend(false)
            } else {
                setCanSend(true)
            }
        } else {
            setCanSend(false)
        }
    }, [emailReq])


    const handleSendFriendRequest = async (email: string) => {
        try {
            setError(null)
            const friendUser = await getUserByEmailService(email)

            console.log('FRIEND USER', friendUser)

            if (!friendUser) {
                setError("Este usuário não existe ou não aceita pedidos de amizade.")
                return;
            }

            const newRelation = await createRelationService(friendUser)

            setAllPending(prev => [...prev, newRelation])

        } catch (err) {
            console.log('ERRO!', err)
            throw err
        }
    }

    const viewedList = useCallback(() => {

        if (friendListSection === 'friends') {
            if (allFriends.length > 0) {
                return (
                    <>
                        <div className="text-md opacity-75 mt-2">Amigos</div>
                        {
                            allPending.map((user) => {
                                return (<div className="group flex flex-row items-center gap-3 py-2.5 px-3.5 rounded-md border-1 border-white/10 bg-white/6">
                                    <img src={`${user?.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-10 h-10 rounded-full" />
                                    <div className="flex flex-col">
                                        <h1 className="text-lg">{user.name}</h1>
                                        <p className="text-[14px] opacity-75">{user.email}</p>
                                    </div>

                                    <div className="flex flex-row gap-4 ml-auto">
                                        <UserRoundX className="cursor-pointer transition-all opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100 hover:bg-red-500/10 
                                hover:border-red-300 hover:text-red-300 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                                        <Ban className="cursor-pointer transition-all opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100 hover:bg-red-500/15 
                                hover:border-red-500 hover:text-red-500 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                                    </div>
                                </div>)
                            })
                        }
                    </>
                )

            } else {
                return (<div className="flex flex-1 justify-center items-center flex-col gap-6">
                    <img src="/assets/images/ghost.png" className="w-25 opacity-60" />
                    <p className="text-xl font-regular opacity-70">Você ainda não tem amigos.</p>
                </div>)
            }

        } else if (friendListSection === 'pending') {
            if (allPending.length > 0 || allReceived.length > 0) {
                return (<div className="w-full h-full flex flex-col gap-3 mt-2">
                    {allReceived.length > 0 && (
                        <>
                            <div className="text-md opacity-75">Pedidos de amizade recebidos</div>
                            {
                                allReceived.map((user, index) => {
                                    return (
                                        <div key={user.id || index} className="group flex flex-row items-center gap-3 py-2.5 px-3.5 rounded-md border-1 border-white/10 bg-white/6">
                                            <img src={`${user?.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-10 h-10 rounded-full" />
                                            <div className="flex flex-col">
                                                <h1 className="text-lg">{user.name}</h1>
                                                <p className="text-[14px] opacity-75">{user.email}</p>
                                            </div>

                                            <div className="flex flex-row gap-4 ml-auto">
                                                <Check className="cursor-pointer transition-all hover:bg-green-500/10 hover:border-green-500 hover:text-green-500 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                                                <X className="cursor-pointer transition-all hover:bg-red-300/15 hover:border-red-300 hover:text-red-300 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                                                <Ban className="cursor-pointer transition-all hover:bg-red-500/15 hover:border-red-500 hover:text-red-500 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </>
                    )}
                    {allPending.length > 0 && (
                        <>
                            <div className={`${allReceived.length > 0 ? 'mt-3' : ''}  text-md opacity-75`}>Pedidos de amizade enviados</div>
                            {
                                allPending.map((user) => {
                                    return (<div className="group flex flex-row items-center gap-3 py-2.5 px-3.5 rounded-md border-1 border-white/10 bg-white/6">
                                        <img src={`${user?.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-10 h-10 rounded-full" />
                                        <div className="flex flex-col">
                                            <h1 className="text-lg">{user.name}</h1>
                                            <p className="text-[14px] opacity-75">{user.email}</p>
                                        </div>

                                        <div className="flex flex-row gap-4 ml-auto">
                                            <X className="cursor-pointer transition-all hover:bg-red-300/15 
                                hover:border-red-300 hover:text-red-300 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                                        </div>
                                    </div>)
                                })
                            }
                        </>
                    )}
                </div>
                )

            } else {
                return (<div className="flex flex-1 justify-center items-center flex-col gap-6">
                    <img src="/assets/images/cat.png" className="w-25 opacity-60" />
                    <p className="text-xl font-regular opacity-70">Você não tem pedidos pendentes.</p>
                </div>)
            }


        } else if (friendListSection === 'blocked') {
            if (allBlocked.length > 0) {
                return allBlocked.map((relation) => {
                    return (<div className="group flex flex-row items-center gap-2.5 p-3.5 rounded-sm bg-(--color-dark)">
                        <img src={`${user?.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-10 h-10 rounded-full" />
                        <h1 className="text-lg">{relation.id}</h1>
                        <div className="flex flex-row gap-4 ml-auto">
                            <UserRoundX className="cursor-pointer transition-all opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100 hover:bg-red-500/10 
                                hover:border-red-300 hover:text-red-300 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                            <Ban className="cursor-pointer transition-all opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100 hover:bg-red-500/15 
                                hover:border-red-500 hover:text-red-500 w-9.5 h-9.5 p-1.5 bg-white/5 border border-white/40 rounded-md" />
                        </div>
                    </div>)
                })
            } else {
                return (<div className="flex flex-1 justify-center items-center flex-col gap-6">
                    <img src="/assets/images/happy-ghost.png" className="w-25 opacity-60" />
                    <p className="text-xl font-regular opacity-70">Você não tem pessoas bloqueadas.</p>
                </div>)
            }
        }
    }, [friendListSection, allFriends, allPending, allBlocked])


    return (

        <div onClick={handleAreaClick} className={`${isFullsceen ? 'pb-[40px]' : ' p-2 pb-[50px]'} ${social.currentStatus === "open" ? returnFilterEffects() : 'pointer-events-none'} 
        fixed z-100 flex-1 flex justify-center items-center w-full h-screen transition-all duration-500 cursor-pointer`}>
            <div className={`${isFullsceen ? 'max-w-full max-h-full' : 'rounded-lg max-w-[1200px] max-h-[700px]'} ${social.currentStatus === "open" ? 'scale-100' : 'scale-0 '} 
                bg-(--color-dark) cursor-default origin-bottom relative transition-all duration-300 flex flex-col w-full h-full overflow-y-auto`}>

                <div className="z-50 sticky select-none top-0 w-full bg-black/50 h-8 flex flex-row justify-between items-center backdrop-blur-[2px]">
                    <p className="p-2">Social</p>
                    <div className="flex flex-row h-full">
                        <Minus onClick={social.minimizeWindow} className="transition-colors cursor-pointer p-1 px-2 w-9 h-full hover:bg-white/20" />
                        <Maximize onClick={() => setIsFullscreen(!isFullsceen)} className="transition-colors cursor-pointer p-1 px-2 w-9 h-full hover:bg-white/20" />
                        <X onClick={social.closeWindow} className="transition-colors cursor-pointer p-1 px-2 w-9 h-full hover:bg-red-500" />
                    </div>
                </div>

                <div className="flex flex-row w-full items-start flex-wrap h-full">
                    <div className="flex-1 flex flex-col gap-2 p-8 border-1 h-full border-white/10 rounded-b-lg w-full max-w-[300px] bg-(--color-darker)/35 items-center">

                        <img src={`${user?.profileImage || "/assets/images/profile.png"}`} alt="" className="z-20 w-23 h-23 rounded-full" />
                        <div className="flex flex-col items-center mt-2">
                            <h1 className="text-lg font-bold">{user?.name as string}</h1>
                            <p className="opacity-60">{user?.email as string}</p>
                        </div>

                        <div className="flex flex-row p-4 w-full justify-around rounded-lg bg-(--color-regular) gap-1 mt-2">
                            <div className="flex flex-col items-center gap-1">
                                <p>{allFriends.length}</p>
                                <p>Amigos</p>
                            </div>
                            <div className="h-full w-[1px] bg-white/20"></div>
                            <div className="flex flex-col items-center gap-1">
                                <p>15</p>
                                <p>Colegas</p>
                            </div>
                        </div>

                        <button className="flex flex-row gap-2 items-center p-1 mt-2 text-[16px] 
                            px-3 border-[1.5px] border-white/20 cursor-pointer rounded-md bg-(--color-dark) self-center text-white transition-all hover:border-(--color-lighter) hover:text-(--color-lighter) hover:bg-zinc-950">
                            <p>Copiar Link de amizade</p>
                            <Clipboard size={16} />
                        </button>


                    </div>
                    <div className="flex-2 flex flex-col gap-2 p-6 h-full">
                        <div className="flex flex-row gap-2">
                            <input value={emailReq} onChange={(e) => setEmailReq(e.target.value)} type="email" placeholder="usuario@email.com"
                                className="bg-zinc-950/40 border-1 flex-1 rounded-sm p-1.5 px-3 border-zinc-800
                            hover:bg-zinc-950/60 transition-all outline-none focus:border-zinc-500 focus:bg-zinc-950/80" />

                            <button disabled={!canSend} onClick={() => handleSendFriendRequest(emailReq)}
                                className={`${!canSend && 'pointer-events-none saturate-0 opacity-80'} p-1 px-2 border-1 rounded-sm text-(--color-light) border-(--color-light) hover:bg-(--color-light) hover:text-white
                            transition-all cursor-pointer`}>Enviar pedido</button>
                        </div>

                        <p className={`${error ? 'p-1 px-2' : 'p-0 px-0 opacity-0'} transition-all rounded-md text-red-500 bg-red-500/10 self-start`}>{error}</p>

                        <div className="min-h-40 p-4 gap-3 rounded-md flex flex-col h-full">

                            <div className="flex flex-row w-full relative select-none">
                                <div className={`${friendListSection === 'friends' ? 'left-[1px]' : friendListSection === 'pending' ? 'left-[33.5%]' : 'left-[66.8%]'} w-[33%] transition-all h-full absolute
                                 bg-(--color-light) z-[-1] rounded-md`}></div>
                                <div className="flex-1 flex justify-center">
                                    <h1 onClick={() => setFriendListSection('friends')} className={`${friendListSection === 'friends' ? 'text-white w-full' :
                                        ' '}
                                     p-1.5 text-lg w-full hover:bg-(--color-light)/10 rounded-sm text-center transition-all cursor-pointer`}>Amigos</h1>
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <h1 onClick={() => setFriendListSection('pending')} className={`${friendListSection === 'friends' ? 'text-white w-full ' :
                                        ' '}
                                     p-1.5 text-lg w-full hover:bg-(--color-light)/10 rounded-sm text-center transition-all cursor-pointer`}>Pendentes</h1>
                                </div>
                                <div className="flex-1 flex justify-center items-center">
                                    <h1 onClick={() => setFriendListSection('blocked')} className={`${friendListSection === 'friends' ? 'text-white w-full' :
                                        ' '}
                                     p-1.5 text-lg w-full hover:bg-(--color-light)/10 rounded-sm text-center transition-all cursor-pointer`}>Bloqueados</h1>
                                </div>
                            </div>

                            {viewedList()}


                        </div>
                    </div>

                </div>
            </div>
        </div >
    )
}