"use client";

import { Suspense, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AvatarMenu } from "@/components/common/layout-admin/AvatarMenu";
import { NotificationBell } from "@/components/common/layout-admin/NotificationBell";
import { TourContext } from "@/components/common/tour/TourContext";
import { getContextualHelpLabel, type ContextualHelpLabel } from "@/config/tourSteps";
import { getUserProfileAction } from "@/server/actions/profile/get";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface TopbarProps {
    isSidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    onOpenMobileMenu: () => void;
    fullName: string;
    initialProfilePhotoUrl?: string | null;
}

const DEFAULT_HELP_LABEL: ContextualHelpLabel = {
    full: "Precisa de ajuda?",
    compact: "Ajuda?",
};

function HeaderHelpButton({
    label,
    onClick,
}: {
    label: ContextualHelpLabel;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            id="tour-header-help-btn"
            onClick={onClick}
            aria-label={label.full}
            title={label.full}
            className="inline-flex min-h-9 max-w-[145px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-800 transition-colors hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-300 sm:max-w-none sm:px-3 sm:py-1.5 sm:text-xs"
        >
            <HelpCircle size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate sm:hidden">{label.compact}</span>
            <span className="hidden sm:inline">{label.full}</span>
        </button>
    );
}

function ContextualHeaderHelpButton({ onClick }: { onClick: () => void }) {
    const pathname = usePathname() || "/feed";
    const searchParams = useSearchParams();
    const label = getContextualHelpLabel(pathname, searchParams.get("tab"));

    return <HeaderHelpButton label={label} onClick={onClick} />;
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
    const handleHelpClick = () => tourContext?.startCurrentPageTour();

    return (
        <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center justify-between gap-2 bg-j-blue-800 pl-2 pr-3 text-j-white shadow-md sm:pr-4 md:pl-4 md:pr-8">
            <button
                type="button"
                id="tour-mobile-menu-btn"
                onClick={onOpenMobileMenu}
                title="Abrir menu lateral"
                className="-ml-1 flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-2 text-j-white transition-colors hover:bg-j-blue-700 hover:text-j-yellow-300 active:bg-j-blue-700 md:hidden"
            >
                <Menu size={22} />
            </button>

            <button
                type="button"
                onClick={onToggleSidebar}
                title={isSidebarCollapsed ? "Expandir menu" : "Ocultar menu"}
                className="hidden shrink-0 cursor-pointer items-center gap-2 text-j-white transition-colors hover:text-j-yellow-300 md:flex"
            >
                {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                <span className="text-xs font-semibold uppercase tracking-wider">
                    {isSidebarCollapsed ? "Expandir menu" : "Ocultar menu"}
                </span>
            </button>

            <div id="tour-avatar-menu" className="flex min-w-0 items-center gap-2 sm:gap-3">
                <Suspense fallback={<HeaderHelpButton label={DEFAULT_HELP_LABEL} onClick={handleHelpClick} />}>
                    <ContextualHeaderHelpButton onClick={handleHelpClick} />
                </Suspense>
                <NotificationBell />
                <span className="h-8 w-px shrink-0 bg-j-transparent-white" />
                <span className="hidden max-w-44 truncate text-sm font-bold text-j-white md:inline">{displayName}</span>
                <AvatarMenu src={profilePhotoUrl} fullName={displayName} />
            </div>
        </header>
    );
}
