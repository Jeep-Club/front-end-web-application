'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, CalendarRange, Newspaper, UserRound } from "lucide-react";
import Sidebar from "@/components/common/layout-admin/Sidebar";
import Topbar from "@/components/common/layout-admin/Topbar";
import GuidedTour from "@/components/common/tour/GuidedTour";
import { FirstAccessOnboarding } from "@/components/pages/first-access/Onboarding";
import { AdminUserIdContext } from "@/hooks/useAdminFavorites";

const mobileTabs = [
    { href: "/feed", label: "Feed", icon: Newspaper },
    { href: "/agenda", label: "Agenda", icon: CalendarRange },
    { href: "/notificacoes", label: "Notificações", icon: BellRing },
    { href: "/profile", label: "Perfil", icon: UserRound },
] as const;

interface DashboardShellProps {
    fullName: string;
    userId: string | number;
    initialProfilePhotoUrl?: string | null;
    onboardingRequired?: boolean;
    children: React.ReactNode;
}

export default function DashboardShell({ fullName, userId, initialProfilePhotoUrl, onboardingRequired = false, children }: DashboardShellProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    if (onboardingRequired) return <FirstAccessOnboarding />;

    return (
        <GuidedTour setMobileMenuOpen={setIsMobileMenuOpen}>
            <AdminUserIdContext.Provider value={userId}>
            <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-j-white">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    isMobileOpen={isMobileMenuOpen}
                    onCloseMobile={() => setIsMobileMenuOpen(false)}
                    userId={userId}
                />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <Topbar
                        isSidebarCollapsed={isSidebarCollapsed}
                        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                        fullName={fullName}
                        initialProfilePhotoUrl={initialProfilePhotoUrl}
                    />
                    <div data-dashboard-scroll className="isolate min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-j-gray-100 [-webkit-overflow-scrolling:touch]">
                        {children}
                    </div>
                    <footer className="hidden shrink-0 border-t border-j-gray-200 bg-j-white px-6 py-3 text-center text-[11px] font-normal leading-relaxed text-j-gray-600 md:block">
                        © {new Date().getFullYear()} Desenvolvido pelo Instituto Federal de São Paulo - Câmpus Caraguatatuba
                    </footer>
                    <nav aria-label="Navegação principal" className="flex shrink-0 border-t border-j-gray-200 bg-j-white pb-[env(safe-area-inset-bottom)] md:hidden">
                        {mobileTabs.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-label={label}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`flex min-h-14 flex-1 cursor-pointer items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-j-blue-800 ${isActive ? "text-j-blue-800" : "text-j-gray-500 hover:text-j-blue-800"}`}
                                >
                                    <Icon size={21} aria-hidden="true" />
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
            </AdminUserIdContext.Provider>
        </GuidedTour>
    );
}
