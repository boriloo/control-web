import { ArrowRight, ChevronLeft, ChevronRight, Copy, Maximize, Menu, Plus, UserRound, UserX, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "../../context/AuthContext";
import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects, UserData } from "../../types/auth";
import { ClickableImageInput } from "../imageInput";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useAppContext } from "../../context/AppContext";
import { DesktopData, DesktopType } from "../../types/desktop";
import { deleteDesktopService, getDesktopByIdService, getDesktopByMembershipService, getDesktopByOwnerService, getMembersByDesktopIdService, leaveDesktopService, updateDesktopService } from "../../services/desktopServices";
import { useFileContext } from "../../context/FileContext";
import { getUserByIdService } from "../../services/userServices";
import { uploadStorageService } from "../../services/storageServices";
import { UploadStorageData } from "../../types/storage";

type colors = 'red' | 'blue' | 'black' | 'purple' | 'green' | 'orange'

export default function DesktopConfigWindow() {
    const { changeRootFiles, allFiles } = useFileContext();
    const { callToast, setBlackScreen, minimazeAllWindows } = useAppContext();
    const { user, currentDesktop, changeCurrentDesktop, setHasDesktops } = useUser();
    const { dtConfig, sendInvite } = useWindowContext();

    const [loading, setLoading] = useState<boolean>(false)
    const [memberLoading, setMemberLoading] = useState<boolean>()

    const [isFullsceen, setIsFullscreen] = useState<boolean>(false)
    const [confirmDelete, setConfirmDelete] = useState<boolean>(false)

    const [formattedUserName, setFormattedUserName] = useState<string | null>(null)
    const [formattedDtName, setFormattedDtName] = useState<string | null>(null)

    const [deleteInput, setDeleteInput] = useState<string>('')

    const [bgVersion, setBgVersion] = useState(0)

    const [desktopMembers, setDesktopMembers] = useState<any[]>([])

    // INFORMAÇÕES DO DESKTOP (PARA UPDATE)
    const [windowDesktop, setWindowDesktop] = useState<DesktopData | null>(null)
    const [desktopName, setDesktopName] = useState('')
    const [typaBackgroundCount, setTypaBackgroundCount] = useState<number>(1)
    const [currentImage, setCurrentImage] = useState<File | null>(null)
    const [backgroundUrl, setBackgroundUrl] = useState<string>('')
    const [colorSelected, setColorSelected] = useState<colors>('red')
    const [typaDesktop, setTypaDesktop] = useState<DesktopType>('personal')


    const mouseDownTarget = useRef<EventTarget | null>(null);

    const nextBg = useCallback(() => {
        if (typaBackgroundCount != 3) {
            setTypaBackgroundCount(prev => prev as number + 1)
        } else {
            setTypaBackgroundCount(1)
        }
    }, [typaBackgroundCount])

    const previousBg = useCallback(() => {
        if (typaBackgroundCount != 1) {
            setTypaBackgroundCount(prev => prev as number - 1)
        } else {
            setTypaBackgroundCount(3)
        }
    }, [typaBackgroundCount])

    const bgText = useCallback(() => {
        switch (typaBackgroundCount) {
            case 1:
                return 'Upload'
            case 2:
                return 'URL'
            case 3:
                return 'Cor Fixa'
        }
    }, [typaBackgroundCount])

    const [copy, setCopy] = useState<boolean>(false);

    const timeoutRef = useRef(null);

    const copyDeleteText = async () => {
        try {
            await navigator.clipboard.writeText(`${formattedUserName}/${formattedDtName}`);
            setCopy(true);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                setCopy(false);
            }, 3000);

            console.log('Text copied to clipboard');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }


    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        mouseDownTarget.current = e.target;
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
        if (
            e.target === e.currentTarget &&
            mouseDownTarget.current === e.currentTarget
        ) {
            dtConfig.closeWindow();
        }
        mouseDownTarget.current = null;
    };

    const fetchDesktopMembers = async () => {
        if (!dtConfig.desktop) return;
        try {
            setMemberLoading(true)
            const members = await getMembersByDesktopIdService(dtConfig.desktop.id);
            setDesktopMembers(members);
        } catch (err) {
            console.log(err)
        } finally {
            setMemberLoading(false)
        }

    };

    useEffect(() => {
        if (!dtConfig.desktop) {
            setWindowDesktop(null);
            return;
        }

        setWindowDesktop(dtConfig.desktop)

        setFormattedUserName((user?.name as string).replace(/ /g, ''))
        setFormattedDtName((dtConfig.desktop.name).replace(/ /g, ''))
        setDesktopName(dtConfig.desktop.name)
        setTypaBackgroundCount(1)
        setTypaDesktop(dtConfig.desktop.desktopType)

        if (dtConfig.desktop.backgroundImage.startsWith('assets/colors')) {
            const match = dtConfig.desktop.backgroundImage.match(/(?<=_)[^.]+(?=\.)/);
            if (match) {
                setColorSelected(match[0] as colors)
            }

        }

        fetchDesktopMembers()

    }, [dtConfig.desktop])

    if (!user) return null;



    const handleChangeDesktop = async (id: string) => {
        setLoading(true)
        try {
            changeRootFiles([])

            const response = await getDesktopByIdService(id)

            changeCurrentDesktop(response)

            localStorage.setItem('last-desktop', response.id);

        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 1000)
        }
    }


    const deleteDesktopFunction = async () => {
        if (!windowDesktop) return;

        setLoading(true);

        try {
            if (currentDesktop?.id === dtConfig.desktop?.id) {
                const desktops = await getDesktopByMembershipService();
                const otherDesktops = desktops.filter((d: any) => d.id !== dtConfig.desktop?.id);

                if (otherDesktops.length === 0) {
                    setBlackScreen(true);
                    setTimeout(() => {
                        setHasDesktops(false);
                    }, 1000);
                } else {
                    changeCurrentDesktop(otherDesktops[0]);
                }
            }

            await deleteDesktopService(windowDesktop.id);

            setDeleteInput('');
            setConfirmDelete(false);
            dtConfig.closeWindow();
            dtConfig.changeDesktop(null);
        } catch (err) {
            console.error("Erro ao deletar desktop:", err);
            callToast({ message: 'Erro ao excluir desktop.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    const handleUpload = async (data: UploadStorageData) => {
        try {
            const { path } = await uploadStorageService(data)

            return path
        } catch (err) {
            return undefined;
        }

    }


    const handleEditDesktop = useCallback(async () => {

        setLoading(true)

        if (!windowDesktop) {
            setLoading(false)
            return;
        }

        try {

            const updateData: any = {}

            if (desktopName && desktopName != windowDesktop?.name) updateData.name = desktopName

            if (typaBackgroundCount === 1 && currentImage) {
                const path = await handleUpload({ file: currentImage, typeOfUpload: 'desktop', desktopId: windowDesktop?.id } as UploadStorageData)
                updateData.backgroundImage = path
            }


            if (typaBackgroundCount === 2) {
                if (backgroundUrl) updateData.backgroundImage = backgroundUrl
            }

            if (typaBackgroundCount === 3) {
                updateData.backgroundImage = `assets/colors/default_${colorSelected}.png`
            }


            if (typaDesktop && typaDesktop != windowDesktop?.desktopType) updateData.desktopType = typaDesktop


            const updatedDesktop = await updateDesktopService(windowDesktop.id, updateData)

            setCurrentImage(null)
            dtConfig.changeDesktop(updatedDesktop);

            if (updatedDesktop.id === currentDesktop?.id) {
                changeCurrentDesktop(updatedDesktop)
            }

            setTimeout(() => {
                setBgVersion(prev => prev + 1)
            }, 200)

            callToast({ message: 'Desktop atualizado!', type: 'success' })
        } catch (err) {
            callToast({ message: 'Erro ao alterar desktop!', type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [windowDesktop, desktopName, currentDesktop, backgroundUrl, typaBackgroundCount, typaDesktop, currentImage, colorSelected, dtConfig])


    const canUpdateDesktop = useCallback(() => {
        if (desktopName != windowDesktop?.name) return true;
        if (typaDesktop != windowDesktop?.desktopType) return true;

        if (typaBackgroundCount === 1) {
            if (currentImage) return true;
        }

        if (typaBackgroundCount === 2) {
            if (backgroundUrl != windowDesktop.backgroundImage && backgroundUrl) return true;
        }

        if (typaBackgroundCount === 3) return true;


        return false;
    }, [typaBackgroundCount, typaDesktop, backgroundUrl, desktopName, currentImage, windowDesktop])


    const roleText = (role: string) => {
        switch (role) {
            case 'member':
                return 'Membro'
            case 'owner':
                return 'Criador'
        }
    }

    const handleLeaveDesktop = useCallback(async () => {
        if (!dtConfig.desktop) return;

        try {
            setLoading(true)
            await leaveDesktopService(dtConfig.desktop.id)
            if (currentDesktop?.id === dtConfig.desktop?.id) {
                const desktops = await getDesktopByMembershipService();
                const otherDesktops = desktops.filter((d: any) => d.id !== dtConfig.desktop?.id);

                if (otherDesktops.length === 0) {
                    setBlackScreen(true);
                    setTimeout(() => {
                        setHasDesktops(false);
                    }, 1000);
                } else {
                    changeCurrentDesktop(otherDesktops[0]);
                }
            }
            dtConfig.closeWindow()
            dtConfig.changeDesktop(null)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }, [dtConfig.desktop?.id])



    return (
        <div onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            className={`${isFullsceen ? 'pb-[40px]' : ' p-2 pb-[50px]'} ${dtConfig.currentStatus === "open" ? returnFilterEffects() : 'pointer-events-none'} 
        fixed z-100 flex-1 flex justify-center items-center w-full h-screen transition-all duration-500 cursor-pointer`}>

            <div className={`${confirmDelete && dtConfig.currentStatus === 'open' ? '' : 'pointer-events-none opacity-0'} transition-all cursor-default fixed top-0 bg-black/70 w-full h-full z-100 flex flex-col gap-5
            justify-center items-center p-2 pb-11`}>

                <div className={`${!copy ? '' : 'mt-[-65px]'} bg-white transition-all rounded-full p-2 text-black px-4 z-20`}>Texto copiado!</div>

                <div className={`${!copy ? 'mt-[-70px]' : 'mt-[-5px]'} transition-all bg-zinc-950 p-3 w-full max-w-[510px] h-full max-h-[370px] rounded-lg border-1 border-zinc-800 overflow-y-auto flex flex-col gap-1 z-30`}>
                    <p className="text-lg">Atenção! Você está prestes a excluir um desktop </p>
                    <p className="text-xl text-red-500">{windowDesktop?.name}</p>
                    <p className="text-lg mt-4">
                        Esta ação removerá o desktop e <b className="font-medium text-red-500">excluirá permanentemente </b>
                        todos os arquivos presentes nele.
                    </p>
                    <div className="text-lg mt-4 flex flex-row gap-2 flex-wrap items-center">Digite
                        <div onClick={copyDeleteText} className="text-md p-0.5 px-2 select-none bg-white/12 rounded-md flex flex-row gap-2 items-center hover:bg-white/30 cursor-pointer transition-all">
                            {formattedUserName}/{formattedDtName}<Copy size={20} />
                        </div>
                        para seguir com a exclusão.</div>

                    <input onChange={(e) => setDeleteInput(e.target.value)} value={deleteInput} autoCorrect="false" spellCheck={false} autoCapitalize="false" type="text"
                        className="border-1 border-zinc-600 outline-none bg-zinc-900 p-1 px-2 rounded-lg w-full 
                    transition-all hover:bg-zinc-800 focus:bg-zinc-950 focus:border-zinc-400 mt-2" placeholder="Digite aqui" />

                    <div className="flex flex-row gap-2 mt-4">
                        {loading ? (
                            <div className="flex-1 flex justify-center py-2">
                                <DotLottieReact
                                    src="assets/images/loader.lottie"
                                    className="w-14"
                                    loop
                                    autoplay
                                />
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => { setConfirmDelete(false); setDeleteInput('') }}
                                    className="flex-1 p-1 px-5 text-lg text-zinc-300 border-1 border-zinc-300 cursor-pointer transition-all hover:bg-zinc-300/10 hover:text-white rounded-md"
                                >
                                    Voltar
                                </button>
                                <button
                                    disabled={`${formattedUserName}/${formattedDtName}` !== deleteInput}
                                    onClick={deleteDesktopFunction}
                                    className={`${`${formattedUserName}/${formattedDtName}` === deleteInput ? '' : 'pointer-events-none saturate-0 opacity-70'} flex-1 p-1 px-5 text-lg text-red-500 border-1 border-red-500 cursor-pointer transition-all hover:bg-red-500 hover:text-white rounded-md`}
                                >
                                    Excluir Desktop
                                </button>
                            </>
                        )}
                    </div>
                    <p className="self-center text-md text-white/60">*Esta ação é irreversível.</p>
                </div>
            </div>

            <div className={`${isFullsceen ? 'max-w-full max-h-full' : 'rounded-lg max-w-[1200px] max-h-[700px]'} ${dtConfig.currentStatus === "open" ? 'scale-100' : 'scale-50 opacity-0'} 
                bg-(--color-dark) border-1 border-(--color-whity)/10 cursor-default origin-center relative transition-all duration-250 flex flex-col w-full h-full overflow-y-auto`}>


                <div className={`${dtConfig.desktop?.ownerId === user.id ? 'bottom-[-450px] bg-(--color-light)/40' : 'bottom-[0px] z-20 bg-(--color-light)/30'} blur-[190px] w-120 h-120 right-0 rounded-tl-full fixed`}></div>

                <div className="z-50 sticky mb-[-35px] select-none top-0 right-0 flex flex-row justify-end items-center">
                    <div className="flex flex-row h-full backdrop-blur-md bg-black/40 rounded-bl-md">
                        <Maximize onClick={() => setIsFullscreen(!isFullsceen)} className="transition-colors rounded-bl-md cursor-pointer p-[9px] w-10 h-full hover:bg-white/20" />
                        <X onClick={dtConfig.closeWindow} className="transition-colors cursor-pointer p-2 w-10 h-full  hover:bg-red-500" />
                    </div>
                </div>

                <div key={bgVersion} className={`${loading ? 'opacity-0' : ''} absolute w-full top-0 transition-all h-[450px] z-1 bg-cover`}
                    style={{ backgroundImage: `url(${windowDesktop?.backgroundImage})`, backgroundPosition: 'center 30%' }} />
                <div className="absolute w-full h-[450px] z-2 bg-gradient-to-b from-zinc-(--color-dark)/30 from-0% to-(--color-dark) to-78%" />
                <div className="absolute w-full top-0 h-[450px] z-0 flex justify-center items-center">
                    <DotLottieReact
                        src="assets/images/loader.lottie"
                        className="w-20 p-0"
                        loop
                        autoplay
                    />
                </div>

                {currentDesktop?.id === windowDesktop?.id ? (
                    <p className="z-10 m-5 mb-[-55px] p-1 px-3 self-start border-1 border-(--color-light) bg-(--color-light)/30 backdrop-blur-sm rounded-full">Desktop atual</p>
                ) : (
                    <p onClick={() => handleChangeDesktop(windowDesktop?.id as string)} className="z-60 m-5 mb-[-55px] p-1 px-3 self-start border-1 
                    border-white/80 bg-zinc-200/5 hover:border-(--color-light) hover:bg-(--color-darker)/90 transition-all
                    hover:text-(--color-lighter) backdrop-blur-sm rounded-full flex flex-row gap-1 items-center group cursor-pointer">Abrir Desktop  <ArrowRight size={20} className="opacity-0 
                    max-w-0 transition-all group-hover:opacity-100 group-hover:max-w-5"/></p>
                )}

                <div className="flex flex-col gap-2 p-4 mt-[80px] z-3">
                    <div className="flex flex-row justify-between gap-2 p-4 items-center flex-wrap">
                        <div className="flex flex-col gap-1 items-start">
                            <p className="text-[15px] opacity-80">Criado em {new Date(windowDesktop?.createdAt as Date)?.toLocaleDateString('pt-BR')}</p>
                            <h1 className="text-[38px] mt-[-6px]">{windowDesktop?.name}</h1>
                            <p className="p-1 px-3 bg-zinc-950/50 border-1 border-zinc-600 rounded-full">Desktop {windowDesktop?.desktopType === 'personal' ? 'pessoal' : 'compartilhado'}</p>

                        </div>
                        <div className="p-2 px-3 flex flex-col bg-zinc-950/60 backdrop-blur-[2px] border-1 border-zinc-800 rounded-lg min-w-[300px]">
                            <p>Espaço Ocupado</p>
                            <h1 className="text-[30px]">{allFiles.length} items</h1>
                            {/* <div className="w-full bg-zinc-950 h-1 mt-2 rounded-md overflow-hidden">
                                <div className="bg-(--color-light) w-[34%] h-full"></div>
                            </div> */}
                        </div>
                    </div>

                    <div className="flex flex-row gap-6 p-2 mt-[60px] items-start">

                        {dtConfig.desktop?.ownerId === user.id && (
                            <div className="flex flex-col w-full items-start gap-4">
                                <h1 className="text-2xl">Informações</h1>
                                <div className="flex flex-col gap-1 w-full">
                                    <p className="text-lg">Nome do Desktop</p>
                                    <input value={desktopName} onChange={(e) => {
                                        setDesktopName(e.target.value)
                                    }} type="text" className="border-1 border-(--color-light)/50 outline-none transition-all text-lg bg-(--color-regular) hover:bg-(--color-light)/30 mt-1
                                cursor-pointer focus:cursor-text p-0.5 px-1.5 rounded-sm focus:border-(--color-light) focus:bg-(--color-lighter)/40 w-full max-w-[400px]" />
                                </div>


                                <div className="w-[100%] h-[1px] mt-1 bg-(--color-whity)/50"></div>

                                <h1 className="text-2xl">Plano de Fundo</h1>
                                <p className="text-md mt-[-12px] mb-1">Imagem exibida no fundo do Desktop atual.</p>



                                <div className="flex flex-row rounded-lg overflow-hidden w-full max-w-[300px] select-none">
                                    <div onClick={previousBg} className="text-white p-2 border-2 border-(--color-light) rounded-l-lg flex justify-center items-center hover:bg-(--color-lighter) transition-all cursor-pointer">
                                        <ChevronLeft strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 text-lg flex justify-center items-center bg-(--color-darker)">
                                        {bgText()}
                                    </div>
                                    <div onClick={nextBg} className="text-white p-2 border-2 border-(--color-light) rounded-r-lg flex justify-center items-center hover:bg-(--color-lighter) transition-all cursor-pointer">
                                        <ChevronRight strokeWidth={2.5} />
                                    </div>
                                </div>

                                {/* {currentImage && !loading && (<p className="mb-[-5px] p-1 px-2 bg-white/10 rounded-lg">Prévia do Fundo</p>)} */}

                                <div className={`${typaBackgroundCount === 1 ? 'h-43' : 'h-0 opacity-0'}  ${loading ? 'saturate-0 pointer-events-none opacity-50 scale-90' : ''} 
                            origin-left flex flex-col items-start transition-all w-full overflow-hidden`}>
                                    <ClickableImageInput onFileSelected={(file) => {
                                        setCurrentImage(file)
                                    }} />
                                </div>

                                <div className={`${typaBackgroundCount === 2 ? 'h-20' : 'h-0 opacity-0 mt-[-10px]'} ${loading ? 'saturate-0 pointer-events-none opacity-50 scale-90' : ''} 
                            origin-left flex flex-col items-start transition-all w-full overflow-hidden`}>
                                    <p className="text-md">URL do Desktop</p>
                                    <input value={backgroundUrl} onChange={(e) => {
                                        setBackgroundUrl(e.target.value)
                                    }} type="text" className="border-1 border-(--color-light)/50 outline-none transition-all text-lg bg-(--color-regular) hover:bg-(--color-light)/30 mt-1
                                cursor-pointer focus:cursor-text p-0.5 px-1.5 rounded-sm focus:border-(--color-light) focus:bg-(--color-lighter)/40 w-full max-w-[500px]" />
                                </div>

                                <div className={`${typaBackgroundCount === 3 ? 'h-14 mt-[-12px]' : 'h-0 opacity-0 mt-[-10px]'} flex flex-row gap-3 transition-all items-center justify-center overflow-hidden`}>
                                    <div onClick={() => setColorSelected('red')} className={`${colorSelected === 'red' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-red-500 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-red-400`}></div>
                                    <div onClick={() => setColorSelected('blue')} className={`${colorSelected === 'blue' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-blue-600 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-blue-500 `}></div>
                                    <div onClick={() => setColorSelected('black')} className={`${colorSelected === 'black' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-zinc-950 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-zinc-900`}></div>
                                    <div onClick={() => setColorSelected('purple')} className={`${colorSelected === 'purple' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-purple-500 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-purple-400`}></div>
                                    <div onClick={() => setColorSelected('green')} className={`${colorSelected === 'green' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-green-500 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-green-400`}></div>
                                    <div onClick={() => setColorSelected('orange')} className={`${colorSelected === 'orange' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-orange-500 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-orange-400`}></div>
                                </div>




                                <div className="w-[100%] h-[1px] mt-1 bg-(--color-whity)/50"></div>

                                <h1 className="text-2xl">Tipo de Desktop</h1>

                                <div className={`flex flex-row gap-3 w-full max-w-[800px] transition-all`}>
                                    <div onClick={() => setTypaDesktop('personal')} className={`${typaDesktop === 'personal' ? 'bg-rose-500' : 'bg-zinc-950 hover:bg-black'} p-2 flex-1 
                        rounded-md text-center cursor-pointer transition-all text-lg shadow-2xl hover:scale-105`}>
                                        Pessoal
                                    </div>
                                    <div onClick={() => setTypaDesktop('shared')} className={`${typaDesktop === 'shared' ? 'bg-rose-500' : 'bg-zinc-950 hover:bg-black'} p-2 flex-1 
                        rounded-md text-center cursor-pointer transition-all text-lg shadow-2xl hover:scale-105`}>
                                        Compartilhado
                                    </div>
                                </div>


                                <div className="w-[100%] h-[1px] mb-1 bg-(--color-whity)/50"></div>

                                {loading ? (
                                    <div className={`
                                p-0.5 px-3 rounded-sm font-medium`}>
                                        <DotLottieReact
                                            src="assets/images/loader.lottie"
                                            className="w-20 p-0"
                                            loop
                                            autoplay
                                        />
                                    </div>
                                ) : (
                                    <button
                                        disabled={!canUpdateDesktop()}
                                        onClick={handleEditDesktop}
                                        className={`${!canUpdateDesktop() ? 'pointer-events-none saturate-0 opacity-50' : ''} border-1 border-(--color-light) transition-all cursor-pointer 
                                    hover:bg-(--color-light) p-2 px-3 rounded-sm font-medium`}>Salvar Alterações</button>
                                )}

                                <div className="bg-zinc-950/50 p-4 gap-3 flex flex-col w-full max-w-[400px] rounded-lg items-start border-1 border-zinc-800">
                                    <h1 className="text-2xl">Zona de risco</h1>

                                    <button onClick={() => setConfirmDelete(true)} className="p-1 px-5 text-lg text-red-500 border-1 border-red-500 cursor-pointer transition-all
                                hover:bg-red-500 hover:text-white rounded-md">
                                        Excluir Desktop
                                    </button>
                                </div>


                            </div>

                        )}



                        {dtConfig.desktop?.ownerId != user.id && (
                            <>
                                {loading ?
                                    (
                                        <div className="flex-1 flex flex-col gap-2 items-start">
                                            <h1 className="text-2xl">Ações</h1>
                                            <div className="w-[100%] h-[1px] mt-1 bg-(--color-whity)/50"></div>
                                            <button className="bg-red-500 saturate-0 text-[18px] px-9.5 rounded-full mt-2
                                transition-all opacity-65">
                                                <DotLottieReact
                                                    src="assets/images/loader.lottie"
                                                    className="w-20 p-0"
                                                    loop
                                                    autoplay
                                                />
                                            </button>
                                        </div>
                                    )
                                    :
                                    (
                                        <div className="flex-1 flex flex-col gap-2 items-start">
                                            <h1 className="text-2xl">Ações</h1>
                                            <div className="w-[100%] h-[1px] mt-1 bg-(--color-whity)/50"></div>
                                            <button onClick={handleLeaveDesktop} className="bg-red-500 text-[18px] p-2 px-4 rounded-full mt-2 cursor-pointer 
                                hover:bg-white hover:text-black transition-all">
                                                Sair do Desktop
                                            </button>
                                        </div>
                                    )}
                            </>

                        )}

                        <div className="flex flex-col w-full max-w-[600px] p-4 rounded-xl gap-3 bg-zinc-950/70">
                            <div className="flex flex-row justify-between gap-2 items-center">
                                <p className="text-xl">{memberLoading ? '' : desktopMembers.length} Membros</p>
                                {dtConfig.desktop?.ownerId === user.id && (
                                    <Plus size={35} onClick={() => {
                                        minimazeAllWindows();
                                        sendInvite.setDesktop({
                                            id: dtConfig.desktop?.id as string,
                                            name: dtConfig.desktop?.name as string
                                        })
                                        sendInvite.openWindow();
                                    }} className="p-1 rounded-full hover:bg-zinc-800 cursor-pointer transition-all" />
                                )}
                            </div>

                            <div className="w-[100%] h-[1px] bg-zinc-400/40" />

                            <div className="flex flex-col w-full gap-3 mt-3 max-h-[570px] overflow-y-auto">

                                {memberLoading ?
                                    (<div className="flex flex-col items-center p-2">
                                        <DotLottieReact
                                            src="assets/images/loader.lottie"
                                            className="w-25 p-0"
                                            loop
                                            autoplay
                                        />
                                        <p>Carregando membros...</p>
                                    </div>)
                                    :
                                    desktopMembers.map((member) =>
                                        <div key={member.user.id} className="flex flex-row w-full justify-between items-center bg-(--color-regular)/80
                                    p-3.5 px-4 rounded-md group hover:bg-(--color-regular) border-2 border-(--color-light)/15 transition-all select-none shadow-md">
                                            <div className="flex flex-row gap-3 items-center">
                                                <img src={`${member.user.profileImage ?? 'assets/images/profile.png'}`} className={`
                                                ${member.user.id === windowDesktop?.ownerId ? 'shadow-[0px_0px_10px_1px_var(--color-light)] border-(--color-lighter)' : 'border-transparent'} 
                                                rounded-full w-12 h-12 border-2`} />
                                                <div className="flex flex-col">
                                                    <p className="text-lg flex gap-1 items-end">{member.user.name} {member.user.id === user.id && (
                                                        <span className="text-[15px] opacity-60 mb-0.5">(você)</span>)}
                                                    </p>
                                                    <p className="text-[14px] opacity-75">{member.id === dtConfig.desktop?.ownerId ? 'Criador' : roleText(member.role)}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-3">

                                                <UserX className="cursor-pointer transition-all opacity-0 scale-75 group-hover:scale-100 group-hover:opacity-100 hover:bg-red-600/20
                                        hover:border-red-500 hover:text-red-500 w-9 h-9 p-1 bg-white/5 border border-white/40 rounded-md" />
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                    </div>



                </div>
            </div>
        </div>
    )
}