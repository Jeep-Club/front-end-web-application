"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarRange, HelpCircle, LoaderCircle, LogOut, Megaphone, Newspaper, Settings, ShieldCheck, UserRound, WalletCards, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import { Logo } from "@/components/common/logo";
import { useModal } from "@/providers/ModalProvider";
import logoutAction from "@/server/actions/auth/logout";
import { useUserStore } from "@/stores/userStore";
import { getAvailableAdminModules, hasAnyAdminAccess } from "@/config/adminModules";
import { useAdminFavorites } from "@/hooks/useAdminFavorites";
import { LogoutConfirmationModal } from "./LogoutConfirmationModal";
import styles from "./Sidebar.module.css";

const navItems = [
    { href: "/feed", label: "Feed", icon: Newspaper, desktopOnly: true },
    { href: "/profile", label: "Conta", icon: UserRound },
    { href: "/financeiro", label: "Histórico financeiro", icon: WalletCards },
    { href: "/agenda", label: "Agenda", icon: CalendarRange },
    { href: "/notificacoes", label: "Avisos", icon: Megaphone },
];

function NavigationProgress() {
    const { pending } = useLinkStatus();
    return <span aria-hidden="true" className={twMerge("pointer-events-none absolute inset-x-2 bottom-0 h-0.5 origin-left rounded-full bg-j-yellow-300 transition-transform duration-200 motion-reduce:transition-none", pending ? "sidebar-link-pending scale-x-100" : "scale-x-0")} />;
}

interface SidebarProps {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    userId: string | number;
    role?: string;
}

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile, userId }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { setContent, setOpen } = useModal();
    const permissions = useUserStore((state) => state.permissions);
    const { favorites } = useAdminFavorites(userId);
    const canAccessAdmin = hasAnyAdminAccess(permissions);
    const favoriteModules = getAvailableAdminModules(permissions).filter((module) => favorites.includes(module.key));
    const logoutMutation = useMutation({ mutationFn: logoutAction, onSuccess: () => router.push("/") });

    function openBranchTour() {
        onCloseMobile();
        sessionStorage.setItem("force_branch_tour", "true");
        window.dispatchEvent(new CustomEvent("tour:destroy-and-diverge"));
    }

    function itemClass(active: boolean) {
        return twMerge(styles.item, active ? "bg-j-yellow-300 text-j-blue-800 shadow-sm" : "text-j-white/70 hover:bg-j-blue-700 hover:text-j-white");
    }

    return <>
        <div aria-hidden="true" data-open={isMobileOpen} onClick={onCloseMobile} className={styles.backdrop} />
        <aside id="tour-sidebar" data-collapsed={isCollapsed} data-mobile-open={isMobileOpen} className={styles.panel}>
            <header className={styles.brand}>
                <button type="button" onClick={onCloseMobile} aria-label="Fechar menu" className={styles.closeButton}><X size={20} aria-hidden="true" /></button>
                <Logo className="h-12 w-12 shrink-0" />
                <h1 className={twMerge(styles.label, "text-xs font-black tracking-tight text-j-white")}>JEEP CLUBE TAMOIOS</h1>
            </header>
            <nav aria-label="Menu principal" className={styles.navigation}>
                {navItems.map(({ href, label, icon: Icon, desktopOnly }) => <Link
                    key={href} href={href} title={label} aria-label={label}
                    aria-current={pathname.startsWith(href) ? "page" : undefined}
                    id={href === "/feed" ? "tour-nav-feed" : href === "/profile" ? "tour-manage-account-btn" : undefined}
                    onClick={href === "/profile" ? openBranchTour : onCloseMobile}
                    className={twMerge(itemClass(pathname.startsWith(href)), desktopOnly && styles.desktopOnly)}
                >
                    <Icon size={18} aria-hidden="true" /><span className={styles.label}>{label}</span><NavigationProgress />
                </Link>)}
                {canAccessAdmin && <>
                    <Link href="/admin" id="tour-admin-link" title="Gestão" aria-label="Gestão" aria-current={pathname.startsWith("/admin") ? "page" : undefined} onClick={openBranchTour} className={itemClass(pathname.startsWith("/admin"))}>
                        <ShieldCheck size={18} aria-hidden="true" /><span className={styles.label}>Gestão</span><NavigationProgress />
                    </Link>
                    {favoriteModules.length > 0 && <div className="mt-3 border-t border-j-blue-700 pt-2">
                        <p className={twMerge(styles.favoritesHeading, "text-[11px] font-bold uppercase tracking-wider text-j-transparent-white")}>Favoritos de gestão</p>
                        {favoriteModules.map(({ key, title, href, icon: Icon }) => {
                            const favoriteTitle = key === "medical-profiles" ? "Dados Médicos" : title.replace(/^Gestão de\s+/i, "").replace(/^./u, character => character.toLocaleUpperCase("pt-BR"));
                            return <Link key={key} href={href} title={favoriteTitle} aria-label={favoriteTitle} aria-current={pathname === href.split("?")[0] ? "page" : undefined} onClick={onCloseMobile} className={twMerge(styles.item, "mb-0.5 text-j-white/80 hover:bg-j-blue-700 hover:text-j-white", pathname === href.split("?")[0] && "bg-j-blue-700 text-j-yellow-300")}>
                                <Icon size={18} aria-hidden="true" /><span className={styles.label}>{favoriteTitle}</span><NavigationProgress />
                            </Link>;
                        })}
                    </div>}
                </>}
            </nav>
            <nav aria-label="Opções da conta" className={styles.account}>
                <Link href="/tutoriais" title="Tutoriais" aria-label="Tutoriais" aria-current={pathname.startsWith("/tutoriais") ? "page" : undefined} onClick={onCloseMobile} className={twMerge(styles.item, "text-red-300 hover:bg-j-blue-700 hover:text-red-200")}>
                    <HelpCircle size={18} aria-hidden="true" /><span className={styles.label}>Tutoriais</span>
                </Link>
                <button type="button" title="Configurações" aria-label="Configurações" onClick={() => { onCloseMobile(); router.push("/configuracoes"); }} className={twMerge(styles.item, "text-j-white/75 hover:bg-j-blue-700 hover:text-j-white")}>
                    <Settings size={18} aria-hidden="true" /><span className={styles.label}>Configurações</span>
                </button>
                <button type="button" title="Sair" aria-label="Sair" disabled={logoutMutation.isPending} aria-busy={logoutMutation.isPending || undefined} onClick={() => { onCloseMobile(); setContent(<LogoutConfirmationModal onConfirm={() => logoutMutation.mutateAsync()} />); setOpen(); }} className={twMerge(styles.item, "text-red-300 hover:bg-j-blue-700 hover:text-red-200")}>
                    {logoutMutation.isPending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <LogOut size={18} aria-hidden="true" />}<span className={styles.label}>Sair</span>
                </button>
            </nav>
        </aside>
    </>;
}
