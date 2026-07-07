import { useState } from "react";
import { useWindowStatus } from "../windowHook";
import { FileData } from "../../types/file";

export const useFileHook = () => {
    const { currentStatus, openWindow, minimizeWindow, closeWindow } = useWindowStatus();
    const [file, setFile] = useState<FileData | null>(null);

    return {
        currentStatus,
        openWindow,
        minimizeWindow,
        closeWindow,
        file,
        setFile
    };
};
