// pages/terms.tsx
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-bg w-full min-h-screen flex flex-col items-center px-6 pt-24 pb-16 overflow-y-auto">

            <img
                onClick={() => navigate(-1)}
                src="/assets/images/logoContoruWhite.png"
                className="w-22 opacity-60 absolute left-6 top-6 cursor-pointer hover:opacity-100 transition-opacity"
                alt="Logo Contoru"
            />

            <div className="flex flex-col gap-6 w-full max-w-3xl text-white/60 text-[15px] leading-relaxed">

                <div className="flex flex-col gap-1 mb-4 border-b border-white/10 pb-6">
                    <h1 className="text-fg text-[34px] font-semibold font-fraunces">Termos de Uso</h1>
                    <p className="text-white/40 text-sm">Última atualização: Agosto de 2026</p>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-white text-[20px] font-medium font-fraunces">1. Aceitação dos Termos</h2>
                    <p>Ao acessar, cadastrar-se ou utilizar o Contoru, você concorda em cumprir estes Termos de Uso. Se não concordar, não utilize o serviço.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-white text-[20px] font-medium font-fraunces">2. Descrição do Serviço</h2>
                    <p>O Contoru é uma plataforma de espaço de trabalho virtual focada em organização visual. Atualmente, o serviço é fornecido de forma gratuita e em contínua evolução. Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer recurso sem aviso prévio.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-white text-[20px] font-medium font-fraunces">3. Conta e Segurança</h2>
                    <p>Você é responsável por manter a segurança da sua conta e credenciais de login. Qualquer atividade realizada sob sua conta é de sua inteira responsabilidade.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-white text-[20px] font-medium font-fraunces">4. Propriedade e Conteúdo do Usuário</h2>
                    <p>Você mantém todos os direitos sobre os arquivos, links e dados que adiciona ao Contoru. No entanto, é estritamente proibido utilizar a plataforma para armazenar ou compartilhar:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-1 mt-1">
                        <li>Conteúdo ilegal, difamatório, pornográfico ou que incite violência.</li>
                        <li>Materiais que violem direitos autorais de terceiros (pirataria).</li>
                        <li>Arquivos maliciosos (vírus, malware, etc.).</li>
                        <li>Scripts ou bots para abuso da API e do armazenamento (Cloudflare R2).</li>
                    </ul>
                    <p className="mt-1">O Contoru reserva-se o direito de excluir arquivos ou banir contas que violem estas diretrizes.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-white text-[20px] font-medium font-fraunces">5. Limitação de Responsabilidade</h2>
                    <p>O Contoru é fornecido "no estado em que se encontra" (as is). Por se tratar de um serviço em evolução, não garantimos 100% de disponibilidade de servidores (uptime) ou que o sistema seja livre de falhas. <strong className="text-white/80">O Contoru não se responsabiliza por qualquer perda de dados.</strong> É recomendável manter backups originais de arquivos importantes.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-white text-[20px] font-medium font-fraunces">6. Privacidade e LGPD</h2>
                    <p>Em conformidade com a LGPD, coletamos apenas os dados estritamente necessários para o funcionamento do serviço (nome e e-mail). Seus dados não são vendidos ou
                        compartilhados com terceiros. Você pode solicitar a exclusão definitiva da sua conta e de todos os seus arquivos a qualquer momento entrando em contato pelo e-mail de suporte.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-white text-[20px] font-medium font-fraunces">7. Alterações nos Termos</h2>
                    <p>Podemos atualizar estes Termos de Uso periodicamente. O uso contínuo da plataforma após as alterações constitui sua aceitação dos novos termos.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-white text-[20px] font-medium font-fraunces">8. Contato</h2>
                    <p>Para dúvidas, suporte ou para relatar violações, entre em contato através do e-mail: <span className="text-main font-medium">muriloomartins00@gmail.com</span>.</p>
                </div>

            </div>
        </div>
    )
}