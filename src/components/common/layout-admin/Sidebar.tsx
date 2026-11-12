"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    HelpCircle,
    CalendarRange,
    ShieldCheck,
    X,
    Newspaper,
    WalletCards,
    Settings,
    LogOut,
    LoaderCircle,
    UserRound,
    Megaphone,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useMutation } from "@tanstack/react-query";

import { Logo } from "@/components/common/logo";
import { useModal } from "@/providers/ModalProvider";
import logoutAction from "@/server/actions/auth/logout";
import { useUserStore } from "@/stores/userStore";
import { getAvailableAdminModules, hasAnyAdminAccess } from "@/config/adminModules";
import { useAdminFavorites } from "@/hooks/useAdminFavorites";
import { LogoutConfirmationModal } from "./LogoutConfirmationModal";

const navItems = [
    {
        href: "/feed",
        label: "Feed",
        icon: Newspaper,
        desktopOnly: true,
    },
    {
        href: "/profile",
        label: "Conta",
        icon: UserRound,
    },
    {
        href: "/financeiro",
        label: "Histórico financeiro",
        icon: WalletCards,
    },
    {
        href: "/agenda",
        label: "Agenda",
        icon: CalendarRange,
    },
    {
        href: "/notificacoes",
        label: "Avisos",
        icon: Megaphone,
    },
];

function NavigationProgress() {
    const { pending } = useLinkStatus();

    return (
        <span
            aria-hidden="true"
            className={twMerge(
                "pointer-events-none absolute inset-x-2 bottom-0 h-0.5 origin-left rounded-full bg-j-yellow-300 transition-transform duration-200 motion-reduce:transition-none",
                pending ? "sidebar-link-pending scale-x-100" : "scale-x-0",
            )}
        />
    );
}

interface SidebarProps {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    userId: string | number;
    role?: string;
}

export default function Sidebar({
    isCollapsed,
    isMobileOpen,
    onCloseMobile,
    userId,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { setContent, setOpen } = useModal();
    const logoutMutation = useMutation({
        mutationFn: logoutAction,
        onSuccess: () => router.push("/"),
    });

    const permissions = useUserStore(
        (state) => state.permissions,
    );

    const canAccessAdmin = hasAnyAdminAccess(permissions);
    const { favorites } = useAdminFavorites(userId);
    const favoriteModules = getAvailableAdminModules(permissions).filter((module) => favorites.includes(module.key));

    const panelHref = "/admin";

    return (
        <>
            {isMobileOpen && (
                <div
                    onClick={onCloseMobile}
                    className="sidebar-backdrop-enter fixed inset-0 z-30 cursor-pointer bg-j-black/50 md:hidden"
                />
            )}

            <aside
                id="tour-sidebar"
                className={twMerge(
                    `
                    fixed inset-y-0 left-0 z-40 flex h-dvh min-h-0 w-64 shrink-0 flex-col
                    overflow-x-hidden overflow-y-auto overscroll-contain border-r border-j-yellow-300 bg-j-blue-800
                    transition-[transform,width] duration-300 ease-out motion-reduce:transition-none
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
                <div className="relative flex shrink-0 flex-row items-center justify-center gap-2 px-2 pb-3 pt-10 md:gap-2 md:py-6 md:pl-4 md:pr-6">
                    <button
                        type="button"
                        onClick={onCloseMobile}
                        className="absolute right-3 top-2 cursor-pointer text-j-transparent-white hover:text-j-white md:hidden"
                        aria-label="Fechar menu"
                    >
                        <X size={20} />
                    </button>

                    <Logo className="h-8 w-8 shrink-0 md:h-12 md:w-12" />

                    {!isCollapsed && (
                        <div className="flex min-w-0 flex-row items-baseline gap-1">
                            <h1 className="whitespace-nowrap text-[13px] font-black tracking-tight text-j-white md:text-[12px]">
                                JEEP CLUBE TAMOIOS
                            </h1>
                        </div>
                    )}
                </div>

                <nav className="flex min-h-fit flex-1 flex-col gap-1 p-3">
                    {navItems.map(
                        ({
                            href,
                            label,
                            icon: Icon,
                            desktopOnly,
                        }) => {
                            const isActive = pathname.startsWith(href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    title={label}
                                    id={href === "/feed" ? "tour-nav-feed" : href === "/profile" ? "tour-manage-account-btn" : undefined}
                                    onClick={() => {
                                        onCloseMobile();
                                        if (href === "/profile") {
                                            sessionStorage.setItem("force_branch_tour", "true");
                                            window.dispatchEvent(new CustomEvent("tour:destroy-and-diverge"));
                                        }
                                    }}
                                    className={twMerge(
                                        "relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15.5px] font-bold transition-[background-color,color,transform] duration-200 active:scale-[0.98] motion-reduce:transform-none",
                                        desktopOnly && "hidden md:flex",
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
                                    <NavigationProgress />
                                </Link>
                            );
                        },
                    )}
                    {canAccessAdmin && (
                        <>
                        <Link
                            href={panelHref}
                            title="Gestão"
                            id="tour-admin-link"
                            aria-current={pathname.startsWith(panelHref) ? "page" : undefined}
                            onClick={() => {
                                onCloseMobile();
                                sessionStorage.setItem("force_branch_tour", "true");
                                window.dispatchEvent(new CustomEvent("tour:destroy-and-diverge"));
                            }}
                            className={twMerge(
                            "relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-[15.5px] font-bold transition-[background-color,color,transform] duration-200 active:scale-[0.98] motion-reduce:transform-none",
                                isCollapsed && "md:justify-center md:px-0",
                                pathname.startsWith(panelHref)
                                    ? "bg-j-yellow-300 font-bold text-j-blue-800 shadow-sm"
                                    : "text-j-white/70 hover:bg-j-blue-700 hover:text-j-white",
                            )}
                        >
                            <ShieldCheck size={18} aria-hidden="true" />
                            <span className={isCollapsed ? "md:hidden" : ""}>
                                Gestão
                            </span>
                            <NavigationProgress />
                        </Link>
                        {favoriteModules.length > 0 && <div className="mt-3 border-t border-j-blue-700 pt-2">
                            {!isCollapsed && <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-j-transparent-white">Favoritos de gestão</p>}
                            {favoriteModules.map(({ key, title, href, icon: Icon }) => {
                                const favoriteTitle = key === "medical-profiles"
                                    ? "Dados Médicos"
                                    : title.replace(/^Gestão de\s+/i, "").replace(/^./u, (character) => character.toLocaleUpperCase("pt-BR"));

                                return <Link key={key} href={href} title={favoriteTitle} aria-label={favoriteTitle} onClick={onCloseMobile} className={twMerge("relative mb-0.5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-[15.5px] font-bold text-j-white/80 transition-[background-color,color,transform] duration-200 hover:bg-j-blue-700 hover:text-j-white active:scale-[0.98] motion-reduce:transform-none", isCollapsed && "md:justify-center md:px-0", pathname === href.split("?")[0] && "bg-j-blue-700 text-j-yellow-300")}>
                                <Icon size={18} />
                                <span className={isCollapsed ? "md:hidden" : ""}>{favoriteTitle}</span>
                                <NavigationProgress />
                            </Link>;
                            })}
                        </div>}
                        </>
                    )}
                </nav>
                <nav
                    aria-label="Opções da conta"
                    className="flex shrink-0 flex-col gap-0.5 border-t border-j-blue-700 px-3 py-2"
                >
                    <Link
                        href="/tutoriais"
                        title="Tutoriais"
                        aria-current={pathname.startsWith("/tutoriais") ? "page" : undefined}
                        onClick={onCloseMobile}
                        className={twMerge("flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[15.5px] font-bold text-red-300 transition-colors hover:bg-j-blue-700 hover:text-red-200", isCollapsed && "md:justify-center md:px-0")}
                    >
                        <HelpCircle size={17} aria-hidden="true" />
                        <span className={isCollapsed ? "md:hidden" : ""}>Tutoriais</span>
                    </Link>
                    <button
                        type="button"
                        title="Configurações"
                        onClick={() => {
                            onCloseMobile();
                            router.push("/configuracoes");
                        }}
                        className={twMerge("flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[15.5px] font-bold text-j-white/75 transition-colors hover:bg-j-blue-700 hover:text-j-white", isCollapsed && "md:justify-center md:px-0")}
                    >
                        <Settings size={17} aria-hidden="true" />
                        <span className={isCollapsed ? "md:hidden" : ""}>Configurações</span>
                    </button>
                    <button
                        type="button"
                        title="Sair"
                        disabled={logoutMutation.isPending}
                        onClick={() => {
                            onCloseMobile();
                            setContent(<LogoutConfirmationModal onConfirm={() => logoutMutation.mutateAsync()} />);
                            setOpen();
                        }}
                        className={twMerge("flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-left text-[15.5px] font-bold text-red-300 transition-colors hover:bg-j-blue-700 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60", isCollapsed && "md:justify-center md:px-0")}
                    >
                        {logoutMutation.isPending ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <LogOut size={17} aria-hidden="true" />}
                        <span className={isCollapsed ? "md:hidden" : ""}>Sair</span>
                    </button>
                </nav>
            </aside>
        </>
    );
}
