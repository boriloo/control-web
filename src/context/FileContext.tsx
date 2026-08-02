import { createContext, useContext, ReactNode, useCallback, useState } from "react";
import { FileData } from "../types/file";
import { getAllFilesFromDesktopService, getFilesFromDesktopService } from "../services/fileServices";

interface FileContextType {
    nextIconPosition: { x: number; y: number } | null;
    changeNextIconPosition: (position: { x: number; y: number }) => void;
    allFiles: FileData[];
    changeAllFiles: (files: FileData[]) => void;
    rootFiles: FileData[];
    changeRootFiles: (files: FileData[]) => void;
    defaultFile: (file: any) => FileData;
    reloadAllFiles: (desktopId: string) => void;
    canReload: boolean;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
    const [allFiles, setAllFiles] = useState<FileData[]>([])
    const [rootFiles, setRootFiles] = useState<FileData[]>([])
    const [nextIconPosition, setNextIconPosition] = useState<{ x: number; y: number } | null>(null)
    const [canReload, setCanReload] = useState<boolean>(true)

    const defaultFile = (file: any): FileData => {
        const {
            created_at,
            desktop_id,
            file_type,
            owner_id,
            parent_id,
            size_in_bytes,
            xpos,
            ypos,
            ...rest
        } = file;

        return {
            ...rest,
            createdAt: created_at ?? file.createdAt,
            desktopId: desktop_id ?? file.desktopId,
            fileType: file_type ?? file.fileType,
            ownerId: owner_id ?? file.ownerId,
            parentId: parent_id ?? file.parentId,
            sizeInBytes: size_in_bytes ?? file.sizeInBytes,
            xPos: xpos ?? file.xPos,
            yPos: ypos ?? file.yPos
        };
    };

    const changeAllFiles = useCallback((files: FileData[]) => {
        setAllFiles(files)
    }, [])

    const changeRootFiles = useCallback((files: FileData[]) => {
        setRootFiles(files)
    }, [])

    const reloadAllFiles = useCallback(async (desktopId: string) => {
        if (!canReload) return;

        setCanReload(false);

        try {
            const files = await getFilesFromDesktopService(desktopId)
            const defaultFiles = files.map((file: any) => defaultFile(file))
            changeRootFiles(defaultFiles)

            const allFilesFetch = await getAllFilesFromDesktopService(desktopId)
            const allDefaultFiles = allFilesFetch.map((file: any) => defaultFile(file))
            changeAllFiles(allDefaultFiles)
        } catch (err) {
            console.log(err)
        } finally {
            setTimeout(() => {
                setCanReload(true);
            }, 20000);
        }
    }, [canReload, changeRootFiles, changeAllFiles])

    const changeNextIconPosition = (position: { x: number; y: number }) => {
        setNextIconPosition(position);
    }

    return <FileContext.Provider value={{
        nextIconPosition,
        changeNextIconPosition,
        allFiles,
        changeAllFiles,
        rootFiles,
        changeRootFiles,
        defaultFile,
        reloadAllFiles,
        canReload,
    }}>
        {children}
    </FileContext.Provider>;
};

export const useFileContext = () => {
    const context = useContext(FileContext);
    if (!context)
        throw new Error("useFileContext must be used inside FileProvider");
    return context;
};