import { Bot, ExternalLink, Menu, X } from "lucide-react"
import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects } from "../../types/auth";
import { useUser } from "../../context/AuthContext";
import { useAppContext } from "../../context/AppContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDesktopByIdService, getDesktopByOwnerService, getPendingInvitesService, getSafeDesktopByIdService } from "../../services/desktopServices";
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

    useEffect(() => {
        setAllDesktops([]);

        const getAllDesktops = async () => {

            const responseDesktops = await getDesktopByOwnerService();

            const otherDesktops = responseDesktops.filter(
                (desktop: DesktopData) => desktop.id !== currentDesktop?.id
            );

            const desktopsWithColors = await Promise.all(
                otherDesktops.map(async (desktop: DesktopData) => {
                    const sttDesktop = await standartDesktop(desktop);

                    let imgElement;

                    imgElement = sttDesktop.backgroundImage;

                    if (sttDesktop.backgroundImage.startsWith('blob:')) imgElement = await loadImage(sttDesktop.backgroundImage);

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

            setAllDesktops(desktopsWithColors.filter((desktop) => desktop.id != currentDesktop?.id));
        };



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
            console.log('🚫🚫🚫', desktops)
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

    return (
        listdt.currentStatus != 'closed' && <div onClick={handleAreaClick} className={`${listdt.currentStatus === 'open' ? returnFilterEffects() : 'pointer-events-none '} 
        transition-all duration-500 fixed z-100 w-full h-screen flex justify-center items-center p-4 pb-[50px] cursor-pointer`}>
            <div style={{ transition: 'background-color 1s, scale 0.2s, opacity 0.2s' }} className={`${listdt.currentStatus === 'open' ? 'scale-100' : 'scale-50 opacity-0'} 
            cursor-default bg-(--color-dark) origin-center rounded-md p-4 w-full border-1 border-(--color-whity)/10
                max-w-[700px] max-h-full flex flex-col gap-4 overflow-y-auto transition-all relative pb-10 `}>
                <X onClick={listdt.minimizeWindow} size={35} className="absolute top-0 right-0 p-2 rounded-bl-lg cursor-pointer transition-all hover:bg-red-500" />
                <h1 className="text-[24px]">{t("listdt.title")}</h1>
                <div className={`opacity-75 text-md`}>Seus desktops</div>
                <div className={`${loading ? 'opacity-20 saturate-0 pointer-events-none' : ''} transition-all flex flex-col gap-3 w-full max-h-[500px] items-center overflow-y-auto`}>

                    <div onClick={() => {
                        minimazeAllWindows()
                        dtConfig.openWindow()
                        dtConfig.changeDesktop(currentDesktop)
                    }} className="group flex flex-row w-full p-4 justify-between bg-(--color-light) min-h-17 items-center rounded-sm 
                    transition-all overflow-hidden cursor-pointer relative gap-2 hover:min-h-25">
                        <div className="flex flex-row gap-4 relative">
                            <div className="gap-1 z-2 bg-black/30 group-hover:bg-black/20 backdrop-blur-md p-1 px-3 rounded-full flex flex-row text-lg white 
                                    group-hover:opacity-0 transition-all">
                                <p>Atual -</p>
                                {currentDesktop?.name}
                            </div>
                            <div className="gap-1 z-2 bg-black/30 opacity-0 group-hover:bg-black/20 backdrop-blur-md p-1 px-3 rounded-full
                                    flex flex-row text-lg white w-42 text-center justify-center group-hover:scale-105 transition-all group-hover:opacity-100 group-hover:ml-0 absolute">
                                Clique para editar
                            </div>
                        </div>


                        <div className="absolute w-full h-full left-0 top-0 z-[0] bg-(--color-light) transition-all duration-500 group-hover:brightness-60">
                            <div className="w-[95%] group-hover:w-[98%] transition-all duration-400 h-full absolute "
                                style={{ backgroundImage: `url(${currentDesktop?.backgroundImage})`, backgroundPosition: 'center center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                            </div>
                            <div className="w-[95%] group-hover:w-[98%] transition-all duration-400 h-full z-10 bg-linear-to-r from-transparent to-(--color-light) absolute">

                            </div>
                        </div>

                    </div>

                    {allDesktops.length >= 1 &&
                        allDesktops.map((desktop) => (
                            <div onClick={() => handleChangeDesktop(desktop.id)} className="group flex flex-row w-full p-4 justify-between bg-(--color-light) min-h-17 items-center rounded-sm 
                    transition-all overflow-hidden cursor-pointer relative gap-2 hover:min-h-25">
                                <div className="flex flex-row gap-4 relative">
                                    <div className="gap-1 z-2 bg-black/30 group-hover:bg-black/20 backdrop-blur-md p-1 px-3 rounded-full flex flex-row text-lg white 
                                    group-hover:opacity-0 transition-all">
                                        {desktop?.name}
                                    </div>
                                    <div className="gap-1 z-2 bg-black/30 opacity-0 group-hover:bg-black/20 backdrop-blur-md p-1 px-3 rounded-full
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
                                bg-black/40 hover:bg-white hover:text-black backdrop-blur-md p-2 px-4 rounded-full text-[18px]">Editar</p>

                                <div
                                    key={desktop.id}
                                    className="absolute w-full h-full left-0 top-0 z-[0] transition-all duration-500 group-hover:brightness-60"
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


                            // <div key={desktop.id} onClick={() => handleChangeDesktop(desktop.id)} className="group flex flex-row w-[98%] p-3 items-center bg-(--color-darker) border-2 border-transparent 
                            // cursor-pointer hover:bg-(--color-regular)/40 hover:scale-102 hover:border-(--color-light) relative overflow-hidden min-h-15
                            // rounded-sm transition-all justifFy-start gap-4">
                            //     <h1 className="text-lg group-hover:scale-105 transition-all h-7.5">
                            //         {desktop.name}
                            //     </h1>

                            //     <p className="transition-all opacity-0 ml-[-10px] group-hover:opacity-100 group-hover:ml-0 text-(--color-lighter)">Clique para abrir</p>
                            //     <div className="flex flex-row gap-2 items-center">


                            //         {/* VERSÃO LANÇAMENTO */}

                            //         {/* <p className="transition-all opacity-0 group-hover:opacity-100 mr-[-5px] group-hover:mr-1">
                            //             {desktop.members.length} {desktop.members.length > 1 ? t("listdt.members") : t("listdt.member")}
                            //         </p> */}


                            //         <div onClick={async (e) => {
                            //             e.stopPropagation();
                            //             minimazeAllWindows();
                            //             dtConfig.openWindow();

                            //             dtConfig.changeDesktop(desktop);
                            //         }}
                            //             className="absolute right-0 h-full cursor-pointer transition-all opacity-0 group-hover:opacity-100 group-hover:w-28
                            //         hover:border-(--color-lighter)  w-0 p-2 hover:bg-white hover:text-(--color-dark)
                            //         bg-(--color-light) flex flex-row items-center gap-2 justify-center">
                            //             <Menu size={28} />
                            //             <p className="text-[18px]">Editar</p>
                            //         </div>

                            //     </div>
                            // </div>
                        ))
                    }

                    <div className={`opacity-75 text-md w-full mt-2`}>Convites</div>

                    {desktopInvites.length >= 1 ?
                        desktopInvites.map((invite) => (
                            <div key={invite.id} onClick={() => handleChangeDesktop(invite.id)} className="group flex flex-row w-full p-3 px-5 items-center bg-(--color-darker)/70 border-2 border-transparent 
                            cursor-pointer hover:bg-green-950/50 hover:border-green-500 relative overflow-hidden min-h-17 group-hover:bg-red-600
                            rounded-sm transition-all justify-start gap-4">
                                <h1 className="text-lg mt-[-4px] group-hover:scale-105 origin-center transition-all">
                                    {invite.name}
                                </h1>

                                <p className="transition-all opacity-0 ml-[-10px] group-hover:opacity-100 group-hover:ml-0 text-green-500">Clique para aceitar</p>
                                <div className="flex flex-row gap-2 items-center">


                                    {/* VERSÃO LANÇAMENTO */}

                                    {/* <p className="transition-all opacity-0 group-hover:opacity-100 mr-[-5px] group-hover:mr-1">
                                        {invite.members.length} {invite.members.length > 1 ? t("listdt.members") : t("listdt.member")}
                                    </p> */}


                                    <div onClick={async (e) => {
                                        e.stopPropagation();
                                        minimazeAllWindows();
                                        dtConfig.openWindow();
                                        dtConfig.changeDesktop(invite);
                                    }}
                                        className="group absolute right-0 h-full cursor-pointer transition-all opacity-0 group-hover:opacity-100 group-hover:w-30
                                    hover:border-(--color-lighter) w-0 p-2 hover:bg-red-500 hover:text-white
                                    bg-zinc-950 text-red-500 flex flex-row items-center gap-2 justify-center">
                                        <X size={28} />
                                        <p className="text-[18px]">Recusar</p>
                                    </div>

                                </div>
                            </div>
                        )) :
                        <div className="p-2 w-full flex flex-col items-center gap-2">
                            <Bot size={50} />
                            <h1 className="text-center text-lg">Você não tem convites pendentes</h1>
                        </div>
                    }

                    <button onClick={() => {
                        minimazeAllWindows();
                        newdt.openWindow();
                        dtConfig.changeDesktop(null)
                    }} className={`sticky max-w-55 mt-5 bottom-0 left-[50%] bg-rose-500 translate-x-[-50%] transition-all cursor-pointer 
            hover:bg-white hover:text-(--color-regular) p-2 px-5 rounded-sm font-medium text-[18px]`}>{t("listdt.create")}</button>
                </div>
            </div>
        </div>
    )
}