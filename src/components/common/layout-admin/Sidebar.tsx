"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Newspaper,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Logo } from "@/components/common/logo";
import { useUserStore } from "@/stores/userStore";
import { hasAnyAdminAccess } from "@/config/adminModules";

const navItems = [
    {
        href: "/feed",
        label: "Feed",
        icon: Newspaper,
    },
];

interface SidebarProps {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    fullName: string;
    role: string;
}

export default function Sidebar({
    isCollapsed,
    isMobileOpen,
    onCloseMobile,
    fullName,
    role,
}: SidebarProps) {
    const pathname = usePathname();

    const permissions = useUserStore(
        (state) => state.permissions,
    );

    const canAccessAdmin = hasAnyAdminAccess(permissions);
    const isAdminPanel = pathname.startsWith("/admin");

    const panelHref = isAdminPanel ? "/feed" : "/admin";
    const panelLabel = isAdminPanel
        ? "Painel do sócio"
        : "Painel administrativo";

    const PanelIcon = isAdminPanel
        ? UserRound
        : ShieldCheck;

    return (
        <>
            {isMobileOpen && (
                <div
                    onClick={onCloseMobile}
                    className="fixed inset-0 z-30 bg-j-black/50 md:hidden"
                />
            )}

            <aside
                className={twMerge(
                    `
                    fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col
                    border-r border-j-yellow-300 bg-j-blue-800
                    transition-transform duration-300
                    md:sticky md:top-0 md:z-auto md:translate-x-0
                    md:transition-[width]
                    `,
                    isMobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full",
                    isCollapsed
                        ? "md:w-20"
                        : "md:w-64",
                )}
            >
                <div className="relative flex flex-col items-center gap-1 border-b border-j-blue-700 p-6">
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

                <div className="flex flex-col items-center gap-0.5 border-b border-j-blue-700 p-4 md:hidden">
                    <span className="text-sm font-bold text-j-white">
                        {fullName}
                    </span>

                    <span className="text-xs text-j-transparent-white">
                        {role}
                    </span>
                </div>

                <nav className="flex flex-1 flex-col gap-2 p-4">
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
                </nav>

                {canAccessAdmin && (
                    <div className="border-t border-j-blue-700 p-4">
                        <Link
                            href={panelHref}
                            title={panelLabel}
                            onClick={onCloseMobile}
                            className={twMerge(
                                `
                                flex items-center justify-center gap-3
                                rounded-lg bg-j-yellow-300 px-4 py-3
                                text-sm font-bold text-j-blue-800
                                transition-all
                                hover:bg-j-yellow-200
                                active:scale-[0.98]
                                `,
                                isCollapsed &&
                                    "md:px-0",
                            )}
                        >
                            <PanelIcon size={18} />

                            <span
                                className={
                                    isCollapsed
                                        ? "md:hidden"
                                        : ""
                                }
                            >
                                {panelLabel}
                            </span>
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}