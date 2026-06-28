import { useCallback, useState } from "react";
import { useWindowStatus } from "../windowHook";
import { DesktopData } from "../../types/desktop";
import { getProxyStorageService } from "../../services/storageServices";

export const useDesktopConfigHook = () => {
    const { currentStatus, openWindow, minimizeWindow, closeWindow } = useWindowStatus();
    const [desktop, setDesktop] = useState<DesktopData | null>(null)

    const standartDesktop = async (desktop: any) => {
        const background = desktop.backgroundImage ?? desktop.background_image
        const useProxy = background.startsWith('desktops/')

        let proxiedImage;

        if (useProxy) {
            proxiedImage = await getProxyStorageService(desktop.backgroundImage ?? desktop.background_image);
        }

        const {
            background_image,
            desktop_type,
            created_at,
            owner_id,
            ...rest
        } = desktop;

        const returnDesktop = {
            ...rest,
            backgroundImage: useProxy ? proxiedImage : background_image ?? desktop.backgroundImage,
            desktopType: desktop_type ?? desktop.desktopType,
            createdAt: created_at ?? desktop.createdAt,
            ownerId: owner_id ?? desktop.ownerId
        };

        return returnDesktop;
    }


    const changeDesktop = useCallback(async (desktop: any) => {
        const finalDesktop = await standartDesktop(desktop)
        setDesktop(finalDesktop)
    }, [])

    return {
        desktop,
        changeDesktop,
        currentStatus,
        openWindow,
        minimizeWindow,
        closeWindow
    };
};
