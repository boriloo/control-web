// pages/auth/forgot-password.tsx
import { useState } from 'react'
import { authForgotPasswordService } from '../../services/authServices'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!email) return
        try {
            setLoading(true)
            setError(null)
            await authForgotPasswordService(email)
            setSent(true)
        } catch (err) {
            setError('Erro ao enviar email. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (sent) return (
        <div className="bg-bg w-full min-h-screen flex flex-col justify-center items-center gap-4">

            <img src="assets/images/logoContoruWhite.png" className="w-22 opacity-60 absolute left-6 top-6"></img>


            <p className="text-fg text-[34px] font-semibold font-fraunces">Email enviado!</p>
            <p className="text-white/50 text-sm text-center max-w-xs">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
        </div>
    )

    return (
        <div className="bg-bg w-full min-h-screen flex flex-col justify-center items-center gap-6">


            <img src="assets/images/logoContoruWhite.png" className="w-22 opacity-60 absolute left-6 top-6"></img>


            <div className="flex flex-col gap-1 items-center">
                <p className="text-fg text-[34px] font-semibold font-fraunces">Esqueceu a senha?</p>
                <p className="text-white/50 text-sm">Enviaremos um link para redefinir sua senha.</p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-sm">
                <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-white/30 transition-all"
                />

                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!email || loading}
                    className="p-2 rounded-lg text-[18px] font-medium bg-main hover:bg-white hover:text-main disabled:opacity-50 disabled:saturate-0 disabled:pointer-events-none text-white transition-all cursor-pointer">
                    {loading ? 'Enviando...' : 'Enviar link'}
                </button>
            </div>
        </div>
    )
}