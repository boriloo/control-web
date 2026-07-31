import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import DashboardPage from "../dashboard/page";
import { useUser } from "../../context/AuthContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AuthPage from "../auth/page";
import EmailSentPage from "../email/page";
import { useEffect, useState } from "react";
import PlansPage from "../plans/page";
import AuthCallbackPage from "../auth/callback";
import ForgotPasswordPage from "../auth/forgot-password";
import ResetPasswordPage from "../auth/reset-password";

const phrases = [
    "Control",
    "Organizando arquivos...",
    "Carregando imagens...",
    "Vasculhando pastas...",
];

const LoadingScreen = () => {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                setFade(true);
            }, 700);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`bg-black transition-all duration-500 pointer-events-none fixed z-50 flex flex-col justify-center items-center w-full min-h-screen`}>
            <p className={`text-[50px] text-end transition-all duration-500 select-none control-text mt-10
                    ${fade ? 'opacity-100 right-15' : 'opacity-0 right-12'}`}>
                {phrases[currentPhraseIndex]}
            </p>
            <DotLottieReact
                src="assets/images/loader.lottie"
                className="w-20 p-0"
                loop
                autoplay
            />
        </div>
    );
};

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-black w-full min-h-screen flex flex-col justify-center items-center gap-6 select-none">
            <p className="control-text text-[120px] leading-none opacity-20">404</p>
            <div className="flex flex-col items-center gap-2">
                <p className="text-white text-2xl font-light">Página não encontrada</p>
                <p className="text-white/40 text-base">O endereço que você acessou não existe.</p>
            </div>
            <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2.5 border border-white/20 rounded-lg text-white/70 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all cursor-pointer text-sm">
                Voltar ao início
            </button>
        </div>
    );
};

export default function PageRouter() {
    const { isAuthenticated, isLoading } = useUser();

    return (
        <BrowserRouter>
            {isLoading ? (
                <LoadingScreen />
            ) : (
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <Navigate to='/auth' replace />}
                    />
                    <Route
                        path="/auth"
                        element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <AuthPage />}
                    />
                    <Route
                        path="/email-sent"
                        element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <EmailSentPage />}
                    />
                    <Route
                        path="/dashboard"
                        element={isAuthenticated ? <DashboardPage /> : <Navigate to='/auth' replace />}
                    />
                    <Route
                        path="/plans"
                        element={isAuthenticated ? <PlansPage /> : <Navigate to='/auth' replace />}
                    />

                    <Route
                        path="/auth/callback"
                        element={isAuthenticated ? <Navigate to='/dashboard' replace /> : <AuthCallbackPage />}
                    />

                    <Route
                        path="/auth/forgot-password"
                        element={<ForgotPasswordPage />}
                    />

                    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            )}
        </BrowserRouter>
    );
}