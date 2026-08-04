import { Bot, ExternalLink, Menu, Plus, X } from "lucide-react"
import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects } from "../../types/auth";
import { useUser } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { acceptDesktopInviteService, deleteDesktopInviteService, getDesktopByIdService, getDesktopByMembershipService, getDesktopByOwnerService, getPendingInvitesService, getSafeDesktopByIdService } from "../../services/desktopServices";
import { DesktopData } from "../../types/desktop";
import { useFileContext } from "../../context/FileContext";
import { getSwatches } from "colorthief";

export default function ListDesktopsWindow() {
    const { t } = useTranslation();
    const { changeRootFiles } = useFileContext();
    const { user, currentDesktop, changeCurrentDesktop, standartDesktop } = useUser();
    const { minimazeAllWindows } = useAppContext();
    const { listdt, newdt, dtConfig } = useWindowContext();
    const [loading, setLoading] = useState<boolean>(false);
    const [allDesktops, setAllDesktops] = useState<any[]>([]);
    const [desktopInvites, setDesktopInvites] = useState<any[]>([])


    const handleAreaClick = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target != e.currentTarget) return;
        listdt.minimizeWindow();
    }

    const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    };

    const getAllDesktops = async () => {

        const responseDesktops = await getDesktopByMembershipService();

        const desktopsWithColors = await Promise.all(
            responseDesktops.map(async (desktop: DesktopData) => {
                const sttDesktop = await standartDesktop(desktop);

                const imgElement = await loadImage(sttDesktop.backgroundImage);

                const response = (await getSwatches(imgElement)) as any;

                const swatch = response?.Vibrant || response?.Muted;

                const { _r, _g, _b } = swatch.color;

                const hex = `#${(1 << 24 | _r << 16 | _g << 8 | _b).toString(16).slice(1)}`;

                return {
                    ...sttDesktop,
                    thisColor: hex || '#000000'
                };
            })
        );

        console.log('OS DDESKTOPSSS,', desktopsWithColors)

        setAllDesktops(desktopsWithColors);
    };

    useEffect(() => {
        setAllDesktops([]);

        const getAllInvites = async () => {
            const invites = await getPendingInvitesService();
            const desktops = await Promise.all(
                invites.map(async (invite: any) => {
                    const mapDesktop = await getSafeDesktopByIdService(invite.desktop_id);
                    return {
                        id: invite.id,
                        desktopId: mapDesktop.id,
                        name: mapDesktop.name,
                    }
                })
            );
            setDesktopInvites(desktops)
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setAllDesktops([]);

                await Promise.all([
                    getAllDesktops(),
                    getAllInvites()
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [user, dtConfig.desktop, currentDesktop?.id]);

    const handleChangeDesktop = async (id: string) => {
        setLoading(true)
        try {

            changeRootFiles([])

            const response = await getDesktopByIdService(id)

            changeCurrentDesktop(response)

            localStorage.setItem('last-desktop', response.id);

            listdt.closeWindow()
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 1000)
        }
    }

    const acceptInvite = async (inviteId: string) => {
        try {
            setLoading(true)
            await acceptDesktopInviteService(inviteId)
            setDesktopInvites(prev => prev.filter((invite) => invite.id != inviteId))
            await getAllDesktops()
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const denyInvite = async (inviteId: string) => {
        try {
            setLoading(true)
            await deleteDesktopInviteService(inviteId)
            setDesktopInvites(prev => prev.filter((invite) => invite.id != inviteId))
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        listdt.currentStatus != 'closed' && <div onClick={handleAreaClick} className={`${listdt.currentStatus === 'open' ? returnFilterEffects() : 'pointer-events-none '} 
        transition-all duration-500 fixed z-100 w-full h-screen flex justify-center items-center md:p-4 p-2 pb-[50px] cursor-pointer`}>
            <div style={{ transition: 'background-color 1s, scale 0.2s, opacity 0.2s' }} className={`${listdt.currentStatus === 'open' ? 'scale-100' : 'scale-50 opacity-0'} 
            cursor-default bg-(--color-dark) origin-center rounded-md p-4 w-full border-1 border-(--color-whity)/10
                max-w-[700px] max-h-full flex flex-col gap-4 overflow-y-auto transition-all relative pb-10 `}>
                <X onClick={listdt.minimizeWindow} size={35} className="absolute top-0 right-0 p-2 rounded-bl-lg cursor-pointer transition-all hover:bg-red-500" />
                <h1 className="text-[24px]">{t("listdt.title")}</h1>
                <div className="w-full flex flex-row gap-2 mt-[-10px] justify-between items-end">
                    <div className={`opacity-75 text-md`}>Seus desktops</div>

                    {(allDesktops.length >= 5) ?
                        (<div className="p-2 px-4 bg-zinc-800 rounded-full flex flex-row justify-center items-center">
                            <p className="text-[16px] text-center">Máx. de desktops próprios atingido</p>
                        </div>)
                        :
                        (<button onClick={() => {
                            minimazeAllWindows();
                            newdt.openWindow();
                            dtConfig.changeDesktop(null)
                        }} className={`${loading && 'saturate-0 scale-90 opacity-35 pointer-events-none'} bg-rose-500 transition-all cursor-pointer flex flex-row gap-2 group items-center
                    hover:bg-white hover:text-(--color-regular) p-2 hover:px-4 rounded-full font-medium`}>
                            <Plus />
                            <p className="w-0 overflow-hidden truncate ml-[-7px] group-hover:w-40 text-[18px]/[22px]">{t("listdt.create")}</p>
                        </button>)}


                </div>

                <div className={`${loading ? 'opacity-20 saturate-0 pointer-events-none' : ''} transition-all flex flex-col gap-3 w-full max-h-[500px] items-center overflow-y-auto overflow-x-hidden`}>

                    <div onClick={() => {
                        minimazeAllWindows()
                        dtConfig.openWindow()
                        dtConfig.changeDesktop(currentDesktop)
                    }} className="group flex flex-row w-full p-4 justify-between bg-(--color-light) min-h-17 max-h-17 items-center rounded-sm 
                    transition-all overflow-hidden cursor-pointer relative gap-2 hover:min-h-25 hover:max-h-25">
                        <div className="flex flex-row gap-4 relative">
                            <div className="gap-1 z-2 bg-black/30 backdrop-blur-md p-1 px-3 rounded-full flex flex-row text-lg white 
                                    group-hover:opacity-0 transition-all">
                                <p>Atual -</p>
                                {currentDesktop?.name}
                            </div>
                            <div className="gap-1 z-2 bg-black/40 opacity-0 backdrop-blur-md p-1 px-3 rounded-full
                                    flex flex-row text-lg white w-42 text-center justify-center group-hover:scale-105 transition-all group-hover:opacity-100 group-hover:ml-0 absolute">
                                Clique para editar
                            </div>
                        </div>


                        <div className="absolute w-full h-full left-0 top-0 z-[0] bg-(--color-light) transition-all duration-500 group-hover:brightness-100 brightness-80">
                            <div className="w-[95%] group-hover:w-[98%] transition-all duration-400 h-full absolute "
                                style={{ backgroundImage: `url(${currentDesktop?.backgroundImage})`, backgroundPosition: 'center center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                            </div>
                            <div className="w-[95%] group-hover:w-[98%] transition-all duration-400 h-full z-10 bg-linear-to-r from-transparent to-(--color-light) absolute">

                            </div>
                        </div>

                    </div>

                    {allDesktops.length >= 1 &&
                        allDesktops.filter(d => d.id !== currentDesktop?.id).map((desktop) => (
                            <div onClick={() => handleChangeDesktop(desktop.id)} className="group flex flex-row w-full p-4 justify-between bg-(--color-light) min-h-17 max-h-17 items-center rounded-sm 
                    transition-all overflow-hidden cursor-pointer relative gap-2 hover:min-h-25 hover:max-h-25">
                                <div className="flex flex-row gap-4 relative">
                                    <div className="gap-1 z-2 bg-black/30 backdrop-blur-md p-1 px-3 rounded-full flex flex-row text-lg white 
                                    group-hover:opacity-0 transition-all">
                                        {desktop?.name}
                                    </div>
                                    <div className="gap-1 z-2 bg-black/40 opacity-0 backdrop-blur-md p-1 px-3 rounded-full
                                    flex flex-row text-lg white w-40 text-center justify-center group-hover:scale-105 transition-all group-hover:opacity-100 group-hover:ml-0 absolute">
                                        Clique para abrir
                                    </div>
                                </div>


                                <p onClick={(e) => {
                                    e.stopPropagation()
                                    minimazeAllWindows()
                                    dtConfig.openWindow()
                                    dtConfig.changeDesktop(desktop)
                                }} className="transition-all opacity-0 z-2 mr-[-20px] group-hover:opacity-100 group-hover:mr-1 text-white 
                                bg-black/40 hover:bg-white hover:text-black backdrop-blur-md p-2 px-4 rounded-full text-[18px] hover:scale-104">Editar</p>

                                <div
                                    key={desktop.id}
                                    className="absolute w-full h-full left-0 top-0 z-[0] transition-all duration-500 group-hover:brightness-100 brightness-80"
                                    style={{ backgroundColor: desktop.thisColor }}
                                >
                                    <div className="w-[95%] group-hover:w-[98%] transition-all duration-400 h-full absolute"
                                        style={{ backgroundImage: `url(${desktop?.backgroundImage})`, backgroundPosition: 'center center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}
                                    />
                                    <div
                                        className="w-[95%] group-hover:w-[98%] transition-all duration-400 h-full z-10 absolute"
                                        style={{ background: `linear-gradient(to right, transparent, ${desktop.thisColor})` }}
                                    />
                                </div>

                            </div>

                        ))
                    }

                    <div className={`opacity-75 text-md w-full mt-2`}>Convites</div>

                    {desktopInvites.length >= 1 ?
                        desktopInvites.map((invite) => (
                            <div key={invite.id} onClick={() => acceptInvite(invite.id)} className="group flex flex-row w-full p-3 px-5 items-center bg-(--color-darker)/70 border-2 border-transparent 
                            cursor-pointer hover:bg-[#081D12] hover:border-green-500 relative min-h-17 max-h-17 
                            rounded-sm transition-all justify-start gap-4">
                                <h1 className="text-lg mt-[-4px] group-hover:scale-105 origin-center transition-all">
                                    {invite.name}
                                </h1>

                                <p className="transition-all opacity-0 ml-[-10px] group-hover:opacity-100 group-hover:ml-0 text-green-500">Clique para aceitar</p>
                                <div className="flex flex-row gap-2 items-center">


                                    <div onClick={(e) => {
                                        e.stopPropagation()
                                        denyInvite(invite.id)
                                    }} className="peer absolute right-0 h-full cursor-pointer transition-all opacity-0 group-hover:opacity-100 group-hover:w-50
                                    hover:border-(--color-lighter) w-0 p-2 hover:bg-red-500 hover:text-white overflow-hidden z-20
                                    bg-linear-to-r from-[#081D12] to-[#120505] hover:from-transparent hover:to-transparent hover:pr-12
                                    bg-zinc-950 text-red-500 flex flex-row items-center gap-2 justify-end pr-5">
                                        <X size={28} />
                                        <p className="text-[18px]">Recusar</p>
                                    </div>

                                    {/* mascara de delete */}
                                    <div className="absolute w-full h-full left-0 scale-y-106 scale-x-[100.6%] top-0 z-10 bg-black flex flex-row gap-4 items-center p-3 px-5 border-2 border-red-500
                                    rounded-sm opacity-0 pointer-events-none peer-hover:opacity-100 transition-all">
                                        <h1 className="text-lg mt-[-4px] scale-x-105 scale-y-101 origin-center transition-all text-red-300">
                                            {invite.name}
                                        </h1>

                                        <p className="transition-all peer-hover:opacity-100 text-red-500">
                                            Recusar Convite
                                        </p>
                                    </div>

                                </div>
                            </div>
                        )) :
                        <div className="p-2 w-full flex flex-col items-center gap-2">
                            <Bot size={50} />
                            <h1 className="text-center text-lg">Você não tem convites pendentes</h1>
                        </div>
                    }


                </div>
            </div>
        </div>
    )
}