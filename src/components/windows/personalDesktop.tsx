import { useCallback, useEffect, useState } from "react"
import { ClickableImageInput } from "../imageInput";
// import { createDesktop, updateDesktopBackground } from "../../services/desktop";
// import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { useUser } from "../../context/AuthContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { createDesktopService, updateDesktopService } from "../../services/desktopServices";
import { CreateDesktopData } from "../../types/desktop";
import { useAppContext } from "../../context/AppContext";
import { set } from "zod";
import { getProxyStorageService, uploadStorageService } from "../../services/storageServices";
import { UploadStorageData } from "../../types/storage";

interface PersonalProps {
    onFinish: (boolean: true) => void;
}

type TypaBackground = 'upload' | 'url' | 'color'

type TypaDesktop = 'personal' | 'shared'

type colors = 'red' | 'blue' | 'black' | 'purple' | 'green' | 'orange'

export default function PersonalDesktopWindow({ onFinish }: PersonalProps) {
    const { setBlackScreen } = useAppContext()
    const { user, authLogoutUser, changeCurrentDesktop, hasDesktops } = useUser();
    const [start, setStart] = useState<boolean>(false)
    const [imageSelected, setImageSelected] = useState<File>()
    const [desktopName, setDesktopName] = useState<string | null>()
    const [loading, setLoading] = useState<boolean>(false)
    const [stage, setStage] = useState<number>(1)
    const [done, setDone] = useState<boolean>(false)
    const [done2, setDone2] = useState<boolean>(false)
    const [percentage, setPercentage] = useState<number>(0)
    const [typaBackground, setTypaBackground] = useState<TypaBackground>('upload')
    const [typaDesktop, setTypaDesktop] = useState<TypaDesktop>('personal')
    const [colorSelected, setColorSelected] = useState<colors>('red')
    const [backgroundUrl, setBackgroundUrl] = useState<string>('')


    const nextStage = useCallback(() => {
        if (stage != 3) {
            setStage(prev => prev + 1)
        }

    }, [stage])

    const previousStage = useCallback(() => {
        if (stage != 1) {
            setStage(prev => prev - 1)
        }

    }, [stage])

    const isStage2ButtonAvailable = useCallback(() => {
        if (stage != 2) return false;

        if (typaBackground === `upload`) {
            if (imageSelected) {
                return true
            } else return false
        } else if (typaBackground === 'url') {
            if (backgroundUrl != '') {
                return true
            } else return false
        } else {
            return true
        }
    }, [typaBackground, stage, imageSelected, backgroundUrl])

    const isNextArrowAvailable = useCallback(() => {
        if (stage === 3) return false;

        if (stage === 2) {
            if (typaBackground === `upload`) {
                if (imageSelected) {
                    return true
                } else return false
            } else if (typaBackground === 'url') {
                if (backgroundUrl != '') {
                    return true
                } else return false
            } else {
                return true
            }
        } else {
            if (!desktopName) {
                return false
            } else return true
        }


    }, [typaBackground, stage, imageSelected, backgroundUrl, desktopName])

    useEffect(() => {
        if (!hasDesktops) {
            setBlackScreen(false)
        }
        if (user) {
            setStart(true)
        }
    }, [hasDesktops])


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

            switch (typaBackground) {
                case 'url':
                    wallpaperUrl = backgroundUrl
                    break;
                case 'color':
                    wallpaperUrl = `assets/colors/default_${colorSelected}.png`
                    break;
            }

            switch (typaDesktop) {
                case 'personal':
                    typeOfDesktop = 'personal'
                    break;
                case 'shared':
                    typeOfDesktop = 'shared'
                    break;
            }

            setPercentage(prev => (prev + 33.3))

            let newDesktop = await createDesktopService({
                name: desktopName,
                backgroundImage: wallpaperUrl,
                desktopType: typeOfDesktop as TypaDesktop,
                members: [user.id]
            } as CreateDesktopData)

            if (typaBackground === 'upload') {
                path = await handleUpload({ file: imageSelected, typeOfUpload: 'desktop', desktopId: newDesktop.id } as UploadStorageData)
                wallpaperUrl = path

                newDesktop = await updateDesktopService(newDesktop.id, { name: newDesktop.name, backgroundImage: wallpaperUrl, })
            }

            setPercentage(prev => (prev + 33.3))

            changeCurrentDesktop(newDesktop)

            setPercentage(prev => (prev + 33.4))

            setTimeout(() => {
                setDone(true)
                setBlackScreen(false)
                setTimeout(() => {
                    setDone2(true)
                    setTimeout(() => {
                        onFinish(true)
                    }, 1000)
                }, 2000)
            }, 1000)
        } catch (err) {
            console.log('Erro ao criar: ', err)
            setLoading(false)
        }
    }


    return (
        <div
            className={`${done2 ? '' : 'bg-zinc-950'} ${hasDesktops ? 'opacity-0' : ''} transition-all absolute z-200 w-full min-h-screen flex justify-center items-center p-8`}>
            <div className={`${done2 ? 'opacity-0 pointer-events-none' : done ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-all duration-500 
            absolute z-200 bg-zinc-950 w-full min-h-screen flex justify-center items-center p-4`}>
                <h1 className={`${done ? 'opacity-100 mt-0' : 'opacity-0 mt-7'} transition-all duration-700 text-[40px] text-center`}>Tudo pronto. <br /> Aproveite :)</h1>
            </div>
            <p className="absolute md:opacity-100 opacity-0 right-10 top-10 text-lg control-text">Control</p>

            <div className={`${start ? 'opacity-0' : 'opacity-100'} bg-black transtion-all duration-500 pointer-events-none fixed z-50 flex 
            flex-col justify-center items-center w-full min-h-screen`}>
                <p className={`control-text text-[50px] mt-17.5`}>Control</p>
                <DotLottieReact
                    src="assets/images/loader.lottie"
                    className="w-20 p-0"
                    loop
                    autoplay
                />
                <p className={`opacity-80 control-text text-[20px] transition-all `}>(Se essa tela persistir, recarregue a página)</p>
            </div>

            <div className={`${done2 ? 'opacity-0' : ''}
             min-h-screen w-full fixed bg-cover bg-black/80 bg-center top-0 transition-all duration-1000 z-[-1] overflow-hidden brightness-75`}>

                <div className="aurora-container">
                    <div className="aurora-sphere aurora-1"></div>
                    <div className="aurora-sphere aurora-2"></div>
                    <div className="aurora-sphere aurora-3"></div>
                    <div className="aurora-sphere aurora-4"></div>
                </div>

            </div>

            {loading ?
                (<div className={`${done2 ? 'opacity-0' : ''} flex flex-col gap-2 items-center w-full max-w-[600px]`}>
                    <DotLottieReact
                        src="assets/images/loader.lottie"
                        className="w-26 p-0"
                        loop
                        autoplay
                    />
                    <h1 className="text-[30px] text-center">Seu desktop está sendo feito...</h1>
                    <div className="mt-2 w-full h-2 bg-black rounded-md overflow-hidden relative">
                        <div style={{ width: `${percentage}%` }} className={`absolute h-full transition-all duration-150 bg-rose-400`}>
                        </div>
                    </div>
                </div>)
                :
                (<div className="flex flex-col items-center w-full max-w-[1000px] gap-8 select-none">

                    <div className="flex flex-row items-center gap-3 p-3 bg-linear-to-b from-white/9 to-white/1 absolute top-5 left-5 md:scale-100 scale-80 origin-top-left
                    backdrop-blur-md rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.3)]">
                        <img src={`${user?.profileImage || "/assets/images/profile.png"}`} className="rounded-full w-11 h-11" />
                        <div className="flex flex-col justify-center">
                            <h1 className="text-[18px]">{user?.name as string}</h1>
                            <h1 className="text-[16px] opacity-80">{user?.email as string}</h1>
                        </div>
                        <button onClick={authLogoutUser} className="flex flex-row gap-2 items-center ml-1 mt-1 text-[18px] 
                                    p-2 border-[1.5px] border-white/50 cursor-pointer rounded-md bg-zinc-950/50 text-white transition-all hover:border-red-500 hover:text-red-500">
                            <LogOut size={18} />
                        </button>
                    </div>

                    <div className="w-full gap-3 flex flex-row items-center md:mt-0 mt-16">

                        <ChevronLeft onClick={previousStage} size={40} className={`${stage === 1 ? 'saturate-0 opacity-50 pointer-events-none' : ''} p-1 rounded-full 
                        bg-zinc-200/10 transition-all cursor-pointer hover:text-rose-400 hover:bg-zinc-200/20`} />

                        <div className={`${stage === 1 ? 'bg-rose-400' : 'bg-zinc-700'} flex-1 h-1 transition-all rounded-full`}></div>
                        <div className={`${stage === 2 ? 'bg-rose-400' : 'bg-zinc-700'} flex-1 h-1 transition-all rounded-full`}></div>
                        <div className={`${stage === 3 ? 'bg-rose-400' : 'bg-zinc-700'} flex-1 h-1 transition-all rounded-full`}></div>

                        <ChevronRight onClick={nextStage} size={40} className={`${!isNextArrowAvailable() ? 'saturate-0 opacity-50 pointer-events-none' : ''} p-1 rounded-full 
                        bg-zinc-200/10 transition-all cursor-pointer hover:text-rose-400 hover:bg-zinc-200/20`} />

                    </div>

                    <h1 className={`${stage === 1 ? '' : 'opacity-0 pointer-events-none z-0'} transition-all md:text-[55px] text-[41px] gap-1 text-center`}>
                        Crie seu primeiro <p className="text-rose-400 mt-[-10px]">Desktop</p>
                    </h1>

                    <div className={`${stage === 1 ? '' : 'opacity-0 pointer-events-none z-0'} flex flex-col gap-1 w-full max-w-[600px] transition-all`}>
                        <p className="md:text-2xl text-lg">Qual será o nome do desktop?</p>
                        <input type="text" onChange={(e) => setDesktopName(e.target.value)} className="border-b-1 border-zinc-400 outline-none transition-all text-xl 
                                cursor-pointer focus:cursor-text p-1 px-2 focus:border-rose-400 focus:bg-zinc-700/40 w-full " />
                    </div>

                    <button onClick={nextStage} disabled={!desktopName || stage != 1} className={`${stage === 1 ? 'z-10' : 'opacity-0 pointer-events-none z-0'} ${!desktopName ? 'pointer-events-none saturate-0 opacity-40' : ''}
                    bg-rose-600 border-none text-xl p-2 px-6 font-medium cursor-pointer rounded-sm transition-all hover:bg-rose-400 hover:scale-105`}>
                        Continuar
                    </button>


                    {/* ESTAGIO 2 */}

                    <h1 className={`${stage === 2 ? '' : 'opacity-0 pointer-events-none z-0'} transition-all md:text-[55px] text-[41px] gap-1 text-center md:mt-[-368px] mt-[-328px]`}>
                        Escolha o<p className={`text-rose-400 mt-[-10px]`}>Plano de Fundo</p>
                    </h1>

                    <div className={`${stage === 2 ? '' : 'opacity-0 pointer-events-none z-0'} flex flex-row gap-3 w-full max-w-[800px] transition-all`}>
                        <div onClick={() => setTypaBackground('upload')} className={`${typaBackground === 'upload' ? 'bg-rose-500' : 'bg-zinc-900 hover:bg-zinc-950/80'} p-2 flex-1 hover:scale-105
                        rounded-md text-center cursor-pointer transition-all text-lg shadow-2xl`}>
                            Upload
                        </div>
                        <div onClick={() => setTypaBackground('url')} className={`${typaBackground === 'url' ? 'bg-rose-500' : 'bg-zinc-900 hover:bg-zinc-950/80'} p-2 flex-1 hover:scale-105
                        rounded-md text-center cursor-pointer transition-all text-lg shadow-2xl`}>
                            URL
                        </div>
                        <div onClick={() => setTypaBackground('color')} className={`${typaBackground === 'color' ? 'bg-rose-500' : 'bg-zinc-900 hover:bg-zinc-950/80'} p-2 flex-1 hover:scale-105
                        rounded-md text-center cursor-pointer transition-all text-lg shadow-2xl`}>
                            Cor Fixa
                        </div>
                    </div>

                    <div className={`${(stage === 2 && typaBackground === 'upload') ? imageSelected ? 'h-50' : 'h-18' : 'opacity-0 pointer-events-none z-0 h-0'} flex flex-col gap-2 w-full max-w-[400px] 
                    items-center transition-all overflow-hidden mt-4 `}>
                        <ClickableImageInput onFileSelected={(file) => {
                            setImageSelected(file)
                        }} />
                    </div>

                    <div className={`${(stage === 2 && typaBackground === 'url') ? 'h-20' : 'opacity-0 pointer-events-none z-0 h-0'} flex flex-col gap-1 w-full max-w-[600px] transition-all overflow-hidden mt-[-40px]`}>
                        <p className="text-xl">URL da imagem</p>
                        <input type="text" onChange={(e) => setBackgroundUrl(e.target.value)} className="border-b-1 border-zinc-400 outline-none transition-all text-xl 
                                cursor-pointer focus:cursor-text p-1 px-2 focus:border-rose-400 focus:bg-zinc-700/40 w-full " />
                    </div>

                    <div className={`${(stage === 2 && typaBackground === 'color') ? 'h-20' : 'opacity-0 pointer-events-none z-0 h-0'} flex flex-row gap-3 transition-all items-center mt-[-40px] justify-center`}>
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




                    <div className="flex flex-row gap-3">
                        <button onClick={previousStage} disabled={stage != 2} className={`${stage === 2 ? 'z-10' : 'opacity-0 pointer-events-none z-0'}
                    bg-zinc-600 border-none text-xl p-2 px-6 font-medium cursor-pointer rounded-sm transition-all hover:bg-zinc-500 w-35 hover:scale-105`}>
                            Voltar
                        </button>
                        <button onClick={nextStage} disabled={stage != 2} className={`${stage === 2 ? !isStage2ButtonAvailable() ? 'pointer-events-none saturate-0 opacity-40' : 'z-10' : 'opacity-0 pointer-events-none z-0'}
                    bg-rose-600 border-none text-xl p-2 px-6 font-medium cursor-pointer rounded-sm transition-all hover:bg-rose-400 hover:scale-105`}>
                            Continuar
                        </button>
                    </div>




                    {/* estagio 3 */}

                    <h1 className={`${stage === 3 ? '' : 'opacity-0 pointer-events-none z-0'} transition-all md:text-[55px] text-[41px]/[40px] gap-1 text-center md:mt-[-368px] mt-[-328px] flex flex-wrap justify-center items-center 
                    gap-3`}>
                        Qual será o <p className="text-rose-400">Tipo</p> de Desktop?
                    </h1>

                    <div className={`${stage === 3 ? '' : 'opacity-0 pointer-events-none z-0'} flex flex-row gap-3 w-full max-w-[800px] transition-all`}>
                        <div onClick={() => setTypaDesktop('personal')} className={`${typaDesktop === 'personal' ? 'bg-rose-500' : 'bg-zinc-900 hover:bg-zinc-950/80'} p-2 flex-1 
                        rounded-md text-center cursor-pointer transition-all text-lg shadow-2xl hover:scale-105`}>
                            Pessoal
                        </div>
                        <div onClick={() => setTypaDesktop('shared')} className={`${typaDesktop === 'shared' ? 'bg-rose-500' : 'bg-zinc-900 hover:bg-zinc-950/80'} p-2 flex-1 
                        rounded-md text-center cursor-pointer transition-all text-lg shadow-2xl hover:scale-105`}>
                            Compartilhado
                        </div>
                    </div>

                    <p className={`${(typaDesktop === 'personal' && stage === 3) ? '' : 'opacity-0 pointer-events-none z-[-1]'} text-xl transition-all md:mt-2 mt-0 text-center`}>
                        Um desktop apenas para você.</p>

                    <p className={`${(typaDesktop === 'shared' && stage === 3) ? '' : 'opacity-0 pointer-events-none z-[-1] h-0'} text-xl transition-all mt-[-60px] text-center`}>
                        Um desktop para você e outras pessoas, com arquivos compartilhados.</p>

                    <p className={`${stage === 3 ? 'opacity-60' : 'opacity-0'} md:text-xl text-base transition-all`}>(Você pode mudar isso depois)</p>

                    <div className="flex flex-row gap-3">
                        <button onClick={previousStage} disabled={stage != 3} className={`${stage === 3 ? 'z-10' : 'opacity-0 pointer-events-none z-0'}
                    bg-zinc-600 border-none md:text-xl text-lg p-2 md:px-6 md:w-auto w-40 font-medium cursor-pointer rounded-sm transition-all hover:bg-zinc-500 w-42 hover:scale-105`}>
                            Voltar
                        </button>
                        <button onClick={handleSubmit} disabled={stage != 3} className={`${stage === 3 ? !colorSelected ? 'pointer-events-none saturate-0 opacity-40' : '' : 'opacity-0 pointer-events-none z-0'}
                    bg-rose-600 border-none md:text-xl text-lg p-2 md:px-6 md:w-auto w-40 font-medium cursor-pointer rounded-sm transition-all hover:bg-rose-400 hover:scale-105`}>
                            Criar Desktop
                        </button>
                    </div>


                </div>)}

        </div >
    )
}


