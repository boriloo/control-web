import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects } from "../../types/auth";
import { useUser } from "../../context/AuthContext";
import { useEffect, useState } from "react";

export default function OpenLinkWindow({ url }: { url: string | null }) {
    const { user } = useUser();
    const { openLink } = useWindowContext();
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [dontShow, setDontShow] = useState<boolean>(false)

    const handleAreaClick = (e: React.MouseEvent<HTMLElement>) => {
        if (e.target != e.currentTarget) return;
        openLink.closeWindow();
    }


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
        function loadIcon() {
            const domain = getDomainFromUrl(openLink.url as string);
            if (domain) {
                setImageSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
            } else {
                setImageSrc("/assets/images/file.png");
            }
        }

        loadIcon();
    }, [openLink.url]);


    return (
        <div onClick={handleAreaClick} className={`${openLink.currentStatus === 'open' ? returnFilterEffects() : 'pointer-events-none '} 
        transition-all duration-500 fixed z-110 w-full h-screen flex justify-center items-center p-2 pb-[50px] cursor-pointer`}>
            <div className={`${openLink.currentStatus === 'open' ? 'scale-100' : 'scale-50 opacity-0'} items-start cursor-default bg-(--color-dark)
             origin-center rounded-md p-4 w-full max-w-[700px] max-h-full flex flex-col gap-4 overflow-y-auto transition-all relative justify-start  border-1 border-(--color-whity)/10`}>
                <div className="p-1.5 bg-(--color-regular) border border-(--color-light)/50 rounded-md absolute top-4 right-4">
                    <img src={imageSrc as string} className="w-10 object-contain pointer-events-none select-none" />
                </div>
                <h1 className="text-[25px] truncate max-w-[85%]  flex flex-row shrink-0">
                    Acessar <p className="ml-2 text-[25px] truncate text-blue-400">{openLink.name}</p>?
                </h1>

                <p className="md:mt-[-10px] text-[18px] text-red-400 mt-2 p-1 px-2 rounded-md bg-red-600/15 shrink-0">
                    Aviso - Você será redirecionado à outra página
                </p>
                <div className="flex flex-col gap-1 w-full">
                    {url && (
                        <>
                            <p className="text-[18px]">Domínio</p>
                            <p className="text-[18px] w-full max-w-full p-1 bg-(--color-regular) border-1 rounded-md border-(--color-light)/50 px-2">
                                {new URL(url).hostname}
                            </p>
                            <p className="text-[18px] mt-2">URL</p>
                            <p className="text-[18px] w-full max-w-full overflow-auto p-1 bg-(--color-regular) border-1 rounded-md border-(--color-light)/50 px-2">
                                {url}
                            </p>
                        </>
                    )}

                </div>
                <div className="flex flex-col gap-3 w-full items-center">

                    {/* VERSAO LANCAMENTO */}


                    <div className="flex flex-row gap-2 w-full">
                        <button onClick={openLink.closeWindow} className="flex-1 p-1 px-8 text-lg text-white bg-(--color-regular) cursor-pointer transition-all hover:bg-red-500 rounded-md">
                            Voltar
                        </button>
                        <button onClick={() => {
                            if (dontShow) {
                                localStorage.setItem('dont-show-warning', 'true')
                            }

                            window.open(url as string, '_blank')?.focus();
                            openLink.closeWindow();
                        }} className="flex-1 p-1 px-6 text-lg text-(--color-lighter) border-1 border-(--color-lighter) cursor-pointer transition-all hover:bg-(--color-lighter) hover:text-white rounded-md">
                            Acessar
                        </button>
                    </div>


                    <p onClick={() => { setDontShow(!dontShow) }} className={`${dontShow ? ' bg-white text-(--color-dark)' : 'scale-90 border-white/70 hover:scale-95 text-white/70'} 
                    text-lg p-1 px-4 border-1 rounded-full mt-1 cursor-pointer transition-all select-none`}>
                        Não me pergunte de novo.
                    </p>

                </div>
            </div>
        </div >
    )
}