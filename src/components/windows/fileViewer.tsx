import { Plus, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useWindowContext } from "../../context/WindowContext"
import { useUser } from "../../context/AuthContext";
import { returnFilterEffects } from "../../types/auth";
import { useAppContext } from "../../context/AppContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FileData, FilePathData } from "../../types/file";
import { getFileByIdService, getFileParentNamesService, getFilesFromParentService } from "../../services/fileServices";
import { useFileContext } from "../../context/FileContext";
import IconFile from "./fileViewer/iconFile";

export default function FileWindow() {
    const { allFiles, defaultFile } = useFileContext()
    const { minimazeAllWindows } = useAppContext();
    const { user, currentDesktop } = useUser()
    const { fileViewer, newFile, deleteFile } = useWindowContext();
    const [internalFiles, setInternalFiles] = useState<FileData[]>([])
    const [imageValidations, setImageValidations] = useState<Record<string, boolean>>({});

    const [animationKey, setAnimationKey] = useState<number>(0);
    const [seeFiles, setSeeFiles] = useState<boolean>(false)
    const [path, setPath] = useState<FilePathData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [animKey, setAnimKey] = useState(0);



    useEffect(() => {
        let ignore = false;

        setLoading(true)

        if (!fileViewer.file?.desktopId || !fileViewer.file?.id || !user || !currentDesktop) return;


        setAnimKey(prev => prev + 1);
        const initInternalFiles = async () => {
            if (!fileViewer.file) return;

            try {
                const files = await getFilesFromParentService(currentDesktop?.id, fileViewer.file.id)
                const pathData = await getFileParentNamesService(currentDesktop.id, fileViewer.file.parentId)

                if (ignore) return;

                const defaultFiles = files.map((file: any) => defaultFile(file))

                type FileType = "folder" | "link" | "file";
                const typeOrder: Record<FileType, number> = { folder: 0, link: 1, file: 2 };

                const sortedArray = defaultFiles.sort((a: { fileType: FileType }, b: { fileType: FileType }) => {
                    return typeOrder[a.fileType] - typeOrder[b.fileType];
                });

                setInternalFiles(sortedArray);
                setPath(pathData.reverse())

            } catch (err) {
                if (ignore) return;
            } finally {

                if (!ignore) setLoading(false)
            }
        }

        initInternalFiles()


        return () => {
            ignore = true;
        }

    }, [fileViewer.file, user?.id, allFiles]);

    useEffect(() => {
        if (fileViewer.currentStatus === 'open') {
            setSeeFiles(false)
            setTimeout(() => {
                setAnimationKey(prev => prev + 1);
                setSeeFiles(true)
            }, 100)
        }
    }, [fileViewer.currentStatus]);

    function validateImage(url: string): Promise<boolean> {
        return new Promise((resolve) => {
            let convertedUrl = 'null'
            if (url.startsWith('https://drive.google.com')) {
                const regex = /\/d\/([a-zA-Z0-9_-]+)/;
                const match = url.match(regex);

                if (match && match[1]) {
                    const fileId = match[1];
                    convertedUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
                } else {
                    console.warn("Não foi possível extrair o ID do arquivo do Google Drive.");
                }
            } else if (/\.(jpg|jpeg|png|webp|gif|bmp|svg)/i.test(url)) {
                convertedUrl = url
            }

            const img = new Image();
            if (convertedUrl) {
                img.src = convertedUrl;
            } else {
                img.src = url
            }

            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
        });
    }

    useEffect(() => {
        internalFiles.forEach(file => {
            if (file.fileType === 'link' && file.url && !imageValidations[file.url]) {
                validateImage(file.url).then(isValid => {
                    setImageValidations(prev => ({
                        ...prev,
                        [file.url as string]: isValid
                    }));
                });
            }
        });
    }, [internalFiles]);


    const handleAreaClick = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target != e.currentTarget) return;
        if (loading) return;
        fileViewer.closeWindow();
    }

    const handleCreateFile = () => {
        newFile.openWindow()
        newFile.setFile(fileViewer.file)
    }

    const handleDeleteFolder = () => {
        deleteFile.setFile(fileViewer.file)
        deleteFile.openWindow()
    }

    const handlePathClick = async (pathId: string | null) => {
        if (!currentDesktop) return;

        if (!pathId) {
            minimazeAllWindows()
            return;
        }

        try {
            setLoading(true)
            const file = await getFileByIdService(pathId, currentDesktop?.id)
            const dftFile = defaultFile(file)

            fileViewer.setFile(dftFile)
        } catch (err) {
            throw err
        } finally {
            setLoading(false)
        }

    }


    return (
        <>
            <div className={`flex-1 w-full h-screen absolute z-[20] transition-all duration-500  ${fileViewer.currentStatus === "open" ? returnFilterEffects() : 'pointer-events-none'} `}></div>
            <div onClick={handleAreaClick} className={`${fileViewer.currentStatus === "open" ? '' : 'pointer-events-none'} 
        fixed z-100 flex-1 flex justify-center items-center w-full h-screen transition-all duration-500 md:p-4 p-2 cursor-pointer group`}>

                <div className={` ${fileViewer.currentStatus === "open" ? 'scale-100' : 'scale-0 opacity-0'} hover:scale-100 hover:opacity-100 
                group-hover:scale-95 group-hover:opacity-98 group-hover:bg-red-800/10 hover:bg-transparent
                ${loading ? 'max-w-[60px] max-h-[60px] rounded-[50px]' : 'rounded-[10px] max-w-[1200px] max-h-[700px]'}  bg-linear-to-b from-(--color-dark)/80 to-(--color-regular)/10
                border-t-1 border-white/20 cursor-default relative ${loading ? '' : 'overflow-y-auto'}
                transition-all duration-300 flex flex-col w-full h-[90%] shadow-black/10 shadow-lg
                 select-none backdrop-blur-[2.2vi]`}>

                    <DotLottieReact
                        src="assets/images/loader.lottie"
                        className={`${loading ? '' : 'opacity-0 z-[-1] pointer-events-none'} select-none w-40 transition-all absolute self-center top-[-9px]`}
                        loop
                        autoplay
                    />
                    <div className={`${loading ? 'opacity-0 select-none pointer-events-none' : ''} transition-all flex flex-col items-center w-full h-full gap-4 p-4 relative `}>

                        <div onClick={fileViewer.closeWindow} className={`flex absolute right-0 top-0 justify-center cursor-pointer items-center transition-all p-3 
                             text-white hover:bg-red-500 rounded-bl-md rounded-tr-md`}>
                            <X strokeWidth={3} size={22} />
                        </div>

                        {/* ENDERECO */}
                        <div className="p-1.5 bg-zinc-950/70 px-2 rounded-full flex flex-row mt-1 ">
                            {path && path.map((pathSegment) => (
                                <div className="flex flex-row items-center">
                                    <p key={pathSegment.name} onClick={() => handlePathClick(pathSegment.id)}
                                        className={`${loading ? 'opacity-0 pointer-events-none' : ''} p-0.5 px-2 rounded-full transition-all cursor-pointer h-7 hover:bg-white/20 
                                        hover:px-3 max-w-40 truncate`}>
                                        {pathSegment.id ? pathSegment.name : currentDesktop?.name}
                                    </p>
                                    <p className={`${loading ? 'opacity-0 pointer-events-none' : ''} ml-1 mr-1 text-white/20 transition-all`}>|</p>
                                </div>
                            ))}
                            <p className={`${loading ? 'opacity-0 pointer-events-none' : ''} p-0.5 px-2 transition-all rounded-sm leading-5.2 text-white max-w-40 truncate h-7`}
                                key={animKey}>
                                {fileViewer.file?.name}
                            </p>
                        </div>

                        <div className="flex flex-row gap-7 items-center">

                            <div onClick={handleDeleteFolder} className="flex justify-center cursor-pointer items-center transition-all p-3 
                            bg-black/40 text-red-600 hover:bg-white hover:text-red-600 rounded-full">
                                <Trash2 />
                            </div>


                            <div className="flex flex-col items-center gap-2">

                                <p className="text-[37px] text-center text-shadow-zinc-700/20 w-full max-w-[700px] line-clamp-2 text-shadow-sm">{fileViewer.file?.name ?? 'Erro ao carregar nome do arquivo'}</p>
                                <p className="text-[15px] mt-[-5px] opacity-80">Criado em {new Date(fileViewer.file?.createdAt as Date)?.toLocaleDateString('pt-BR')}</p>

                            </div>

                            <div onClick={handleCreateFile} className="flex justify-center cursor-pointer items-center transition-all p-3 
                            bg-black/40 text-(--color-lighter) hover:bg-white hover:text-(--color-light) rounded-full">
                                <Plus />
                            </div>
                        </div>

                        <div className={`${!seeFiles && 'opacity-0'} flex justify-start items-start flex-row relative gap-4 gap-y-4 
                         content-start w-full h-full rounded-md p-2 overflow-y-auto scroll-smooth flex-wrap min-h-[400px]`}>

                            {
                                internalFiles.map((file, index) => (
                                    <IconFile file={file} animationKey={animationKey} index={index} imageValidations={imageValidations} />
                                ))
                            }

                            <div className={`${!loading && internalFiles.length === 0 ? '' : 'opacity-0 scale-80'} flex flex-1 justify-center h-full transition-all duration-400 delay-200 items-center flex-col gap-6 mt-[-10px]`}>
                                <img src="/assets/images/empty.png" className="w-25 opacity-60" />
                                <p className="text-xl opacity-70">Esta pasta está vazia.</p>
                            </div>
                        </div>

                    </div>

                </div>

                <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slideIn {
                    animation: slideIn 0.3s ease;
                }
            `}</style>
            </div >
        </>
        // <div onClick={handleAreaClick} className={`${isFullsceen ? 'pb-[40px]' : ' p-2 pb-[50px]'} ${fileViewer.currentStatus === "open" ? returnFilterEffects() : 'pointer-events-none'} 
        // fixed z-100 flex-1 flex justify-center items-center w-full h-screen transition-all duration-500 cursor-pointer`}>
        //     <div className={`${isFullsceen ? 'max-w-full max-h-full' : 'rounded-lg max-w-[1200px] max-h-[700px]'} ${fileViewer.currentStatus === "open" ? 'scale-100' : 'scale-50 opacity-0'} 
        //         bg-(--color-dark) cursor-default origin-bottom relative transition-all duration-250 flex flex-col w-full h-full overflow-y-auto select-none`}>
        //         <div className="z-50 sticky select-none top-0 w-full bg-black/50 h-8 flex flex-row justify-between items-center backdrop-blur-[2px]">
        //             <p className="p-2">{fileViewer.file?.name ?? 'Pasta'}</p>
        //             <div className="flex flex-row h-full">
        //                 <Minus onClick={fileViewer.minimizeWindow} className="transition-colors cursor-pointer p-1 px-2 w-9 h-full hover:bg-white/20" />
        //                 <Maximize onClick={() => setIsFullscreen(!isFullsceen)} className="transition-colors cursor-pointer p-1 px-2 w-9 h-full hover:bg-white/20" />
        //                 <X onClick={() => {fileViewer.closeWindow; setLoading(true)}} className="transition-colors cursor-pointer p-1 px-2 w-9 h-full hover:bg-red-500" />
        //             </div>
        //         </div>
        //         <div className="flex flex-col w-full p-4 gap-4 items-center">
        //             <div className="flex row items-start gap-4 w-full flex-wrap">
        //                 <div className="flex-1 flex flex-col gap-2">
        //                     <p>Endereço</p>
        //                     <div className=" p-1 px-2 flex flex-row bg-black/30 rounded-md border-1 border-(--color-light)/60 items-center relative overflow-hidden">
        //                         {/* <div className={`${loading ? 'z-80' : 'opacity-0 pointer-events-none z-0'} absolute transition-all duration-500 w-full h-full bg-(--color-darker) 
        //                         left-0 p-2 px-3 items-center text-(--color-light)`}>Carregando...</div> */}
        //                         <FolderRoot size={16} className="mr-2 ml-1 text-(--color-light)" />
        //                         {path && path.map((pathSegment) => (
        //                             <div className="flex flex-row items-center">
        //                                 <p key={pathSegment.name} onClick={() => handlePathClick(pathSegment.id)}
        //                                     className={`${loading ? 'opacity-0 pointer-events-none' : ''} p-0.5 px-2 rounded-sm transition-all cursor-pointer h-7 hover:bg-zinc-800 
        //                                 hover:px-3 max-w-40 truncate`}>
        //                                     {pathSegment.id ? pathSegment.name : currentDesktop?.name}
        //                                 </p>
        //                                 <p className={`${loading ? 'opacity-0 pointer-events-none' : ''} ml-1 mr-1 text-(--color-light) transition-all`}>|</p>
        //                             </div>
        //                         ))}
        //                         <p className={`${loading ? 'opacity-0 pointer-events-none' : ''} p-0.5 ml-2 px-2 transition-all rounded-sm bg-(--color-light)/10 leading-5.5 text-(--color-lighter) max-w-40 truncate h-7`}
        //                             key={animKey}>
        //                             {fileViewer.file?.name}
        //                         </p>
        //                     </div>
        //                 </div>
        //                 <div className="flex flex-row gap-4 flex-1 max-w-75">
        //                     <div onClick={handleCreateFile} className="flex flex-col items-center p-2 px-4 gap-1 bg-(--color-light)/80 flex-1 
        //                     cursor-pointer  transition-all rounded-md hover:bg-white hover:text-(--color-dark) hover:border-white/70 hover:scale-105">
        //                         <Plus size={25} />
        //                         Novo Item
        //                     </div>
        //                     {/* <div className="flex flex-col items-center p-2 px-4 gap-1 bg-(--color-regular) flex-1 cursor-pointer 
        //                      transition-all rounded-md hover:bg-blue-600/10 hover:text-blue-500 hover:border-blue-500
        //                     inset-shadow-sm inset-shadow-zinc-600 shadow-md hover:inset-shadow-blue-900">
        //                         <ExternalLink size={25} />
        //                         Abrir
        //                     </div> */}
        //                     <div onClick={handleDeleteFolder} className="flex flex-col items-center p-2 px-4 gap-1 bg-(--color-light)/80 flex-1 cursor-pointer 
        //                      transition-all rounded-md hover:bg-red-600/20 hover:text-red-500 hover:border-red-500 hover:scale-105">
        //                         <Trash size={25} />
        //                         Excluir Pasta
        //                     </div>
        //                 </div>

        //             </div>
        //         </div>
        //         <div className="flex flex-row gap-1 rounded-md flex-1  mx-4 mb-4 overflow-hidden min-h-[200px]">

        //             <div className={`${!seeFiles && 'opacity-0'} flex flex-1 flex-col relative gap-2 w-full rounded-md p-2 overflow-y-auto scroll-smooth`}>
        //                 <div className={`${loading ? '' : 'opacity-0 pointer-events-none mt-5 blur-sm'} transition-all duration-500 flex flex-col absolute z-10 justify-center 
        //                 items-center bg-(--color-darker) inset-0`}>
        //                     <DotLottieReact
        //                         src="assets/images/fileLoader.lottie"
        //                         className="w-110 p-0 mt-[-80px]"
        //                         loop
        //                         autoplay
        //                     />
        //                     <p className="text-xl font-medium mt-[-70px]">Carregando arquivos</p>
        //                 </div>
        //                 {internalFiles.length > 0 ?
        //                     internalFiles.map((file, index) => (
        //                         <ColumnFile file={file} animationKey={animationKey} index={index} imageValidations={imageValidations} />
        //                     ))
        //                     :
        //                     <div className="flex flex-1 justify-center items-center flex-col gap-6">
        //                         <img src="/assets/images/empty.png" className="w-25 opacity-60" />
        //                         <p className="text-xl font-medium opacity-70">Esta pasta está vazia.</p>
        //                     </div>
        //                 }
        //             </div>
        //         </div>
        //     </div>

        //     <style>{`
        //         @keyframes slideIn {
        //             from {
        //                 opacity: 0;
        //                 transform: translateY(30px);
        //             }
        //             to {
        //                 opacity: 1;
        //                 transform: translateY(0);
        //             }
        //         }

        //         .animate-slideIn {
        //             animation: slideIn 0.3s ease;
        //         }
        //     `}</style>
        // </div >
    )
}