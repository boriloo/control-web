import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useRootHook } from "../hooks/rootHook";

type RootContextType = {
    root: ReturnType<typeof useRootHook>;
    isMobile: boolean;
};

const RootContext = createContext<RootContextType | undefined>(undefined);

export const RootProvider = ({ children }: { children: ReactNode }) => {
    const root = useRootHook();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < window.innerHeight)
        }

        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    return (
        <RootContext.Provider value={{ root, isMobile }}>
            {children}
        </RootContext.Provider>
    );
};

export const useRootContext = () => {
    const context = useContext(RootContext);
    if (!context)
        throw new Error("useRootContext must be used inside RootProvider");
    return context;
};