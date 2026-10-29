"use client";

import { AvatarMenu } from "@/components/common/layout-admin/AvatarMenu";
import { NotificationBell } from "@/components/common/layout-admin/NotificationBell";
import { getUserProfileAction } from "@/server/actions/profile/get";
import { useQuery } from "@tanstack/react-query";
import { Menu,PanelLeftClose,PanelLeftOpen } from "lucide-react";

interface TopbarProps {
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    onOpenMobileMenu: () => void;
    fullName: string;
    initialProfilePhotoUrl?: string | null;
}

export default function Topbar({ isSidebarCollapsed, onToggleSidebar, onOpenMobileMenu, fullName, initialProfilePhotoUrl }: TopbarProps) {
    const { data: profile } = useQuery({
        queryKey: ["profile", "me"],
        queryFn: getUserProfileAction,
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: false,
    });
    const displayName = profile?.name ?? fullName;
    const profilePhotoUrl = profile ? profile.profilePhotoUrl : initialProfilePhotoUrl;

    return (
        <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center justify-between bg-j-blue-800 pl-2 pr-4 text-j-white shadow-md md:pl-4 md:pr-8">
            <button
                type="button"
                id="tour-mobile-menu-btn"
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

            <div id="tour-avatar-menu" className="flex items-center gap-3">
                <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800">Precisa de ajuda?</span>
                <NotificationBell />
                <span className="h-8 w-px bg-j-transparent-white" />
                <span className="hidden text-sm font-bold text-j-white md:inline">{displayName}</span>
                <AvatarMenu src={profilePhotoUrl} fullName={displayName} />
            </div>
        </header>
    );
}
