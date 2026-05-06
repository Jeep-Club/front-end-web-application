'use client';

import { Menu, LogOut } from 'lucide-react';
import { Logo } from '@/components/common/logo';
import logoutAction from '@/actions/logout';

export default function Header() {

    const handleLogout = async () => {
        await logoutAction();
        window.location.href = '/';
    };

    return (
        <header className="
            w-full
            bg-white/90
            backdrop-blur-md
            border-b
            border-gray-200
            px-6
            lg:px-12
            py-4
            flex
            items-center
            justify-between
            sticky
            top-0
            z-50
        ">

            {/* LEFT */}
            <div className="flex items-center gap-3">
                <Logo className="w-10 h-10" />

                <div className="flex flex-col leading-none">
                    <span className="text-xs text-gray-400 uppercase tracking-[0.2em]">
                        Desde 1999
                    </span>

                    <span className="text-sm font-semibold text-black">
                        Jeep Club Tamoios
                    </span>
                </div>
            </div>

            {/* NAV */}
            <nav className="hidden md:flex items-center gap-10">
                <button className="text-blue-700 font-semibold border-b-2 border-blue-700 pb-1">
                    Eventos
                </button>

                <button className="text-gray-600 hover:text-black transition-colors">
                    Avisos
                </button>

                <button className="text-gray-600 hover:text-black transition-colors">
                    Perfil
                </button>
            </nav>

            {/* RIGHT */}
            <div className="flex items-center gap-4">

                <button
                    onClick={handleLogout}
                    className="
                        hidden
                        sm:flex
                        items-center
                        gap-2
                        text-sm
                        text-red-500
                        hover:text-red-600
                        transition-colors
                        font-medium
                    "
                >
                    <LogOut size={18} />
                    Sair
                </button>

                <button className="text-blue-700">
                    <Menu size={22} />
                </button>

            </div>
        </header>
    );
}