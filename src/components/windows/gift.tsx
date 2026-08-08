import { Coffee, CupSoda, GlassWater, HeartHandshake, Wine, X, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useUser } from "../../context/AuthContext";
import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects } from "../../types/auth";
import { useAppContext } from "../../context/AppContext";

const pixCodes: Record<number, string> = {
    2: "00020126360014BR.GOV.BCB.PIX0114+555199653214252040000530398654042.005802BR5925Murilo de Oliveira Martin6009SAO PAULO62140510yWPn3swOqD63047BEE",
    5: "00020126360014BR.GOV.BCB.PIX0114+555199653214252040000530398654045.005802BR5925Murilo de Oliveira Martin6009SAO PAULO62140510IKoUjKeGbz63048831",
    10: "00020126360014BR.GOV.BCB.PIX0114+5551996532142520400005303986540510.005802BR5925Murilo de Oliveira Martin6009SAO PAULO62140510yL2VlRbccM6304ECC9",
    25: "00020126360014BR.GOV.BCB.PIX0114+5551996532142520400005303986540525.005802BR5925Murilo de Oliveira Martin6009SAO PAULO6214051051vmj7M5th6304E2D3",
    0: "00020126360014BR.GOV.BCB.PIX0114+55519965321425204000053039865802BR5925Murilo de Oliveira Martin6009SAO PAULO62140510G8xKFsJSce6304322F"
};

export default function GiftWindow() {
    const { minimazeAllWindows } = useAppContext();
    const { user, authLogoutUser } = useUser();
    const { gift } = useWindowContext();
    const [isFullsceen, setIsFullscreen] = useState<boolean>(false)
    const [money, setMoney] = useState<number>(2)
    const [copied, setCopied] = useState<boolean>(false)

    if (!user) return null;

    const handleAreaClick = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target != e.currentTarget) return;
        gift.closeWindow();
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(pixCodes[money]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div onClick={handleAreaClick} className={`${isFullsceen ? 'pb-[40px]' : ' p-2 pb-[50px]'} ${gift.currentStatus === "open" ? returnFilterEffects() : 'pointer-events-none'} 
        fixed z-100 flex-1 flex justify-center items-center w-full h-screen transition-all duration-500 cursor-pointer`}>

            <div className={`rounded-lg max-w-[590px] ${gift.currentStatus === "open" ? 'scale-100' : 'scale-50 opacity-0 '} 
                bg-(--color-dark) cursor-default origin-bottom relative transition-all duration-250 flex flex-col w-full h-full max-h-[730px] overflow-y-auto border-1 border-(--color-whity)/10`}>

                <div className="z-50 absolute select-none top-0 right-0 flex flex-row justify-end items-center">
                    <div className="flex flex-row h-full">
                        <X onClick={gift.closeWindow} className="transition-colors cursor-pointer p-2 w-10 h-full hover:bg-red-500 rounded-bl-lg" />
                    </div>
                </div>

                <div className="w-full flex flex-col gap-4 items-center">
                    <h1 className="text-[22px]/[32px] w-full text-center max-w-110 mt-5">Gostou do app? <br />Sinta-se livre para apoiar o projeto!</h1>

                    <div className="flex flex-col justify-center items-center bg-(--color-darker) w-full p-4 border-t-2 border-t-(--color-regular) border-b-2 border-b-(--color-regular) gap-4">
                        <div className="bg-white w-full max-w-70 aspect-square rounded-xl overflow-hidden">
                            <div className="bg-(--color-lighter) p-1 w-full aspect-square">
                                <div
                                    className="w-full h-full bg-(--color-darker)"
                                    style={{
                                        WebkitMaskImage: `url('/assets/qr/${money}.svg')`,
                                        maskImage: `url('/assets/qr/${money}.svg')`,
                                        WebkitMaskSize: "contain",
                                        maskSize: "contain",
                                        WebkitMaskRepeat: "no-repeat",
                                        maskRepeat: "no-repeat",
                                        WebkitMaskPosition: "center",
                                        maskPosition: "center"
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleCopy}
                            className="relative flex items-center justify-center w-48 h-10 bg-(--color-regular) hover:bg-(--color-light) transition-colors text-white rounded-md font-medium cursor-pointer overflow-hidden"
                        >
                            {/* Estado Padrão (Copiar) */}
                            <div className={`absolute flex items-center gap-2 transition-all duration-300 ${copied ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'}`}>
                                <Copy size={20} />
                                <span>Copiar Código Pix</span>
                            </div>

                            {/* Estado Copiado (Sucesso) */}
                            <div className={`absolute flex items-center gap-2 transition-all duration-300 ${copied ? 'translate-y-0 opacity-100' : 'translate-y-[100%] opacity-0'}`}>
                                <Check size={20} className="text-green-400" />
                                <span>Código Copiado!</span>
                            </div>
                        </button>
                    </div>

                    <div className="flex flex-row w-full justify-center items-center flex-wrap gap-4 mt-2">
                        <div onClick={() => setMoney(2)} className={`${money === 2 ? 'border-2 border-(--color-lighter) hover:scale-105 bg-(--color-lighter)/10' :
                            'hover:bg-zinc-200/10 hover:scale-105 border-zinc-300 border'} flex flex-col w-full max-w-23 select-none aspect-square cursor-pointer  
                         transition-all items-center justify-center gap-2 p-2 rounded-md  `}>
                            <GlassWater size={35} className={`${money === 2 ? 'text-(--color-lighter)' : 'text-zinc-300'} `} />
                            <p className={`${money === 2 ? 'text-(--color-lighter)' : 'text-zinc-300'} text-lg`}>R$ 2</p>
                        </div>
                        <div onClick={() => setMoney(5)} className={`${money === 5 ? 'border-2 border-(--color-lighter) hover:scale-105 bg-(--color-lighter)/10' :
                            'hover:bg-zinc-200/10 hover:scale-105 border-zinc-300 border'} flex flex-col w-full max-w-23 select-none aspect-square cursor-pointer  
                         transition-all items-center justify-center gap-2 p-2 rounded-md  `}>
                            <CupSoda size={35} className={`${money === 5 ? 'text-(--color-lighter)' : 'text-zinc-300'} `} />
                            <p className={`${money === 5 ? 'text-(--color-lighter)' : 'text-zinc-300'} text-lg`}>R$ 5</p>
                        </div>
                        <div onClick={() => setMoney(10)} className={`${money === 10 ? 'border-2 border-(--color-lighter) hover:scale-105 bg-(--color-lighter)/10' :
                            'hover:bg-zinc-200/10 hover:scale-105 border-zinc-300 border'} flex flex-col w-full max-w-23 select-none aspect-square cursor-pointer  
                         transition-all items-center justify-center gap-2 p-2 rounded-md  `}>
                            <Coffee size={35} className={`${money === 10 ? 'text-(--color-lighter)' : 'text-zinc-300'} `} />
                            <p className={`${money === 10 ? 'text-(--color-lighter)' : 'text-zinc-300'} text-lg`}>R$ 10</p>
                        </div>
                        <div onClick={() => setMoney(25)} className={`${money === 25 ? 'border-2 border-(--color-lighter) hover:scale-105 bg-(--color-lighter)/10' :
                            'hover:bg-zinc-200/10 hover:scale-105 border-zinc-300 border'} flex flex-col w-full max-w-23 select-none aspect-square cursor-pointer  
                         transition-all items-center justify-center gap-2 p-2 rounded-md  `}>
                            <Wine size={35} className={`${money === 25 ? 'text-(--color-lighter)' : 'text-zinc-300'} `} />
                            <p className={`${money === 25 ? 'text-(--color-lighter)' : 'text-zinc-300'} text-lg`}>R$ 25</p>
                        </div>
                        <div onClick={() => setMoney(0)} className={`${money === 0 ? 'border-2 border-(--color-lighter) hover:scale-105 bg-(--color-lighter)/10' :
                            'hover:bg-zinc-200/10 hover:scale-105 border-zinc-300 border'} flex flex-col w-full max-w-23 select-none aspect-square cursor-pointer  
                         transition-all items-center justify-center gap-2 p-2 rounded-md  `}>
                            <HeartHandshake size={35} className={`${money === 0 ? 'text-(--color-lighter)' : 'text-zinc-300'} `} />
                            <p className={`${money === 0 ? 'text-(--color-lighter)' : 'text-zinc-300'} text-lg`}>Outro</p>
                        </div>
                    </div>

                    <p className="mt-4 text-xl">Minhas redes</p>

                    <div className="flex flex-row gap-2 w-full p-3 flex-wrap select-none mt-[-15px]">
                        <div onClick={() => window.open('https://github.com/boriloo', '_blank')}
                            className="flex-1 md:min-w-auto min-w-30 md:py-2 py-4 p-2 rounded-md flex justify-center items-center hover:scale-102 cursor-pointer transition-all duration-300 bg-black hover:bg-zinc-900">
                            <img src='/assets/images/github.png' className="w-8" />
                        </div>
                        <div onClick={() => window.open('https://www.linkedin.com/in/murilomartins53/', '_blank')} 
                        className="flex-1 md:min-w-auto min-w-30 md:py-2 py-4 p-2 rounded-md flex justify-center items-center hover:scale-102 cursor-pointer transition-all duration-300 bg-[#0077B5] hover:bg-[#2098d6]">
                            <img src='/assets/images/linkedin.png' className="w-8" />
                        </div>
                        <div onClick={() => window.open('https://www.instagram.com/muriloo.martins_/', '_blank')}
                        className="flex-1 md:min-w-auto min-w-30 md:py-2 py-4 p-2 rounded-md flex justify-center items-center hover:scale-102 cursor-pointer transition-all duration-300 bg-gradient-to-tr 
                        from-[#f06c1f] via-[#ee2a7b] to-[#7d28d7] hover:brightness-110">
                            <img src='/assets/images/instagram.png' className="w-7" />
                        </div>
                        <div onClick={() => window.open('https://boriloo.github.io/portfolio/', '_blank')}
                        className="flex-1 md:min-w-auto min-w-30 md:py-2 py-4 p-2 rounded-md flex justify-center items-center hover:scale-102 cursor-pointer text-(--color-lighter) font-medium 
                        transition-all duration-300 bg-black hover:bg-(--color-lighter) hover:text-white">
                            PORTFOLIO
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}