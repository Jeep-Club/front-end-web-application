"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Newspaper,
    HelpCircle,
    CalendarRange,
    ShieldCheck,
    X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Logo } from "@/components/common/logo";
import { useUserStore } from "@/stores/userStore";
import { hasAnyAdminAccess } from "@/config/adminModules";

const navItems = [
    {
        href: "/feed",
        label: "Home",
        icon: Newspaper,
    },
    {
        href: "/agenda",
        label: "Agenda",
        icon: CalendarRange,
    },
];

interface SidebarProps {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    fullName: string;
    role?: string;
}

export default function Sidebar({
    isCollapsed,
    isMobileOpen,
    onCloseMobile,
    fullName,
}: SidebarProps) {
    const pathname = usePathname();

    const permissions = useUserStore(
        (state) => state.permissions,
    );

    const canAccessAdmin = hasAnyAdminAccess(permissions);

    const panelHref = "/admin";
    const panelLabel = "Gest\u00e3o Administrativa";

    return (
        <>
            {isMobileOpen && (
                <div
                    onClick={onCloseMobile}
                    className="fixed inset-0 z-30 bg-j-black/50 md:hidden"
                />
            )}

            <aside
                id="tour-sidebar"
                className={twMerge(
                    `
                    fixed inset-y-0 left-0 z-40 flex h-dvh min-h-0 w-64 shrink-0 flex-col
                    overflow-x-hidden overflow-y-auto overscroll-contain border-r border-j-yellow-300 bg-j-blue-800
                    transition-transform duration-300
                    md:sticky md:top-0 md:z-20 md:translate-x-0
                    md:transition-[width]
                    `,
                    isMobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full",
                    isCollapsed
                        ? "md:w-20"
                        : "md:w-60",
                )}
            >
                <div className="relative flex shrink-0 flex-col items-center gap-1 border-b border-j-blue-700 p-6">
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="absolute right-3 top-3 cursor-pointer text-j-transparent-white hover:text-j-white md:hidden"
                        aria-label="Fechar menu"
                    >
                        <X size={20} />
                    </button>

                    <Logo className="h-12 w-12" />

                    {!isCollapsed && (
                        <>
                            <h1 className="text-lg font-black tracking-tight text-j-white">
                                JEEP CLUBE
                            </h1>

                            <p className="text-[10px] font-bold uppercase tracking-widest text-j-transparent-white">
                                Tamoios
                            </p>
                        </>
                    )}
                </div>

                <div className="flex shrink-0 flex-col items-center gap-0.5 border-b border-j-blue-700 p-4 md:hidden">
                    <span className="text-sm font-bold text-j-white">
                        {fullName}
                    </span>
                </div>

                <nav className="flex min-h-fit flex-1 flex-col gap-2 p-4">
                    {navItems.map(
                        ({
                            href,
                            label,
                            icon: Icon,
                        }) => {
                            const isActive =
                                pathname.startsWith(href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    title={label}
                                    id={href === "/feed" ? "tour-nav-feed" : undefined}
                                    onClick={onCloseMobile}
                                    className={twMerge(
                                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                        isCollapsed &&
                                            "md:justify-center md:px-0",
                                        isActive
                                            ? "bg-j-yellow-300 font-bold text-j-blue-800 shadow-sm"
                                            : "text-j-white/70 hover:bg-j-blue-700 hover:text-j-white",
                                    )}
                                >
                                    <Icon size={18} />

                                    <span
                                        className={
                                            isCollapsed
                                                ? "md:hidden"
                                                : ""
                                        }
                                    >
                                        {label}
                                    </span>
                                </Link>
                            );
                        },
                    )}
                    <Link
                        href="/tutoriais"
                        title="Tutoriais"
                        aria-current={pathname.startsWith("/tutoriais") ? "page" : undefined}
                        onClick={onCloseMobile}
                        className={twMerge(
                            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-j-blue-700 hover:text-red-300",
                            pathname.startsWith("/tutoriais") && "bg-j-blue-700",
                            isCollapsed && "md:justify-center md:px-0",
                        )}
                    >
                        <HelpCircle size={18} />
                        <span className={isCollapsed ? "md:hidden" : ""}>Tutoriais</span>
                    </Link>
                    {canAccessAdmin && (
                        <Link
                            href={panelHref}
                            title={panelLabel}
                            aria-label={panelLabel}
                            id="tour-admin-link"
                            aria-current={pathname.startsWith(panelHref) ? "page" : undefined}
                            onClick={() => {
                                onCloseMobile();
                                if (typeof window !== "undefined") {
                                    sessionStorage.setItem('force_branch_tour', 'true');
                                    window.dispatchEvent(new CustomEvent('tour:destroy-and-diverge'));
                                }
                            }}
                            className={twMerge(
                                "mt-auto flex shrink-0 cursor-pointer items-center gap-3 rounded-lg bg-j-yellow-300 px-4 py-3 text-xs font-bold text-j-blue-800 shadow-sm transition-colors hover:bg-j-yellow-300",
                                isCollapsed && "md:justify-center md:px-0",
                            )}
                        >
                            <ShieldCheck size={18} />
                            <span className={isCollapsed ? "md:hidden" : ""}>
                                {panelLabel}
                            </span>
                        </Link>
                    )}
                </nav>
            </aside>
        </>
    );
}
