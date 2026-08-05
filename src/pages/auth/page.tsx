import { useEffect, useState } from "react"
import { Eye, EyeOff, Check } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
// import { FirebaseError } from "firebase/app";
import '../../App.css'
import { useUser } from "../../context/AuthContext";
import { LoginData } from "../../types/auth";
import { authGoogleLoginService } from "../../services/authServices";
import { useRootContext } from "../../context/RootContext";

const loginSchema = z.object({
    email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
    password: z.string()
        .min(8, { message: "A senha deve ter no mínimo 8 caracteres." })
        .regex(/[A-Z]/, { message: "Deve conter pelo menos uma letra maiúscula." })
        .regex(/[a-z]/, { message: "Deve conter pelo menos uma letra minúscula." })
        .regex(/[0-9]/, { message: "Deve conter pelo menos um número." })
        .regex(/[^a-zA-Z0-9]/, { message: "Deve conter pelo menos um caractere especial." }),
});

const registerSchema = z.object({
    name: z.string().min(3, { message: "O nome precisa ter no mínimo 3 caracteres." }),
    email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
    password: z.string()
        .min(8, { message: "A senha deve ter no mínimo 8 caracteres." })
        .regex(/[A-Z]/, { message: "Deve conter pelo menos uma letra maiúscula." })
        .regex(/[a-z]/, { message: "Deve conter pelo menos uma letra minúscula." })
        .regex(/[0-9]/, { message: "Deve conter pelo menos um número." })
        .regex(/[^a-zA-Z0-9]/, { message: "Deve conter pelo menos um caractere especial." }),
    confirmPassword: z.string()
}).refine((data: any) => data.password === data.confirmPassword, {
    path: ['password'],
    message: 'As senhas não coincidem',
});


type FormData = z.infer<typeof loginSchema> | z.infer<typeof registerSchema>;

export default function AuthPage() {
    const { authLoginUser, authRegisterUser, changeUser } = useUser();
    const { isMobile } = useRootContext();
    const navigate = useNavigate();
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [seePass, setSeePass] = useState<boolean>(false);
    const [sent, setSent] = useState<boolean>(false);
    const [loginForm, setLoginForm] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null)
    const [approved, setApproved] = useState<boolean>(true)
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [fade, setFade] = useState(true);

    const phrases = [
        "Domine seu fluxo de trabalho de ponta a ponta",
        "Transforme ideias complexas em projetos organizados",
        "Centralize sua produtividade em um único lugar",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);

            setTimeout(() => {
                setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                setFade(true);
            }, 700);

        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setTimeout(() => { setApproved(false) }, 100);
    }, []);

    const { register, handleSubmit, formState: { errors }, clearErrors } = useForm<FormData>({
        resolver: zodResolver(loginForm ? loginSchema : registerSchema),
        mode: "all"
    });

    useEffect(() => {
        clearErrors();
    }, [loginForm, clearErrors]);

    const handleFormSubmit = async (data: FormData) => {
        if (loginForm) {
            try {
                setError(null);
                setSent(true);
                const loginData = data as z.infer<typeof loginSchema>
                await authLoginUser({ email: loginData.email, password: loginData.password, rememberMe } as LoginData);
                setApproved(true)
            } catch (error: any) {
                if (error.response.data.error === 'Invalid email or password.') setError('Dados Inválidos')
                setSent(false)
            }
        } else {
            try {
                setError(null);
                setSent(true);
                const registerData = data as z.infer<typeof registerSchema>
                await authRegisterUser({
                    name: registerData.name, email: registerData.email, password: registerData.password,
                });


                await authLoginUser({ email: registerData.email, password: registerData.password, rememberMe: false } as LoginData);
            } catch (error: any) {
                if (error.response.data.error === 'User already exists.') setError('Usuário já existente')
                setSent(false)

            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await authGoogleLoginService()
        } catch (err) {
            console.error('Erro ao iniciar login com Google:', err)
        }
    }


    return (
        <>
            <div className={`${approved ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 pointer-events-none fixed z-50 flex justify-center items-center w-full min-h-screen bg-black`}>
                <p className={` control-text text-[50px] `}>Control</p>
            </div>
            <p className="absolute right-10 top-10 text-lg control-text">Control</p>
            {!isMobile && (
                <p style={{
                    color: 'transparent',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    backgroundImage: 'linear-gradient(to right, #f1deff, #faded4, #f1deff)',

                    backgroundSize: '200% auto',

                    animation: 'gradient-x 15s linear infinite'
                }}

                    className={`absolute self-center text-[4vi]/[5.5vi] w-[47vi] text-end transition-all duration-500 select-none
                ${fade ? 'opacity-100 right-15' : 'opacity-0 right-12'}`}>
                    {phrases[currentPhraseIndex]}
                </p>
            )}

            <div className={`${approved ? 'scale-101 brightness-0' : 'scale-125'} 
             min-h-screen w-full fixed bg-cover bg-center transition-all duration-1000 z-[-1] overflow-hidden brightness-75`}>

                <div className="aurora-container">
                    <div className="aurora-sphere aurora-1"></div>
                    <div className="aurora-sphere aurora-2"></div>
                    <div className="aurora-sphere aurora-3"></div>
                    <div className="aurora-sphere aurora-4"></div>
                </div>

            </div>
            <div className="flex justify-start items-center md:p-8 p-0 w-full min-h-screen">
                <div className={`${approved ? 'opacity-0' : 'opacity-100'} max-w-[650px] md:p-8 p-4 md:py-10 py-6 transition-all duration-500 select-none flex flex-col 
                items-center w-full h-full bg-linear-to-b from-white/9 to-white/1 backdrop-blur-md md:rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.3)]`}>

                    <img src="assets/images/logo.png" className="w-18"></img>
                    <h1 className={`${error ? 'text-red-400 p-1 px-2 bg-red-700/20' : ''} rounded-md mt-2 transition-all text-[35px]`}>{error ? error : loginForm ? 'Entrar com e-mail' : 'Crie sua conta'}</h1>
                    <form className="w-full mt-6 flex flex-col gap-4 items-start" id="loginForm" onSubmit={handleSubmit(handleFormSubmit)}>

                        <input {...register("name")} type="text" name="name" placeholder="Nome"
                            className={`${!loginForm ? 'h-12.5 py-3' : 'opacity-0 h-0 py-0 mt-[-8px]'} px-4 w-full placeholder-white/80 rounded-md bg-black/30 text-white overflow-hidden transition-all
                         hover:bg-black/40 transition-all outline-1 outline-transparent duration-400 cursor-pointer focus:cursor-text focus:bg-black/50 focus:outline-rose-300`} />


                        <input {...register("email")} type="email" name="email" placeholder="E-mail"
                            className="w-full p-3 px-4 placeholder-white/80 rounded-md bg-black/40 text-white hover:bg-black/50 transition-all outline-1 outline-transparent duration-400 
                    cursor-pointer focus:cursor-text focus:bg-black/50 focus:outline-rose-300" />
                        <p className={`${errors.email?.message ? 'p-1 px-3' : 'opacity-0 mt-[-10px] '} text-red-500 bg-red-700/10  rounded-sm text-[15px] transition-all`}>{errors.email?.message}</p>
                        <div className="relative w-full">
                            <input {...register("password")} type={`${seePass ? 'text' : 'password'}`} name="password" placeholder="Senha"
                                className="w-full p-3 px-4 placeholder-white/80 rounded-md bg-black/40 text-white hover:bg-black/50 transition-all 
                            outline-1 outline-transparent duration-400 cursor-pointer focus:cursor-text focus:bg-black/50 focus:outline-rose-300" />
                            {!seePass ?
                                (<Eye onClick={() => setSeePass(true)} className="absolute top-2 text-rose-300 cursor-pointer right-2 rounded-sm w-8 h-8 p-1 transition-all hover:bg-rose-400 hover:text-white" />)
                                :
                                (<EyeOff onClick={() => setSeePass(false)} className="absolute top-2 text-rose-300 cursor-pointer right-2 rounded-sm w-8 h-8 p-1 transition-all hover:bg-rose-400 hover:text-white" />)}
                        </div>
                        <p className={`${errors.password?.message ? 'p-1 px-3' : 'opacity-0 mt-[-10px] '} text-red-500 bg-red-700/10  rounded-sm text-[15px] transition-all`}>{errors.password?.message}</p>

                        <input {...register("confirmPassword")} type={`${seePass ? 'text' : 'password'}`} name="confirmPassword" placeholder="Confirmar Senha"
                            className={`${!loginForm ? 'h-12.5 py-3' : 'opacity-0 h-0 py-0 mt-[-8px]'} px-4 w-full placeholder-white/80 rounded-md bg-black/30 text-white hover:bg-black/40 
                        transition-all outline-1 outline-transparent duration-400 cursor-pointer focus:cursor-text focus:bg-black/50 focus:outline-rose-300`} />


                        <div className={`${loginForm ? 'md:h-10 h-20 opacity-100' : 'opacity-0 h-0'} transition-all select-none 
                        flex flex-row md:justify-between w-full gap-2 flex-wrap items-center`}>
                            <div className={`${rememberMe ? 'hover:bg-rose-800/25' : 'hover:bg-zinc-200/15'} flex flex-row gap-2 p-1 px-2 rounded-md transition-all items-center cursor-pointer `} onClick={() => setRememberMe(!rememberMe)}>
                                <div className={`w-5 h-5 rounded-sm flex justify-center items-center border-[1px] transition-all ${rememberMe ? 'border-rose-500 bg-rose-500' : 'border-white'} `}>
                                    {rememberMe && (
                                        <Check className="w-full" />
                                    )}
                                </div>
                                <p className={`${rememberMe ? 'text-rose-400' : 'text-white'} transition-all`}>Lembrar de mim</p>
                            </div>
                            <button disabled={sent} onClick={() => navigate('/auth/forgot-password')} className="text-rose-400 font-medium text-md cursor-pointer 
                            p-1 px-2 transition-all hover:bg-rose-500/20 rounded-lg md:ml-0 ml-auto">
                                Esqueci minha senha
                            </button>
                        </div>


                        <button type="submit"
                            disabled={sent}
                            className={`${loginForm ? '' : 'mt-4'} ${sent ? 'opacity-50' : 'cursor-pointer'} flex justify-center items-center hover:bg-rose-600
                            overflow-hidden p-6.5 w-full max-h-10 self-center bg-linear-to-b bg-black from-black/50 to-zinc-800/50 shadow-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.28),0_2px_4px_rgba(0,0,0,0.5)]
                             text-white font-medium rounded-3xl text-xl transition-all duration-250 hover:scale-101`}>
                            {sent ? (<DotLottieReact
                                src="assets/images/loader.lottie"
                                className="w-26 p-0"
                                loop
                                autoplay
                            />) : loginForm ? 'Entrar' : 'Criar conta'}
                        </button>
                    </form>

                    {/* <div className="flex w-full justify-center items-center mt-4">
                    <p className={`${error ? 'p-1 px-3' : 'opacity-0 mt-[-10px] '} text-red-500 bg-red-700/10  rounded-sm text-[18px] font-medium transition-all`}>{error}</p>
                </div> */}

                    <button disabled={sent} onClick={() => { setLoginForm(!loginForm); setError('') }}
                        className={`${sent ? 'opacity-50' : 'cursor-pointer hover:bg-rose-400/20'} underline text-rose-400 font-medium mt-5 text-md  p-1 px-2 transition-all  rounded-lg`}>
                        {loginForm ? 'Não possui uma conta?' : 'Já possui uma conta?'}
                    </button>

                    <div className="bg-white/50 w-full h-[1px] mt-8 mb-8"></div>

                    <div onClick={handleGoogleLogin} className="flex flex-col gap-2 w-full items-center">
                        <p className="text-lg">Entrar com</p>
                        <button className="cursor-pointer p-3 w-full flex justify-center items-center max-w-[300px] bg-zinc-800 text-white font-bold rounded-lg hover:bg-white
                        mt-2 hover:scale-102 transition-all">
                            <img src="/assets/images/google.png" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

        </>
    )
}