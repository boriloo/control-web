import { createContext, useContext, ReactNode, useCallback, useState } from "react";
import { FileData } from "../types/file";

interface FileContextType {
    nextIconPosition: { x: number; y: number } | null;
    changeNextIconPosition: (position: { x: number; y: number }) => void;
    allFiles: FileData[];
    changeAllFiles: (files: FileData[]) => void;
    rootFiles: FileData[];
    changeRootFiles: (files: FileData[]) => void;
    defaultFile: (file: any) => FileData;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
    const [allFiles, setAllFiles] = useState<FileData[]>([])
    const [rootFiles, setRootFiles] = useState<FileData[]>([])
    const [nextIconPosition, setNextIconPosition] = useState<{ x: number; y: number } | null>(null)


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



    const changeNextIconPosition = (position: { x: number; y: number }) => {
        setNextIconPosition(position);
    }

    const changeAllFiles = useCallback((files: FileData[]) => {
        setAllFiles(files)
    }, [])

    const changeRootFiles = useCallback((files: FileData[]) => {
        setRootFiles(files)
    }, [])

    return <FileContext.Provider value={{
        nextIconPosition,
        changeNextIconPosition,
        allFiles,
        changeAllFiles,
        rootFiles,
        changeRootFiles,
        defaultFile
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
