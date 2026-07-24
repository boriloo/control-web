import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../context/AuthContext'
import { authSetRefreshService } from '../../services/authServices'


export default function AuthCallbackPage() {
    const navigate = useNavigate()
    const { authGoogleUser } = useUser()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // lê o hash uma vez no momento da montagem
                const hash = window.location.hash.startsWith('#')
                    ? window.location.hash.slice(1)
                    : window.location.search.slice(1)

                console.log('hash recebido:', hash.substring(0, 50))

                const params = new URLSearchParams(hash)
                const accessToken = params.get('access_token')
                const refreshToken = params.get('refresh_token')

                console.log('accessToken existe:', !!accessToken)
                console.log('refreshToken existe:', !!refreshToken)

                if (!accessToken) {
                    console.log('sem token, voltando para auth')
                    navigate('/auth')
                    return
                }

                if (refreshToken) {
                    await authSetRefreshService(refreshToken)
                }

                await authGoogleUser(accessToken, refreshToken ?? undefined)
                navigate('/dashboard')
            } catch (err) {
                console.error('Erro no callback:', err)
                navigate('/auth')
            }
        }

        handleCallback()
    }, [])

    return (
        <div className="bg-black w-full min-h-screen flex items-center justify-center">
            <p className="text-white opacity-60">Autenticando...</p>
        </div>
    )
}