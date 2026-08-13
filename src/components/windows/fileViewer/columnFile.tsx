import { useCallback, useEffect, useState } from "react"
import { useRootContext } from "../../../context/RootContext"
import { useWindowContext } from "../../../context/WindowContext"
import { useAppContext } from "../../../context/AppContext"
import { Menu, Trash } from "lucide-react"
import { FileData } from "../../../types/file"
import { useUser } from "../../../context/AuthContext"

export interface ColumnFileProps {
    file: FileData
    animationKey: number
    index: number
    imageValidations: Record<string, boolean>
}

export default function ColumnFile({ file, animationKey, index, imageValidations }: ColumnFileProps) {



    const { root } = useRootContext();
    const { minimazeAllWindows } = useAppContext();
    const { newFile, imgViewer, openLink, fileViewer, deleteFile } = useWindowContext();
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [isValidImage, setIsValidImage] = useState<boolean | null>(null)
    const [driveThumb, setDriveThumb] = useState<string | null>(null)


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
                openLink.setName(file.name as string);
                openLink.setUrl(file.url as string);
                openLink.setBackPath(true);
                openLink.openWindow();
            }
        } else if (file.fileType === "folder") {
            fileViewer.setFile(file)
        }
    }, [imageValidations, root, file])


    return (
        <div
            key={`${file.id}-${animationKey}`}
            onClick={() => returnAction()}
            className={`group flex flex-row p-3 pl-4.5 gap-4 rounded-md  transition-all cursor-pointer bg-white/8
                hover:bg-(--color-regular)/80 hover:to-(--color-light)/15 animate-slideIn opacity-0 items-center overflow-hidden
            shadow-md min-w-40`}
            style={{
                animationDelay: `${index * 120}ms`,
                animationFillMode: 'forwards'
            }}
        >
            <img src={imageSrc as string} alt="" className="max-h-8 w-8 object-contain transition-all group-hover:ml-0.5" />
            <div className="flex flex-col">
                <p className="text-[18px] w-full max-w-85 truncate transition-all group-hover:ml-1">{file.name}</p>
                <p className="text-[14px] mt-[-5px] opacity-80 transition-all group-hover:ml-1">{imageValidations[file.url as string] ? 'imagem' : file.fileType}</p>
            </div>
            <p className="ml-[-5px] p-1 px-2 opacity-0 transition-all rounded-md group-hover:opacity-100 group-hover:ml-2 text-(--color-lighter) bg-(--color-light)/15">Clique para abrir</p>
            <div className="ml-auto flex flex-row gap-3">

                <Trash onClick={handleDeleteFile} className="cursor-pointer transition-all md:opacity-0 md:group-hover:w-30 w-30 md:group-hover:opacity-100 hover:bg-red-700/35 
                absolute right-0 top-0 hover:border-red-500 hover:text-red-500 md:w-0 h-full p-4 bg-(--color-dark)" />
            </div>
        </div>
    )
}