"use client";

import { useContext } from "react";
import { TourContext } from "@/components/common/tour/TourContext";
import { Avatar } from "@/components/common/avatar";
import { getUserProfileAction } from "@/server/actions/profile/get";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Menu,PanelLeftClose,PanelLeftOpen } from "lucide-react";
import NotificationBell from "@/components/common/layout-admin/NotificationBell";

interface TopbarProps {
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    onOpenMobileMenu: () => void;
    fullName: string;
    initialProfilePhotoUrl?: string | null;
}

export default function Topbar({ isSidebarCollapsed, onToggleSidebar, onOpenMobileMenu, fullName, initialProfilePhotoUrl }: TopbarProps) {
    const tourContext = useContext(TourContext);
    const { data: profile } = useQuery({
        queryKey: ["profile", "me"],
        queryFn: getUserProfileAction,
        staleTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: false,
    });
    const displayName = profile?.name ?? fullName;
    const profilePhotoUrl = profile ? profile.profilePhotoUrl : initialProfilePhotoUrl;
    const initials = displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("pt-BR") || "?";

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
                <button
                    type="button"
                    id="tour-header-help-btn"
                    onClick={() => tourContext?.startCurrentPageTour()}
                    className="inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-300"
                >
                    Precisa de ajuda?
                </button>
                <NotificationBell />
                <span className="hidden h-8 w-px bg-j-transparent-white md:block" />
                <span className="hidden text-sm font-bold text-j-white md:inline">{displayName}</span>
                <Link
                    href="/profile"
                    id="tour-avatar-container"
                    aria-label="Conta"
                    title="Conta"
                    onClick={() => {
                        sessionStorage.setItem("force_branch_tour", "true");
                        window.dispatchEvent(new CustomEvent("tour:destroy-and-diverge"));
                    }}
                    className="cursor-pointer rounded-full ring-2 ring-white/40 transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-j-yellow-300"
                >
                    {profilePhotoUrl ? (
                        <Avatar src={profilePhotoUrl} alt={`Foto de ${displayName}`} loading="eager" />
                    ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-j-yellow-300 text-xs font-extrabold text-j-blue-900">
                            {initials}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}
