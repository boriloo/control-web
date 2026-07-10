import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useWindowContext } from "../../context/WindowContext";
import { returnFilterEffects } from "../../types/auth";
import { useUser } from "../../context/AuthContext";
import { useCallback, useState } from "react";
// import { createDesktop, updateDesktopBackground } from "../../services/desktop";
// import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { ClickableImageInput } from "../imageInput";
import { DesktopType } from "../../types/desktop";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useAppContext } from "../../context/AppContext";
import { createDesktopService, updateDesktopService } from "../../services/desktopServices";
import { CreateDesktopData } from "../../types/desktop";
import { set } from "zod";
import { UploadStorageData } from "../../types/storage";
import { uploadStorageService } from "../../services/storageServices";

type colors = 'red' | 'blue' | 'black' | 'purple' | 'green' | 'orange'

export default function NewDesktopWindow() {
    const { callToast } = useAppContext();
    const { newdt } = useWindowContext();
    const { user, changeCurrentDesktop } = useUser();
    const [imageSelected, setImageSelected] = useState<File>()
    const [desktopName, setDesktopName] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [typaBackgroundCount, setTypaBackgroundCount] = useState<number>(1)
    const [backgroundUrl, setBackgroundUrl] = useState<string>('')
    const [colorSelected, setColorSelected] = useState<colors>('red')
    const [desktopType, setDesktopType] = useState<DesktopType>('personal')

    const nextBg = useCallback(() => {
        if (typaBackgroundCount != 3) {
            setTypaBackgroundCount(prev => prev as number + 1)
        } else {
            setTypaBackgroundCount(1)
        }
    }, [typaBackgroundCount])

    const previousBg = useCallback(() => {
        if (typaBackgroundCount != 1) {
            setTypaBackgroundCount(prev => prev as number - 1)
        } else {
            setTypaBackgroundCount(3)
        }
    }, [typaBackgroundCount])

    const bgText = useCallback(() => {
        switch (typaBackgroundCount) {
            case 1:
                return 'Upload'
            case 2:
                return 'URL'
            case 3:
                return 'Cor Fixa'
        }
    }, [typaBackgroundCount])

    const handleUpload = async (data: UploadStorageData) => {
        try {
            const { path } = await uploadStorageService(data)

            return path
        } catch (err) {
            return undefined;
        }

    }

    const handleSubmit = async () => {
        try {
            setLoading(true)

            if (!user || !desktopName) return;

            let wallpaperUrl = 'none';
            let typeOfDesktop = '';
            let path;
            let typaBackground;

            if (typaBackgroundCount === 1) {
                typaBackground = 'upload'
            } else if (typaBackgroundCount === 2) {
                typaBackground = 'url'
            } else if (typaBackgroundCount === 3) {
                typaBackground = 'color'
            }

            switch (typaBackground) {
                case 'url':
                    wallpaperUrl = backgroundUrl
                    break;
                case 'color':
                    wallpaperUrl = `assets/colors/default_${colorSelected}.png`
                    break;
            }

            switch (desktopType) {
                case 'personal':
                    typeOfDesktop = 'personal'
                    break;
                case 'shared':
                    typeOfDesktop = 'shared'
                    break;
            }


            let newDesktop = await createDesktopService({
                name: desktopName,
                backgroundImage: wallpaperUrl,
                desktopType: typeOfDesktop as DesktopType,
                members: [user.id]
            } as CreateDesktopData)

            if (typaBackground === 'upload') {
                path = await handleUpload({ file: imageSelected, typeOfUpload: 'desktop', desktopId: newDesktop.id } as UploadStorageData)
                wallpaperUrl = path

                newDesktop = await updateDesktopService(newDesktop.id, { name: newDesktop.name, backgroundImage: wallpaperUrl, })
            }

            changeCurrentDesktop(newDesktop)
        } catch (err) {
            console.log('Erro ao criar: ', err)
        } finally {
            setLoading(false)
        }
    }


    return (
        newdt.currentStatus != 'closed' && <div className={`${newdt.currentStatus === 'open' ? returnFilterEffects() : 'pointer-events-none '} 
        transition-all duration-500 fixed z-100 w-full h-screen flex justify-center items-center p-4 pb-[50px] cursor-pointer`}>
            <div className={`${newdt.currentStatus === 'open' ? 'scale-100' : 'scale-50 opacity-0'} cursor-default bg-(--color-dark) origin-center rounded-md p-4 w-full 
                max-w-[600px] max-h-full flex flex-col gap-4 overflow-y-auto transition-all relative pb-5  border-1 border-(--color-whity)/10`}>
                <X onClick={newdt.closeWindow} size={35} className="absolute top-0 right-0 p-2 rounded-bl-lg cursor-pointer transition-all hover:bg-red-500" />
                <h1 className="text-[24px]">Criar novo Desktop</h1>
                <div className="flex flex-col gap-1 w-full">
                    <p className="text-xl">Nome</p>
                    <input type="text" onChange={(e) => setDesktopName(e.target.value)} className="border-1 border-(--color-light) outline-none transition-all text-[17px] bg-(--color-regular)/50
                             hover:bg-(--color-regular)/70  
                                cursor-pointer focus:cursor-text p-1 px-2.5 rounded-sm focus:border-(--color-light) focus:bg-(--color-light)/40 text-(--color-lighter) focus:text-white w-full" />
                </div>

                <div className="flex flex-col gap-2 w-full items-start max-w-[1000px] ">
                    <p className="text-lg">Plano de fundo</p>
                    <div className="flex flex-row rounded-lg overflow-hidden w-full max-w-[300px] select-none">
                        <div onClick={previousBg} className="text-white p-2 border-2 border-(--color-light) rounded-l-lg flex justify-center items-center hover:bg-(--color-lighter) transition-all cursor-pointer">
                            <ChevronLeft strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 text-lg flex justify-center items-center bg-(--color-darker)">
                            {bgText()}
                        </div>
                        <div onClick={nextBg} className="text-white p-2 border-2 border-(--color-light) rounded-r-lg flex justify-center items-center hover:bg-(--color-lighter) transition-all cursor-pointer">
                            <ChevronRight strokeWidth={2.5} />
                        </div>
                    </div>



                    <div className={`${typaBackgroundCount === 1 ? 'h-auto' : 'h-0 opacity-0'}  ${loading ? 'saturate-0 pointer-events-none opacity-50 scale-90' : ''} 
                            origin-left flex flex-col items-start transition-all w-full overflow-hidden mt-2`}>
                        <ClickableImageInput onFileSelected={(file) => {
                            setImageSelected(file)
                        }} />
                    </div>

                    <div className={`${typaBackgroundCount === 2 ? 'h-20' : 'h-0 opacity-0 mt-[-10px]'} ${loading ? 'saturate-0 pointer-events-none opacity-50 scale-90' : ''} 
                            origin-left flex flex-col items-start transition-all w-full overflow-hidden`}>
                        <p className="text-md">URL do Desktop</p>
                        <input value={backgroundUrl} onChange={(e) => {
                            setBackgroundUrl(e.target.value)
                        }} type="text" className="border-1 border-(--color-light)/50 outline-none transition-all text-lg bg-(--color-regular) hover:bg-(--color-light)/30 mt-1
                                cursor-pointer focus:cursor-text p-0.5 px-1.5 rounded-sm focus:border-(--color-light) focus:bg-(--color-lighter)/40 w-full max-w-[500px]" />
                    </div>

                    <div className={`${typaBackgroundCount === 3 ? 'h-14 mt-[-12px]' : 'h-0 opacity-0 mt-[-10px]'} flex flex-row gap-3 transition-all items-center justify-center overflow-hidden`}>
                        <div onClick={() => setColorSelected('red')} className={`${colorSelected === 'red' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-red-500 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-red-400`}></div>
                        <div onClick={() => setColorSelected('blue')} className={`${colorSelected === 'blue' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-blue-600 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-blue-500 `}></div>
                        <div onClick={() => setColorSelected('black')} className={`${colorSelected === 'black' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-zinc-950 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-zinc-900`}></div>
                        <div onClick={() => setColorSelected('purple')} className={`${colorSelected === 'purple' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-purple-500 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-purple-400`}></div>
                        <div onClick={() => setColorSelected('green')} className={`${colorSelected === 'green' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-green-500 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-green-400`}></div>
                        <div onClick={() => setColorSelected('orange')} className={`${colorSelected === 'orange' ? 'border-rose-400 shadow-[inset_0_0px_0px_3px_rgba(0,0,0,1)] w-9 h-9' : 'border-transparent w-7 h-7'} 
                        bg-orange-500 border-3 rounded-full cursor-pointer hover:scale-105 transition-all hover:bg-orange-400`}></div>
                    </div>
                </div>


                <div className="flex flex-col gap-2 w-full items-start max-w-[1000px]">
                    <p className="text-lg">Tipo de Desktop</p>
                    <div className="flex flex-row gap-2 w-full">
                        <div className="flex-1 relative">

                            <button
                                onClick={() => setDesktopType('personal')}
                                className={`${desktopType === 'personal' ? 'bg-(--color-light) hover:bg-(--color-lighter) hover:border-(--color-lighter)' : 'hover:bg-white/10'} 
                                peer font-medium border border-(--color-light) rounded-md p-2 w-full transition-all cursor-pointer`}
                            >
                                Pessoal
                            </button>

                            <p className="bg-black/30 backdrop-blur-md rounded-lg p-1 px-2 absolute top-0 left-[50%] mt-[-65px] pointer-events-none
                            translate-x-[-50%] w-[90%] peer-hover:opacity-100 opacity-0 transition-opacity duration-400 text-center">Apenas para você, deixe tudo do seu jeito.</p>
                        </div>
                        <div className="flex-1 relative">


                            <button onClick={() => setDesktopType('shared')} className={`${desktopType === 'shared' ? 'bg-(--color-light) hover:bg-(--color-lighter) hover:border-(--color-lighter)' : 'hover:bg-white/10'} 
                              peer font-medium border-1 border-(--color-light) rounded-md p-2 w-full transition-all cursor-pointer `}>Compartilhado</button>

                            <p className="bg-black/30 backdrop-blur-md rounded-lg p-1 px-2 absolute top-0 left-[50%] mt-[-65px] pointer-events-none
                            translate-x-[-50%] w-[90%] peer-hover:opacity-100 opacity-0 transition-opacity duration-400 text-center">Adicione membros, e compartilhe seus arquivos.</p>
                        </div>


                    </div>
                </div>
                <button onClick={handleSubmit} disabled={!imageSelected || desktopName === '' || loading} className={`${!imageSelected || desktopName === '' ? 'pointer-events-none saturate-0 opacity-40' : ''}
                    bg-rose-500 border-none text-xl ${loading ? 'saturate-0 pointer-events-none' : 'p-2'} flex justify-center px-6 font-medium cursor-pointer 
                    mt-2 rounded-sm transition-all hover:bg-rose-400 hover:scale-101 `}>
                    {loading ? <DotLottieReact
                        src="assets/images/loader.lottie"
                        className="w-26 p-0"
                        loop
                        autoplay
                    /> : 'Criar Desktop'}
                </button>
            </div>

        </div>
    )
}