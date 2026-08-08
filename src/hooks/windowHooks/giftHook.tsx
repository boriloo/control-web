import { useWindowStatus } from "../windowHook";

export const useGiftHook = () => {
    const { currentStatus, openWindow, minimizeWindow, closeWindow } = useWindowStatus();

    return {
        currentStatus,
        openWindow,
        minimizeWindow,
        closeWindow
    };
};
