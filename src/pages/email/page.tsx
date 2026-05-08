import { useNavigate } from "react-router-dom";
import '../../App.css'


export default function EmailSentPage() {
    const navigate = useNavigate();

    return (
        <>

            <p className="absolute right-10 top-10 text-lg">Control</p>

            <div className={`
             min-h-screen w-full fixed bg-cover bg-center transition-all duration-1000 z-[-1] overflow-hidden brightness-75`}>

                <div className="aurora-container">
                    <div className="aurora-sphere aurora-1"></div>
                    <div className="aurora-sphere aurora-2"></div>
                    <div className="aurora-sphere aurora-3"></div>
                    <div className="aurora-sphere aurora-4"></div>
                </div>

            </div>
            <div className="flex justify-center items-center p-8 w-full min-h-screen">
                <div className={`max-w-[650px] p-8 py-10 transition-all duration-500 select-none flex flex-col  gap-4
                items-center w-full bg-linear-to-b from-white/9 to-white/1 backdrop-blur-md rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.3)]`}>


                    <h1 className="text-3xl">Email de confirmação enviado</h1>
                    <p className="text-center">Um email de confirmação foi enviado para o endereço da conta criada, <br></br>
                        clique no link enviado para sua caixa de entrada para ativar sua conta.</p>

                    <button
                        onClick={() => navigate('/auth')}
                        className={`flex justify-center items-center hover:bg-rose-500 cursor-pointer mt-4
                            overflow-hidden p-6.5 w-full max-w-90 max-h-10 self-center bg-linear-to-b bg-black from-black/50 to-zinc-800/50 shadow-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.28),0_2px_4px_rgba(0,0,0,0.5)]
                             text-white font-medium rounded-3xl text-xl transition-all`}>
                        Voltar para login
                    </button>
                </div>
            </div>

        </>
    )
}