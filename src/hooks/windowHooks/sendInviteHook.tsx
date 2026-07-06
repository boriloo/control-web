import { useState } from "react";
import { useWindowStatus } from "../windowHook";

type miniDt = {
    id: string
    name: string
}

export const useSendInviteHook = () => {
    const { currentStatus, openWindow, minimizeWindow, closeWindow } = useWindowStatus();
    const [desktop, setDesktop] = useState<miniDt | null>(null)
    const [friends, setFriends] = useState<any[]>([])

    return {
        currentStatus,
        openWindow,
        minimizeWindow,
        closeWindow,
        desktop,
        setDesktop,
        friends,
        setFriends
    };
};
