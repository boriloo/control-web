import { useCallback, useEffect, useState } from "react"
import { useRootContext } from "../../../context/RootContext"
import { useWindowContext } from "../../../context/WindowContext"
import { useAppContext } from "../../../context/AppContext"
import { Menu, Trash, Trash2 } from "lucide-react"
import { FileData } from "../../../types/file"
import { useUser } from "../../../context/AuthContext"

export interface IconFileProps {
    file: FileData
    animationKey: number
    index: number
    imageValidations: Record<string, boolean>
}

export default function IconFile({ file, animationKey, index, imageValidations }: IconFileProps) {
    const { root } = useRootContext();
    const { minimazeAllWindows } = useAppContext();
    const { newFile, imgViewer, openLink, fileViewer, deleteFile } = useWindowContext();
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [isValidImage, setIsValidImage] = useState<boolean | null>(null)
    const [driveThumb, setDriveThumb] = useState<string | null>(null)
    const [clickEffects, setClickEffects] = useState<{ id: number, x: number, y: number }[]>([])

    function getDomainFromUrl(url: string): string {
        try {
            const hostname = new URL(url).hostname;
            const parts = hostname.split(".");
            const isCompoundSuffix = parts.length > 2 && parts[parts.length - 2].length <= 3;
            const rootDomain = isCompoundSuffix
                ? parts.slice(-3).join(".")
                : parts.slice(-2).join(".");
            return rootDomain;
        } catch {
            return "";
        }
    }

    useEffect(() => {
        const validateImage = async (): Promise<boolean> => {
            return new Promise((resolve) => {
                if (!file.url || file.fileType !== 'link') return;
                let convertedUrl = 'null'

                if (file.url.startsWith('https://drive.google.com')) {
                    const regex = /\/d\/([a-zA-Z0-9_-]+)/;
                    const match = file.url.match(regex);

                    if (match && match[1]) {
                        const fileId = match[1];
                        convertedUrl = `https://lh3.googleusercontent.com/d/${fileId}=w1000`;
                        setDriveThumb(convertedUrl)
                    } else {
                        console.warn("Não foi possível extrair o ID do arquivo do Google Drive.");
                    }
                } else if (/\.(jpg|jpeg|webp|png)/i.test(file.url as string)) {
                    convertedUrl = file.url
                }

                const img = new Image();

                if (convertedUrl) {
                    img.src = convertedUrl;
                } else {
                    img.src = file.url
                }
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
            });
        }

        const callValidateFunction = async () => {
            const isValid = await validateImage();
            setIsValidImage(isValid)
        }

        callValidateFunction()
    }, [file.url])

    useEffect(() => {
        function loadIcon() {
            if (file.fileType === "folder") {
                return setImageSrc("/assets/images/open-folder.png");
            }

            if (file.fileType === "link") {
                if (isValidImage === null) return;

                if (isValidImage) {
                    if (driveThumb) {
                        setImageSrc(driveThumb);
                    } else {
                        setImageSrc(file.url as string);
                    }
                } else {
                    const domain = getDomainFromUrl(file.url as string);
                    if (domain) {
                        setImageSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
                    } else {
                        setImageSrc("/assets/images/file.png");
                    }
                }
            }
        }
        loadIcon();
    }, [file, isValidImage]);

    const handleDeleteFile = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        deleteFile.setFile(file)
        deleteFile.openWindow()
    }, [file])

    const returnAction = useCallback(() => {
        if (!root.canOpenWindow) return;
        console.log('receba', file)
        newFile.setFile(file)
        if (file.fileType === "link") {
            if (!file.url) return;
            if (imageValidations[file.url]) {
                minimazeAllWindows();
                imgViewer.setFile(file);
                imgViewer.openWindow();
            } else {
                const dontWarning = localStorage.getItem('dont-show-warning')

                if (dontWarning === 'true') {
                    window.open(file.url as string, '_blank')?.focus();
                } else {
                    openLink.setName(file.name as string);
                    openLink.setUrl(file.url as string);
                    openLink.setBackPath(false);
                    openLink.openWindow();
                }
            }
        } else if (file.fileType === "folder") {
            fileViewer.setFile(file)
        }
    }, [imageValidations, root, file])

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setClickEffects(prev => [...prev, { id, x, y }]);

        setTimeout(() => {
            setClickEffects(prev => prev.filter(effect => effect.id !== id));
        }, 1500);
    };

    return (
        <>
            <div
                key={`${file.id}-${animationKey}`}
                onClick={handleClick}
                onDoubleClick={() => returnAction()}
                className={`group/inner flex flex-col p-3 gap-4 rounded-md transition-all cursor-pointer justify-center md:bg-transparent bg-white/5
                hover:bg-white/10 hover:to-(--color-light)/15 animate-slideIn opacity-0 items-center relative select-none
             w-full max-w-[112px] h-[112px]`}
                style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                }}
            >

                <div className="absolute w-full h-full rounded-md overflow-hidden pointer-events-none">
                    {clickEffects.map(effect => (
                        <span
                            key={effect.id}
                            className="absolute w-3 h-3 bg-white/40 clickPing rounded-full pointer-events-none origin-center"
                            style={{
                                left: effect.x,
                                top: effect.y,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    ))}
                </div>


                <div onClick={handleDeleteFile} className="md:scale-0 group-hover/inner:scale-100 flex justify-center absolute top-[-8px] right-[-13px] cursor-pointer 
                items-center transition-all p-1.5
                            bg-red-500 text-white hover:bg-white hover:text-red-600 rounded-full z-10">
                    <Trash2 size={18} />
                </div>

                <img src={imageSrc as string} alt="" className=" h-10 w-10 object-contain transition-all relative z-10" />
                <div className="flex flex-col mt-[-5px] w-full relative z-10">
                    <p className="text-[18px]/[22px] w-full text-center line-clamp-2 transition-all">
                        {file.name}
                    </p>
                </div>

            </div>
        </>
    )
}