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
        <div className="bg-black w-full min-h-screen flex flex-col justify-center items-center gap-4">
            <p className="text-white text-xl">Email enviado!</p>
            <p className="text-white/50 text-sm text-center max-w-xs">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
        </div>
    )

    return (
        <div className="bg-black w-full min-h-screen flex flex-col justify-center items-center gap-6">
            <div className="flex flex-col gap-1 items-center">
                <p className="text-white text-2xl">Esqueceu a senha?</p>
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
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:pointer-events-none text-white transition-all">
                    {loading ? 'Enviando...' : 'Enviar link'}
                </button>
            </div>
        </div>
    )
}