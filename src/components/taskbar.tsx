import { useAppContext } from "../context/AppContext";
import { useUser } from "../context/AuthContext";
import { useWindowContext } from "../context/WindowContext";


export default function TaskBar() {
    const { profile, config, social } = useWindowContext();
    const { minimazeAllWindows } = useAppContext();
    const { user } = useUser();

    return (
        <div className="max-h-11 z-100 fixed bottom-0 flex flex-row justify-center items-center gap-2 h-11 w-full backdrop-blur-sm bg-black/60 
        overflow-hidden transition-all duration-600 select-none">

            <img onClick={() => {
                minimazeAllWindows()
                config.openWindow()
            }} src="/assets/images/settings.png" alt="profile" className=" p-2 w-11 transition-all cursor-pointer hover:bg-zinc-500/30" />

            <div onClick={() => {
                minimazeAllWindows()
                profile.openWindow()
            }} className="p-[7px] w-11 h-full transition-all cursor-pointer hover:bg-zinc-500/30">
                <div style={{ backgroundImage: `url(${user?.profileImage ? user.profileImage : '/assets/images/profile.png'})`, backgroundSize: 'cover  ' }} 
                className="w-full h-full rounded-full" />
            </div>

            {/* VERSAO LANCAMENTO */}

            <img onClick={() => {
                minimazeAllWindows()
                social.openWindow()
            }} src="/assets/images/users.png" alt="users" className=" p-1.5 w-11 transition-all cursor-pointer hover:bg-zinc-500/30" />

            <img onClick={() => {
                minimazeAllWindows()
                social.openWindow()
            }} src="/assets/images/coffee.png" alt="users" className="p-[5px] w-11 transition-all cursor-pointer hover:bg-zinc-500/30" />

            <div onClick={minimazeAllWindows} className="p-2 hover:px-4 cursor-pointer absolute right-0 hover:bg-white/20 transition-all text-white">
                |
            </div>
        </div>
    )
}