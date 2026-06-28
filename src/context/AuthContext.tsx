import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
    useCallback,
} from "react";
import { useAppContext } from "./AppContext";
import { LoginData, RegisterData, UserData } from "../types/auth";
import { authLoginService, authLogoutService, authRefreshService, authRegisterService } from "../services/authServices";
import { getMeService } from "../services/userServices";
import { getDesktopByIdService, getDesktopByOwnerService } from "../services/desktopServices";
import { DesktopData } from "../types/desktop";
import { getSwatches } from 'colorthief';
import { useWindowContext } from "./WindowContext";
import { getProxyStorageService } from "../services/storageServices";
import { useFileContext } from "./FileContext";


interface UserContextProps {
    userFilters: any;
    setUserFilters: (filter: string) => void;
    isAuthenticated: boolean;
    user: UserData | null;
    changeUser: (user: UserData) => void;
    currentDesktop: DesktopData | null;
    changeCurrentDesktop: (desktop: DesktopData) => void;
    standartDesktop: (desktop: any) => DesktopData;
    authLoginUser: (data: LoginData) => Promise<UserData>;
    authRegisterUser: (data: RegisterData) => Promise<void>;
    authLogoutUser: () => Promise<void>;
    isLoading: boolean;
    hasDesktops: boolean;
    setHasDesktops: (value: boolean) => void;
    toBase64Image: (value: any) => void;
    bgColors: any;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { closeAllWindows } = useAppContext();
    const { changeAllFiles, changeRootFiles } = useFileContext();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [currentDesktop, setCurrentDesktop] = useState<DesktopData | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [hasDesktops, setHasDesktops] = useState<boolean>(false);
    const [userFilters, setUserFilters] = useState<string>()
    const [bgColors, setBgColors] = useState({
        darker: '',
        dark: '',
        regular: '',
        light: '',
        lighter: '',
        whity: ''
    });

    useEffect(() => {
        if (hasDesktops) return;

        setBgColors({
            darker: '',
            dark: '',
            regular: '',
            light: '',
            lighter: '',
            whity: ''
        });

    }, [hasDesktops])



    const DEFAULT_COLORS = {
        darker: '#15171a',
        dark: '#1e2126',
        regular: '#262d33',
        light: '#1b6ad1',
        lighter: '#1d8af0',
        whity: '#acdbfa',
    };


    const toHex = (r: number, g: number, b: number) =>
        `#${[r, g, b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;

    const getDesaturatedTone = (r: number, g: number, b: number, intensity: number, saturation: number = 0.15) => {
        const gray = (r * 0.299 + g * 0.587 + b * 0.114);
        return {
            r: (gray * (1 - saturation) + r * saturation) * intensity,
            g: (gray * (1 - saturation) + g * saturation) * intensity,
            b: (gray * (1 - saturation) + b * saturation) * intensity,
        };
    };


    useEffect(() => {
        let isMounted = true;
        const imageUrl = currentDesktop?.backgroundImage;

        if (!imageUrl) return;

        const getColorB = async () => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;

            try {
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                if (!isMounted) return;

                const response = (await getSwatches(img)) as any;
                const swatch = response.Vibrant || response.Muted;

                if (!swatch) {
                    setBgColors(DEFAULT_COLORS);
                    return;
                }

                const { _r: r, _g: g, _b: b } = swatch.color;

                // Saturação reduzida em todos (último parâmetro)
                const cDarker = getDesaturatedTone(r, g, b, 0.05, 0.05);
                const cDark = getDesaturatedTone(r, g, b, 0.17, 0.15);
                const cRegular = getDesaturatedTone(r, g, b, 0.30, 0.25);

                // Usando getDesaturatedTone para light e lighter com saturação bem baixa
                const cLight = getDesaturatedTone(r, g, b, 0.85, 0.85);
                const cLighter = getDesaturatedTone(r, g, b, 1.05, 0.80);

                const cWhity = getDesaturatedTone(r, g, b, 3.0, 0.15);

                if (isMounted) {
                    setBgColors({
                        darker: toHex(cDarker.r, cDarker.g, cDarker.b),
                        dark: toHex(cDark.r, cDark.g, cDark.b),
                        regular: toHex(cRegular.r, cRegular.g, cRegular.b),
                        light: toHex(cLight.r, cLight.g, cLight.b),
                        lighter: toHex(cLighter.r, cLighter.g, cLighter.b),
                        whity: toHex(cWhity.r, cWhity.g, cWhity.b),
                    });
                }
            } catch (err) {
                if (isMounted) setBgColors(DEFAULT_COLORS);
            }
        };

        getColorB();

        return () => { isMounted = false; };
    }, [currentDesktop?.backgroundImage]);


    useEffect(() => {
        const darkFilter = localStorage.getItem('dark-filter')
        const blurFilter = localStorage.getItem('blur-filter')
        const colorFilter = localStorage.getItem('color-filter')


        if (darkFilter) {
            localStorage.setItem('dark-filter', darkFilter)
        } else {
            localStorage.setItem('dark-filter', 'low')
        }

        if (blurFilter) {
            localStorage.setItem('blur-filter', blurFilter)
        } else {
            localStorage.setItem('blur-filter', 'low')
        }

        if (colorFilter) {
            localStorage.setItem('color-filter', colorFilter)
        } else {
            localStorage.setItem('color-filter', 'color')
        }
    }, [])

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


    const changeCurrentDesktop = useCallback(async (desktop: any) => {
        const finalDesktop = await standartDesktop(desktop)

        setCurrentDesktop(finalDesktop);

        localStorage.setItem('last-desktop', desktop.id);
    }, []);


    const changeUser = useCallback((user: UserData) => {
        setUser({
            ...user,
            profileImage: toBase64Image(user.profileImage) as string
        })
    }, [])


    const toBase64Image = (image: any): string | null => {
        if (!image) return null

        if (typeof image === 'string' && image.startsWith('data:')) return image

        if (typeof image === 'string') return `data:image/png;base64,${image}`

        if (Buffer.isBuffer(image)) return `data:image/png;base64,${image.toString('base64')}`

        if (image instanceof Uint8Array) return `data:image/png;base64,${Buffer.from(image).toString('base64')}`

        return null
    }


    const initApp = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentUser = await getMeService();
            setUser({
                ...currentUser,
                profileImage: toBase64Image(currentUser.profileImage)
            });

            console.log('CURRENT USER: ', currentUser)
            setIsAuthenticated(true);

            const desktops = await getDesktopByOwnerService();
            if (desktops && desktops.length > 0) {
                setHasDesktops(true);
                console.log('Desktops: ', desktops)
                const localStorageDesktop = localStorage.getItem('last-desktop');


                const firstDesktop = desktops[0];

                if (localStorageDesktop) {
                    console.log("peguei local storage")
                    try {
                        const desktop = await getDesktopByIdService(localStorageDesktop);
                        changeCurrentDesktop(desktop);

                    } catch (err) {
                        changeCurrentDesktop(firstDesktop);

                    }
                } else {
                    console.log("sem local storage")
                    changeCurrentDesktop(firstDesktop);
                }
            }
        } catch (err) {
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        initApp();
    }, [initApp]);


    async function authLoginUser(data: LoginData) {
        try {
            changeAllFiles([])
            changeRootFiles([])

            setCurrentDesktop(null);
            setHasDesktops(false);
            localStorage.removeItem("last-desktop");

            const userData = await authLoginService(data)
            const { token } = userData

            localStorage.setItem("accessToken", token);

            setUser(userData);
            setIsAuthenticated(true);

            await initApp();
            return userData.user;
        } catch (err) {
            throw err;
        }
    }

    async function authRegisterUser(data: RegisterData) {
        try {

            const userData = await authRegisterService(data)
            setUser(userData);

        } catch (err) {
            throw err;
        }
    }

    async function authLogoutUser() {
        try {
            closeAllWindows()
            await authLogoutService();
            setIsAuthenticated(false)
            setUser(null)
            setHasDesktops(false)
            changeCurrentDesktop(null)
            localStorage.clear();
            changeAllFiles([])
            changeRootFiles([])
        } catch (err) {
            throw err;
        }
    }


    return (
        <UserContext.Provider
            value={{
                userFilters,
                setUserFilters,
                isAuthenticated,
                user,
                changeUser,
                currentDesktop,
                changeCurrentDesktop,
                standartDesktop,
                authLoginUser,
                authRegisterUser,
                isLoading,
                authLogoutUser,
                hasDesktops,
                setHasDesktops,
                toBase64Image,
                bgColors
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser deve ser usado dentro de <AuthProvider>");
    return ctx;
}
