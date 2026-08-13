// pages/auth/reset-password.tsx
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authResetPasswordService } from '../../services/authServices'

export default function ResetPasswordPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [done, setDone] = useState(false)

    useEffect(() => {
        const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash
        const params = new URLSearchParams(hash)
        const token = params.get('access_token')

        if (!token) {
            navigate('/auth')
            return
        }

        setAccessToken(token)
    }, [location, navigate])

    const handleSubmit = async () => {
        if (!password || !confirm || !accessToken) return
        if (password !== confirm) {
            setError('As senhas não coincidem.')
            return
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.')
            return
        }

        try {
            setLoading(true)
            setError(null)
            await authResetPasswordService(accessToken, password)
            setDone(true)
            setTimeout(() => navigate('/auth'), 2000)
        } catch (err: any) {
            setError('Link inválido ou expirado. Solicite um novo.')
        } finally {
            setLoading(false)
        }
    }

    if (done) return (
        <div className="bg-bg w-full min-h-screen flex flex-col justify-center items-center gap-4">

            <img src="/assets/images/logoContoruWhite.png" className="w-22 opacity-60 absolute left-6 top-6"></img>
            
            <p className="text-fg text-[34px] font-semibold font-fraunces">Senha redefinida!</p>
            <p className="text-white/50 text-sm">Redirecionando para o login...</p>
        </div>
    )

    return (
        <div className="bg-bg w-full min-h-screen flex flex-col justify-center items-center gap-6">

            <img src="/assets/images/logoContoruWhite.png" className="w-22 opacity-60 absolute left-6 top-6"></img>

            <div className="flex flex-col gap-1 items-center">
                <p className="text-fg text-[34px] font-semibold font-fraunces">Nova senha</p>
                <p className="text-white/50 text-sm">Escolha uma senha segura.</p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nova senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pr-16 text-white outline-none focus:border-white/30 transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-sm"
                    >
                        {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                </div>

                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirmar senha"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pr-16 text-white outline-none focus:border-white/30 transition-all"
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!password || !confirm || loading}
                    className="p-2 rounded-lg text-[18px] font-medium bg-main hover:bg-white hover:text-main disabled:opacity-50 
                    disabled:saturate-0 disabled:pointer-events-none text-white transition-all cursor-pointer">
                    {loading ? 'Salvando...' : 'Redefinir senha'}
                </button>
            </div>
        </div>
    )
}