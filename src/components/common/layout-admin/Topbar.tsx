'use client';

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AvatarMenu } from "@/components/common/layout-admin/AvatarMenu";
import { NotificationBell } from "@/components/common/layout-admin/NotificationBell";

// TODO: mock temporário até termos a foto de perfil real vindo do usuário logado
const MOCK_AVATAR_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYHFJZjyPYTtCbPoDLmFzwEl5rJTLrQHSlD_JsJReVg987HYXmzltLFpc&s=10";

interface TopbarProps {
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    onOpenMobileMenu: () => void;
    fullName: string;
}

export default function Topbar({ isSidebarCollapsed, onToggleSidebar, onOpenMobileMenu, fullName }: TopbarProps) {
    return (
        <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between bg-j-blue-800 pl-2 pr-4 md:pl-4 md:pr-8 text-j-white shadow-md">
            <button
                type="button"
                onClick={onOpenMobileMenu}
                title="Abrir menu lateral"
                className="-ml-1 flex cursor-pointer items-center justify-center rounded-lg p-2 text-j-white transition-colors hover:bg-j-blue-700 hover:text-j-yellow-300 active:bg-j-blue-700 md:hidden"
            >
                <Menu size={22} />
            </button>

            <button
                type="button"
                onClick={onToggleSidebar}
                title={isSidebarCollapsed ? "Expandir menu" : "Ocultar menu"}
                className="hidden cursor-pointer items-center gap-2 text-j-white transition-colors hover:text-j-yellow-300 md:flex"
            >
                {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                <span className="text-xs font-semibold uppercase tracking-wider">
                    {isSidebarCollapsed ? "Expandir menu" : "Ocultar menu"}
                </span>
            </button>

            <div className="flex items-center gap-3">
                <NotificationBell />

                <span className="h-8 w-px bg-j-transparent-white" />

                <div className="hidden flex-col leading-tight md:flex">
                    <span className="text-sm font-bold text-j-white">{fullName}</span>
                </div>

                <AvatarMenu src={MOCK_AVATAR_URL} />
            </div>
        </header>
    );
}
