import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "../dashboard/page";
import { useUser } from "../../context/AuthContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AuthPage from "../auth/page";
import EmailSentPage from "../email/page";
import { useEffect, useState } from "react";
import PlansPage from "../plans/page";

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
        <div
            className={`bg-black transition-all duration-500 pointer-events-none fixed z-50 flex flex-col justify-center items-center w-full min-h-screen`}>
            <p
                className={`text-[50px] text-end transition-all duration-500 select-none control-text mt-10
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
                </Routes>
            )}
        </BrowserRouter>
    );
}