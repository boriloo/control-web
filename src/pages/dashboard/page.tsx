import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, CirclePlus, GripVertical, RotateCw } from "lucide-react";
import { DraggableIcon } from "../../components/draggableIcon";
import { useDraggableScroll } from "../../components/dragScroll";
import ProfileWindow from "../../components/windows/profile";
import NewFileWindow from "../../components/windows/newFile";
import FileWindow from "../../components/windows/fileViewer";
import { useUser } from "../../context/AuthContext";
import TaskBar from "../../components/taskbar";
import { useWindowContext } from "../../context/WindowContext";
import { useRootContext } from "../../context/RootContext";
import ConfigWindow from "../../components/windows/config";
import PersonalDesktopWindow from "../../components/windows/personalDesktop";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import SearchBar from "../../components/SearchBar";
import ListDesktopsWindow from "../../components/windows/listDesktops";
import NewDesktopWindow from "../../components/windows/newDesktop";
import { useTranslation } from "react-i18next";
import OpenLinkWindow from "../../components/windows/openLink";
import DesktopConfigWindow from "../../components/windows/desktopConfig";
import ImageViewerWindow from "../../components/windows/imageViewer";
import SocialWindow from "../../components/windows/social";
import { FileData } from "../../types/file";
import { getFilesFromDesktopService, updateFilePositionService } from "../../services/fileServices";
import { useAppContext } from "../../context/AppContext";
import { useFileContext } from "../../context/FileContext";
import ContextMenu from "../../components/contextMenu";
import DeleteFileWindow from "../../components/windows/deleteFile";
import SendInviteWindow from "../../components/windows/sendInvite";
import GiftWindow from "../../components/windows/gift";


export default function DashboardPage() {
    const { rootFiles, changeRootFiles, allFiles, defaultFile, reloadAllFiles, canReload } = useFileContext();
    const { changeNextIconPosition, blackScreen } = useAppContext();
    const { t } = useTranslation();
    const { isMobile } = useRootContext();
    const { user, hasDesktops, setHasDesktops, currentDesktop, bgColors } = useUser();
    const { newFile, listdt, openLink, contextMenu, dtConfig, deleteFile } = useWindowContext();
    const [start, setStart] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(0)
    const [saving, setSaving] = useState<boolean>(false)
    const filesMap = useRef<Map<string, { id: string; xPos: number; yPos: number }>>(new Map());
    const [isDraggin, setIsDraggin] = useState<boolean>(false);
    const [isMoving, setIsMoving] = useState<boolean>(false);
    const [lastDraggedId, setLastDraggedId] = useState<string>('');
    const [maxFileStorage, setMaxFileStorage] = useState<number>(500)
    const originalFilesRef = useRef<FileData[]>([]);
    const [reloadText, setReloadText] = useState<boolean>(false)

    useEffect(() => {
        document.documentElement.style.setProperty('--color-darker', bgColors.darker);
        document.documentElement.style.setProperty('--color-dark', bgColors.dark);
        document.documentElement.style.setProperty('--color-regular', bgColors.regular);
        document.documentElement.style.setProperty('--color-light', bgColors.light);
        document.documentElement.style.setProperty('--color-lighter', bgColors.lighter);
        document.documentElement.style.setProperty('--color-whity', bgColors.whity);
    }, [bgColors]);

    useEffect(() => {
        if (isDraggin || filesMap.current.size === 0) {
            setTimer(20);
            return;
        }


        if (timer === 0) {
            const saveChanges = async () => {

                const movedFiles = Array.from(filesMap.current.values());

                const hasChanged = Array.from(filesMap.current.values()).some(movedFile => {
                    const original = originalFilesRef.current.find(f => f.id === movedFile.id);
                    return original && (original.xPos !== movedFile.xPos || original.yPos !== movedFile.yPos);
                });

                if (!hasChanged) {
                    filesMap.current.clear();
                    return;
                }

                try {
                    await updateFilePositionService(movedFiles);
                    originalFilesRef.current = rootFiles;
                    filesMap.current.clear();
                } catch (err) {
                    console.error("Erro ao salvar", err);
                } finally {
                    setSaving(true);
                    setTimeout(() => setSaving(false), 2000);
                }
            };

            saveChanges();
            return;
        }

        const interval = setInterval(() => {
            setTimer(prev => Math.max(prev - 1, 0));
            console.log(timer)
        }, 1000);

        return () => clearInterval(interval);
    }, [timer, isDraggin]);


    const findNextAvailablePosition = (icons: FileData[], containerWidth: number): { x: number; y: number } | null => {
        const GRID_SIZE = 100;
        const occupiedPositions = new Set(
            icons.map(icon => `${icon.xPos},${icon.yPos}`)
        );

        for (let y = 0; y > -1; y += GRID_SIZE) {
            for (let x = 0; x < containerWidth - 80; x += GRID_SIZE) {
                const currentPosition = `${x},${y}`;
                if (!occupiedPositions.has(currentPosition)) {
                    return { x, y };
                }
            }
        }
        return null;
    };


    useEffect(() => {
        if (!hasDesktops) return;
        setTimeout(() => { setStart(true) }, 300);
    }, [hasDesktops]);


    useEffect(() => {
        const containerWidth = desktopRef.current?.clientWidth || window.innerWidth;

        const nextPosition = findNextAvailablePosition(rootFiles, containerWidth);

        if (nextPosition) {
            changeNextIconPosition(nextPosition);
        };

        setTimer(20)

    }, [rootFiles]);

    useEffect(() => {
        if (!user || !currentDesktop?.id) return;

        const getAllFiles = async () => {
            try {
                const files = await getFilesFromDesktopService(currentDesktop.id)
                const defaultFiles = files.map((file: any) => {
                    return defaultFile(file)
                })
                changeRootFiles(defaultFiles)
                originalFilesRef.current = defaultFiles;

            } catch (err) {
                console.log(err)
            }
        }

        getAllFiles()

    }, [currentDesktop, user]);

    const desktopRef = useRef<HTMLDivElement>(null);
    const [contentToRight, setContentToRight] = useState<boolean>(false)
    const [contentToBottom, setContentToBottom] = useState<boolean>(false)
    const [contentToLeft, setContentToLeft] = useState<boolean>(false)
    const [contentToTop, setContentToTop] = useState<boolean>(false)

    const checkOverflow = useCallback(() => {
        const desktopEl = desktopRef.current;
        if (!desktopEl) return;
        const hasContentToLeft = desktopEl.scrollLeft > 0;
        const hasContentToTop = desktopEl.scrollTop > 0;

        const isAtHorizontalEnd = Math.abs(desktopEl.scrollWidth - desktopEl.clientWidth - desktopEl.scrollLeft) < 1;
        const isAtVerticalEnd = Math.abs(desktopEl.scrollHeight - desktopEl.clientHeight - desktopEl.scrollTop) < 1;
        const hasHorizontalOverflow = desktopEl.scrollWidth > desktopEl.clientWidth;
        const hasVerticalOverflow = desktopEl.scrollHeight > desktopEl.clientHeight;

        setContentToLeft(hasContentToLeft);
        setContentToTop(hasContentToTop);
        setContentToRight(hasHorizontalOverflow && !isAtHorizontalEnd);
        setContentToBottom(hasVerticalOverflow && !isAtVerticalEnd);
    }, []);


    useDraggableScroll(desktopRef);

    useEffect(() => {
        const desktopEl = desktopRef.current;
        if (!desktopEl) return;

        desktopEl.addEventListener('scroll', checkOverflow);
        window.addEventListener('resize', checkOverflow);
        checkOverflow();

        return () => {
            desktopEl.removeEventListener('scroll', checkOverflow);
            window.removeEventListener('resize', checkOverflow);
        };
    }, [rootFiles, checkOverflow]);

    const handleContextClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!currentDesktop) return;

        if (e.button != 2) {
            contextMenu.setIsVisible(false)
            contextMenu.setSelectedIconId('')
            return;
        };

        contextMenu.setPosition({
            x: e.clientX, y: e.clientY
        })
        contextMenu.setIsVisible(true)

        const elementIsIcon = (e.target as HTMLElement).closest('[data-id]') as HTMLElement;

        if (elementIsIcon) {
            const icon = allFiles.filter((icon) => icon.id === elementIsIcon.dataset.id)[0]

            contextMenu.setSelectedIconId(elementIsIcon.dataset.id as string)
            contextMenu.setFunctions([
                {
                    label: 'Excluir Arquivo',
                    action: () => {
                        deleteFile.setFile(icon)
                        deleteFile.openWindow()
                        contextMenu.setIsVisible(false)
                    }
                },
            ])
        } else {
            contextMenu.setSelectedIconId('')

            const desktopOptions = [];

            if (allFiles.length < maxFileStorage) {
                desktopOptions.push({
                    label: 'Criar Arquivo',
                    action: () => {
                        newFile.setFile(null)
                        newFile.openWindow()
                        contextMenu.setIsVisible(false)
                    }
                });
            }

            desktopOptions.push({
                label: 'Editar Desktop',
                action: () => {
                    dtConfig.changeDesktop(currentDesktop)
                    dtConfig.openWindow()
                    contextMenu.setIsVisible(false)
                }
            });

            if (canReload) {
                desktopOptions.push({
                    label: 'Recarregar Arquivos',
                    action: () => {
                        reloadAllFiles(currentDesktop.id)
                        contextMenu.setIsVisible(false)
                    }
                });
            }

            contextMenu.setFunctions(desktopOptions);
        };

    }, [currentDesktop, deleteFile, allFiles, canReload, reloadAllFiles]) // Dependências atualizadas



    const activeElementRef = useRef<HTMLElement | null>(null);
    const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const desktopRect = useRef<DOMRect | null>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {

        if (e.button === 2) {
            handleContextClick(e);
            return;
        }

        contextMenu.setSelectedIconId('')

        const element = (e.target as HTMLElement).closest('[data-id]') as HTMLElement;
        if (!element || !desktopRef.current) {
            contextMenu.setIsVisible(false);
            return;
        }

        desktopRect.current = desktopRef.current.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        activeElementRef.current = element;
        setLastDraggedId(element.dataset.id || '');
        setIsDraggin(true);
        contextMenu.setIsVisible(false);
    }, [handleContextClick, contextMenu]);


    const moverMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!activeElementRef.current || !isDraggin || !desktopRect.current || !desktopRef.current) return;
        setIsMoving(true)

        const x = e.clientX - desktopRect.current.left + desktopRef.current.scrollLeft - dragOffset.current.x;
        const y = e.clientY - desktopRect.current.top + desktopRef.current.scrollTop - dragOffset.current.y;


        activeElementRef.current.style.left = `${x}px`;
        activeElementRef.current.style.top = `${y}px`;
    }, [isDraggin]);

    const soltarMouse = useCallback(() => {
        if (!isDraggin || !activeElementRef.current) return;

        const draggedIconId = lastDraggedId;
        const GRID_SIZE = 100;

        const rawX = parseInt(activeElementRef.current.style.left);
        const rawY = parseInt(activeElementRef.current.style.top);

        let currentX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        let currentY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;

        if (currentX < 0) currentX = 0
        if (currentY < 0) currentY = 0

        activeElementRef.current.style.left = `${currentX + 10}px`;
        activeElementRef.current.style.top = `${currentY + 10}px`;

        const draggedIconOriginal = rootFiles.find(i => i.id === draggedIconId);
        if (!draggedIconOriginal) return;

        const existingIcon = rootFiles.find(icon =>
            icon.id !== draggedIconId &&
            currentX === icon.xPos &&
            currentY === icon.yPos
        );

        if (existingIcon) {
            filesMap.current.set(draggedIconId, { id: draggedIconId, xPos: existingIcon.xPos, yPos: existingIcon.yPos });
            filesMap.current.set(existingIcon.id, { id: existingIcon.id, xPos: draggedIconOriginal.xPos, yPos: draggedIconOriginal.yPos });

            changeRootFiles(rootFiles.map(icon => {
                if (icon.id === draggedIconId) return { ...icon, xPos: existingIcon.xPos, yPos: existingIcon.yPos };
                if (icon.id === existingIcon.id) return { ...icon, xPos: draggedIconOriginal.xPos, yPos: draggedIconOriginal.yPos };
                return icon;
            }));
        } else {
            filesMap.current.set(draggedIconId, { id: draggedIconId, xPos: currentX, yPos: currentY });

            changeRootFiles(rootFiles.map(icon =>
                icon.id === draggedIconId ? { ...icon, xPos: currentX, yPos: currentY } : icon
            ));
        }

        setIsDraggin(false);
        setIsMoving(false);
        setLastDraggedId('');
        activeElementRef.current = null;
    }, [isDraggin, lastDraggedId, rootFiles, changeRootFiles]);

    useEffect(() => {
        const disableRightClick = (e: MouseEvent) => e.preventDefault();
        document.addEventListener('contextmenu', disableRightClick);

        return () => document.removeEventListener('contextmenu', disableRightClick);
    }, []);




    return (
        <>
            <div className={`${blackScreen ? '' : 'opacity-0 pointer-none select-none'} transition-opacity duration-600 pointer-events-none z-201 absolute bg-black w-full h-screen`} />

            <div className="pointer-events-none fixed z-[-3] flex justify-center flex-col gap-2 items-center w-full min-h-screen">
                <DotLottieReact
                    src="assets/images/loader.lottie"
                    className="w-30 p-0 opacity-60"
                    loop
                    autoplay
                />
                <p className={`${start ? 'opacity-60' : 'opacity-0'} text-center transition-all text-lg`}>Se seu plano de fundo não estiver carregando, <br /> pode ser um erro no link escolhido.</p>
            </div>
            <div className={`${start ? 'opacity-0' : 'opacity-100'} bg-black transtion-all duration-500 pointer-events-none fixed z-50 flex justify-center items-center w-full min-h-screen`}>
                <p className={`control-text text-[50px]`}>Control</p>
            </div>
            {/* {hasDesktops && (<div className={`${start ? 'opacity-100 ' : 'blur-3xl opacity-0'} transition-[opacity,filter] duration-1500 scale-101 flex min-h-screen w-full fixed 
                bg-cover bg-center z-[-2]`}
                style={{ backgroundImage: `url(${localStorage.getItem('background')})` }}></div>)} */}
            {hasDesktops && (<div className={`${start ? 'opacity-100 ' : 'blur-xl opacity-0'} scale-101 flex min-h-screen w-full fixed 
                bg-cover bg-center z-[-1]`}
                style={{ backgroundImage: `url(${currentDesktop?.backgroundImage})`, transition: 'opacity 0.3s, filter 0.3s' }}
            ></div>)}
            {hasDesktops ? '' : (<PersonalDesktopWindow onFinish={(bool) => setHasDesktops(bool)} />)}

            <GiftWindow />
            <ConfigWindow />
            <NewFileWindow />
            <SendInviteWindow />
            <ProfileWindow />
            <FileWindow />
            <ListDesktopsWindow />
            <NewDesktopWindow />
            <DesktopConfigWindow />
            <ImageViewerWindow />
            <SocialWindow />
            <DeleteFileWindow />

            <OpenLinkWindow url={openLink.url as string} />
            <div className={`${start ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 flex flex-col w-full h-screen overflow-hidden text-white relative select-none`}>
                <ContextMenu />

                {isMobile ?
                    (<div className="flex flex-row flex-wrap justify-between items-center w-full gap-3 p-4">
                        <div className="flex flex-row gap-2">
                            {allFiles.length >= maxFileStorage ?
                                (<button className="p-1 px-3 bg-zinc-950/50 rounded-md opacity-75 backdrop-blur-md flex flex-row items-center justify-start">
                                    <p className="text-lg text-center">Máximo atingido</p>
                                </button>)
                                :
                                (<button onClick={() => {
                                    newFile.setFile(null)
                                    newFile.openWindow()
                                }}
                                    className="flex flex-row items-center justify-start gap-2 p-1 px-3 cursor-pointer rounded-md bg-black/40 backdrop-blur-md hover:bg-(--color-lighter) border-[1px] 
                    border-transparent hover:text-white hover:border-(--color-lighter) transition-all select-none hover:scale-102">
                                    <CirclePlus />
                                    <p className="text-lg">{t("dashboard.create")}</p>
                                </button>)
                            }
                            <button disabled={!canReload} onClick={() => {
                                if (!currentDesktop) return;
                                reloadAllFiles(currentDesktop.id)
                                contextMenu.setIsVisible(false)
                                setReloadText(true)
                                setTimeout(() => setReloadText(false), 2500)
                            }} className={`${!canReload ? 'opacity-55 scale-94' : 'hover:scale-102 hover:border-(--color-lighter) hover:text-white hover:bg-(--color-lighter) cursor-pointer'} flex flex-row 
                        items-center justify-start p-1 px-2  rounded-md bg-black/40  backdrop-blur-md  border-[1px] 
                    border-transparent   transition-all select-none gap-1 items-center`}>
                                <RotateCw size={20} strokeWidth={2.5} />
                                <p className={`${reloadText ? 'w-39' : 'w-0 opacity-0 ml-[-3px]'} truncate overflow-hidden transition-all`}>Arquivos atualizados!</p>
                            </button>

                        </div>


                        <div onClick={listdt.openWindow} className="flex flex-row items-center justify-between gap-2 p-1 px-3 cursor-pointer rounded-md bg-black/40 backdrop-blur-md
                    hover:bg-(--color-lighter) hover:scale-102
                     hover:text-white hover:border-(--color-lighter) transition-all w-full max-w-30 select-none">
                            <p className="text-lg truncate">{currentDesktop?.name}</p>
                            <GripVertical />
                        </div>


                        <SearchBar />
                    </div>)
                    :
                    (<div className="flex flex-row flex-wrap justify-between items-center w-full gap-3 p-4">
                        <div className="w-full max-w-50 flex flex-row gap-2">
                            {allFiles.length >= maxFileStorage ?
                                (<button className="p-1 px-3 bg-zinc-950/50 rounded-md opacity-75 backdrop-blur-md flex flex-row items-center justify-start">
                                    <p className="text-lg text-center">Máximo atingido</p>
                                </button>)
                                :
                                (<button onClick={() => {
                                    newFile.setFile(null)
                                    newFile.openWindow()
                                }}
                                    className="flex flex-row items-center justify-start gap-2 p-1 px-3 cursor-pointer rounded-md bg-black/40 backdrop-blur-md hover:bg-(--color-lighter) border-[1px] 
                    border-transparent hover:text-white hover:border-(--color-lighter) transition-all select-none hover:scale-102">
                                    <CirclePlus />
                                    <p className="text-lg">{t("dashboard.create")}</p>
                                </button>)
                            }
                            <button disabled={!canReload} onClick={() => {
                                if (!currentDesktop) return;
                                reloadAllFiles(currentDesktop.id)
                                contextMenu.setIsVisible(false)
                                setReloadText(true)
                                setTimeout(() => setReloadText(false), 2500)
                            }} className={`${!canReload ? 'opacity-55 scale-94' : 'hover:scale-102 hover:border-(--color-lighter) hover:text-white hover:bg-(--color-lighter) cursor-pointer'} flex flex-row 
                        items-center justify-start p-1 px-2  rounded-md bg-black/40  backdrop-blur-md  border-[1px] 
                    border-transparent   transition-all select-none gap-1 items-center`}>
                                <RotateCw size={20} strokeWidth={2.5} />
                                <p className={`${reloadText ? 'w-39' : 'w-0 opacity-0 ml-[-3px]'} truncate overflow-hidden transition-all`}>Arquivos atualizados!</p>
                            </button>

                        </div>
                        <SearchBar />

                        <div onClick={listdt.openWindow} className="flex flex-row items-center justify-between gap-2 p-1 px-3 cursor-pointer rounded-md bg-black/40 backdrop-blur-md
                    hover:bg-(--color-lighter) hover:scale-102
                     hover:text-white hover:border-(--color-lighter) transition-all w-full max-w-50 select-none">
                            <p className="text-lg truncate">{currentDesktop?.name}</p>
                            <GripVertical />
                        </div>
                    </div>)
                }


                <ArrowLeftToLine onClick={
                    () => {
                        if (!desktopRef.current) return;
                        desktopRef.current.scrollLeft = 0
                    }
                } className={`${contentToLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'} border-transparent border-[2px] hover:border-(--color-lighter) cursor-pointer transition-all z-20 w-15 h-15 p-3 
                        text-(--color-lighter) rounded-full bg-black/30 backdrop-blur-md fixed left-3 md:top-[50%] top-[55%] translate-y-[-100%] md:scale-100 scale-85`} />
                <ArrowUpToLine onClick={
                    () => {
                        if (!desktopRef.current) return;
                        desktopRef.current.scrollTop = 0
                    }
                } className={`${contentToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'} border-transparent border-[2px] hover:border-(--color-lighter) cursor-pointer transition-all z-20 w-15 h-15 p-3 
                        text-(--color-lighter) rounded-full bg-black/30 backdrop-blur-md fixed top-30 left-[50%] md:top-15 translate-x-[-50%] md:scale-100 scale-85`} />
                <ArrowRightToLine onClick={
                    () => {
                        if (!desktopRef.current) return;
                        desktopRef.current.scrollLeft = desktopRef.current.scrollWidth - desktopRef.current.clientWidth
                    }
                } className={`${contentToRight ? 'opacity-100' : 'opacity-0 pointer-events-none'} border-transparent border-[2px] hover:border-(--color-lighter) cursor-pointer transition-all z-20 w-15 h-15 p-3 
                        text-(--color-lighter) rounded-full bg-black/30 backdrop-blur-md fixed right-3 md:top-[50%] top-[55%] translate-y-[-100%] md:scale-100 scale-85`} />
                <ArrowDownToLine onClick={
                    () => {
                        if (!desktopRef.current) return;
                        desktopRef.current.scrollTop = desktopRef.current.scrollHeight - desktopRef.current.clientHeight
                    }
                } className={`${contentToBottom ? 'opacity-100' : 'opacity-0 pointer-events-none'} border-transparent border-[2px] hover:border-(--color-lighter) cursor-pointer transition-all z-20 w-15 h-15 p-3 
                        text-(--color-lighter) rounded-full bg-black/30 backdrop-blur-md fixed bottom-14 left-[50%] translate-x-[-50%] md:scale-100 scale-85`} />

                <div className={`${saving ? 'opacity-100 z-42' : 'opacity-0 z-0'} select-none pointer-none: p-2 px-3 rounded-sm backdrop-blur-sm bg-black/20 flex flex-row gap-2 absolute 
                top-20 right-5 justify-center items-center transition-opacity duration-300`}>
                    <img src="/assets/images/changes.png" className="w-8" />
                    <p className="text-[17px]">Posições atualizadas</p>
                </div>

                <div
                    onMouseDown={handleMouseDown}
                    onMouseMove={moverMouse}
                    onMouseUp={soltarMouse}
                    onMouseLeave={soltarMouse}
                    ref={desktopRef}
                    className={`desktop-area flex-1 w-full relative mb-10 p-4 overflow-scroll select-none`}>

                    {rootFiles.map((icon, index) => (
                        <DraggableIcon
                            index={index}
                            key={icon.id}
                            icon={icon}
                            beingDragged={lastDraggedId === icon.id && isMoving}
                            position={{ x: icon.xPos, y: icon.yPos }}
                        />
                    ))}
                </div>

                <TaskBar />
            </div>
        </>
    );
}

