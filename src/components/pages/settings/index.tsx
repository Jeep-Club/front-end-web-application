"use client";

import {
    ArrowLeft,
    Bell,
    CalendarCheck,
    Check,
    ChevronRight,
    CircleAlert,
    Eye,
    HelpCircle,
    History,
    ListChecks,
    LockKeyhole,
    Monitor,
    Moon,
    Palette,
    Save,
    ShieldCheck,
    Smartphone,
    Sun,
    UserRound,
    WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useMediaQuery from "@/hooks/useMediaQuery";
import styles from "./SettingsPage.module.css";
import { useTheme } from "@/providers/ThemeProvider";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/common/button";
import { PageHeader } from "@/components/common/page-header";
import { resetAllTours } from "@/hooks/useTour";

type SectionKey = "account" | "activity" | "notifications" | "privacy" | "preferences" | "help";
type OptionKey =
    | "personal-data"
    | "password"
    | "sessions"
    | "event-history"
    | "account-activity"
    | "financial-history"
    | "notification-types"
    | "notification-channels"
    | "profile-visibility"
    | "medical-access"
    | "theme"
    | "tips"
    | "tutorial"
    | "support"
    | "legal";
type MobileLevel = "sections" | "options" | "editor";

interface SettingOption {
    key: OptionKey;
    label: string;
    description: string;
    icon: LucideIcon;
}

interface SettingSection {
    key: SectionKey;
    label: string;
    description: string;
    icon: LucideIcon;
    options: SettingOption[];
}

const SECTIONS: SettingSection[] = [
    {
        key: "account",
        label: "Conta e segurança",
        description: "Acesso e proteção",
        icon: UserRound,
        options: [
            { key: "personal-data", label: "Dados pessoais", description: "Acesse e atualize seu cadastro", icon: UserRound },
            { key: "password", label: "Senha", description: "Altere sua senha de acesso", icon: LockKeyhole },
            { key: "sessions", label: "Sessões ativas", description: "Veja seus dispositivos conectados", icon: Smartphone },
        ],
    },
    {
        key: "activity",
        label: "Sua atividade",
        description: "Históricos e movimentações",
        icon: History,
        options: [
            { key: "event-history", label: "Histórico de eventos", description: "Inscrições e participações", icon: CalendarCheck },
            { key: "account-activity", label: "Atividade da conta", description: "Alterações feitas no cadastro", icon: ListChecks },
            { key: "financial-history", label: "Histórico financeiro", description: "Pagamentos e cobranças", icon: WalletCards },
        ],
    },
    {
        key: "notifications",
        label: "Notificações",
        description: "Avisos e canais",
        icon: Bell,
        options: [
            { key: "notification-types", label: "Tipos de notificação", description: "Eventos, avisos e financeiro", icon: Bell },
            { key: "notification-channels", label: "Canais de recebimento", description: "E-mail e WhatsApp", icon: Smartphone },
        ],
    },
    {
        key: "privacy",
        label: "Privacidade",
        description: "Visibilidade dos dados",
        icon: ShieldCheck,
        options: [
            { key: "profile-visibility", label: "Visibilidade do perfil", description: "Foto, telefone e veículos", icon: Eye },
            { key: "medical-access", label: "Acesso médico", description: "Permissão para emergências", icon: ShieldCheck },
        ],
    },
    {
        key: "preferences",
        label: "Preferências",
        description: "Visual e experiência",
        icon: Palette,
        options: [
            { key: "theme", label: "Tema", description: "Claro, escuro ou automático", icon: Palette },
            { key: "tips", label: "Dicas de uso", description: "Orientações durante a navegação", icon: HelpCircle },
        ],
    },
    {
        key: "help",
        label: "Ajuda e informações",
        description: "Suporte e documentos",
        icon: HelpCircle,
        options: [
            { key: "tutorial", label: "Tutorial", description: "Veja o passo a passo novamente", icon: HelpCircle },
            { key: "support", label: "Suporte", description: "Fale com a administração", icon: Smartphone },
            { key: "legal", label: "Termos e privacidade", description: "Documentos do sistema", icon: ShieldCheck },
        ],
    },
];

function Toggle({
    checked,
    onChange,
    label,
    description,
}: {
    checked: boolean;
    onChange: () => void;
    label: string;
    description: string;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-j-gray-100 py-4 last:border-0">
            <div>
                <p className="text-sm font-bold text-j-gray-700">{label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-j-gray-400">{description}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={onChange}
                className={twMerge(
                    "relative h-11 w-14 shrink-0 cursor-pointer rounded-full border-[8px] border-transparent bg-clip-padding transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-yellow-400 motion-reduce:transition-none",
                    checked ? "bg-j-blue-800" : "bg-j-gray-300",
                )}
            >
                <span className={twMerge(
                    "absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
                    checked ? "translate-x-5" : "translate-x-0",
                )} />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const panelRef = useRef<HTMLDivElement>(null);
    const hasNavigated = useRef(false);
    const [direction, setDirection] = useState<"forward" | "back">("forward");
    const [sectionKey, setSectionKey] = useState<SectionKey>("account");
    const [optionKey, setOptionKey] = useState<OptionKey>("personal-data");
    const [mobileLevel, setMobileLevel] = useState<MobileLevel>("sections");
    const { theme, setTheme, saveTheme } = useTheme();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [preferences, setPreferences] = useState({
        events: true,
        announcements: true,
        finance: true,
        email: true,
        whatsapp: false,
        publicPhone: false,
        publicVehicles: true,
        publicPhoto: true,
        emergencyMedicalAccess: true,
        tips: true,
    });

    const section = SECTIONS.find((item) => item.key === sectionKey) ?? SECTIONS[0];
    const option = section.options.find((item) => item.key === optionKey) ?? section.options[0];

    useEffect(() => {
        if (!hasNavigated.current) return;
        const panel = panelRef.current;
        if (!panel) return;
        const targetPanel = isDesktop ? (mobileLevel === "options" ? "options" : "editor") : mobileLevel;
        const activePanel = panel.querySelector<HTMLElement>(`[data-settings-panel="${targetPanel}"]`);
        const returnTarget = direction === "back"
            ? activePanel?.querySelector<HTMLElement>(`[data-settings-key="${mobileLevel === "sections" ? sectionKey : optionKey}"]`)
            : null;
        (returnTarget ?? activePanel?.querySelector<HTMLElement>("h2"))?.focus({ preventScroll: true });
        if (!isDesktop) panel.scrollIntoView({ block: "start", behavior: "instant" });
    }, [mobileLevel, sectionKey, optionKey, isDesktop, direction]);

    function navigateLevel(level: MobileLevel, nextDirection: "forward" | "back" = "forward") {
        hasNavigated.current = true;
        setDirection(nextDirection);
        setMobileLevel(level);
    }

    function chooseSection(nextSection: SettingSection) {
        setSectionKey(nextSection.key);
        setOptionKey(nextSection.options[0].key);
        setIsChangingPassword(false);
        navigateLevel("options");
    }

    function chooseOption(nextOption: SettingOption) {
        setOptionKey(nextOption.key);
        setIsChangingPassword(false);
        navigateLevel("editor");
    }

    function toggle(key: keyof typeof preferences) {
        setPreferences((current) => ({ ...current, [key]: !current[key] }));
    }

    function save() {
        if (optionKey === "theme") {
            try {
                saveTheme();
                toast.success("Tema salvo neste dispositivo.");
            } catch {
                toast.error("N" + String.fromCharCode(227) + "o foi poss" + String.fromCharCode(237) + "vel salvar o tema. Verifique se o navegador permite armazenamento local.");
            }
            return;
        }
        toast.success("Preferências salvas neste protótipo.");
    }

    function renderEditorHeader() {
        const Icon = option.icon;
        return (
            <header className="border-b border-j-gray-200 px-5 py-4">
                <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-j-blue-50 p-2.5 text-j-blue-800"><Icon size={20} /></span>
                    <div>
                        <h2 tabIndex={-1} className="text-base font-extrabold text-j-gray-700 outline-none">{option.label}</h2>
                        <p className="mt-0.5 text-xs text-j-gray-400">{option.description}</p>
                    </div>
                </div>
            </header>
        );
    }

    function renderEditorContent() {
        switch (optionKey) {
            case "personal-data":
                return (
                    <div className="p-5">
                        <p className="text-sm leading-relaxed text-j-gray-500">Seus documentos, contato, foto, veículos e demais informações cadastrais ficam reunidos no gerenciamento da conta.</p>
                        <Button type="button" onClick={() => router.push("/profile")} className="mt-5 gap-2">
                            Ir para meus dados <ChevronRight size={16} />
                        </Button>
                    </div>
                );
            case "password":
                if (!isChangingPassword) {
                    return (
                        <div className="p-5">
                            <div className="flex gap-4 rounded-xl border border-j-gray-200 bg-j-gray-100/50 p-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-j-blue-800 text-j-white">
                                    <LockKeyhole size={21} />
                                </span>
                                <div>
                                    <p className="text-sm font-extrabold text-j-gray-700">Proteja o acesso à sua conta</p>
                                    <p className="mt-1 text-xs leading-relaxed text-j-gray-500">
                                        Você precisará confirmar sua senha atual. Depois da alteração, outras sessões poderão ser encerradas por segurança.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <p className="text-xs font-extrabold uppercase tracking-wide text-j-gray-400">Antes de continuar</p>
                                <ul className="mt-3 space-y-3">
                                    {[
                                        "Use uma senha diferente das utilizadas em outros serviços.",
                                        "Não compartilhe sua senha com outros associados ou administradores.",
                                        "Tenha acesso ao e-mail cadastrado para recuperar sua conta.",
                                    ].map((item) => (
                                        <li key={item} className="flex gap-3 text-sm text-j-gray-600">
                                            <Check size={17} className="mt-0.5 shrink-0 text-j-green-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button type="button" onClick={() => setIsChangingPassword(true)} className="mt-6 gap-2">
                                <LockKeyhole size={16} />
                                Alterar minha senha
                            </Button>
                        </div>
                    );
                }

                return (
                    <form
                        className="p-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            toast("A alteração segura será integrada ao backend.");
                        }}
                    >
                        <button type="button" onClick={() => setIsChangingPassword(false)} className="mb-5 flex cursor-pointer items-center gap-2 text-xs font-bold text-j-blue-800">
                            <ArrowLeft size={16} />
                            Cancelar alteração
                        </button>

                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-j-gray-600">
                                Senha atual
                                <input required autoComplete="current-password" type="password" className="mt-2 w-full rounded-xl border border-j-gray-300 bg-j-white px-4 py-3 text-sm outline-none focus:border-j-yellow-400" />
                            </label>
                            <div className="h-px bg-j-gray-200" />
                            <label className="block text-xs font-bold text-j-gray-600">
                                Nova senha
                                <input required minLength={8} autoComplete="new-password" type="password" className="mt-2 w-full rounded-xl border border-j-gray-300 bg-j-white px-4 py-3 text-sm outline-none focus:border-j-yellow-400" />
                            </label>
                            <label className="block text-xs font-bold text-j-gray-600">
                                Confirmar nova senha
                                <input required minLength={8} autoComplete="new-password" type="password" className="mt-2 w-full rounded-xl border border-j-gray-300 bg-j-white px-4 py-3 text-sm outline-none focus:border-j-yellow-400" />
                            </label>
                        </div>

                        <div className="mt-4 flex gap-3 rounded-xl border border-j-yellow-300 bg-j-yellow-100/40 p-4">
                            <CircleAlert size={18} className="shrink-0 text-j-yellow-700" />
                            <div>
                                <p className="text-xs font-bold text-j-gray-700">A nova senha deve conter:</p>
                                <p className="mt-1 text-xs leading-relaxed text-j-gray-500">No mínimo 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial.</p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setIsChangingPassword(false)} className="cursor-pointer rounded-lg border border-j-gray-300 px-4 py-2.5 text-sm font-bold text-j-gray-600 hover:bg-j-gray-100">
                                Cancelar
                            </button>
                            <Button type="submit" className="gap-2">
                                <LockKeyhole size={16} />
                                Confirmar nova senha
                            </Button>
                        </div>
                    </form>
                );
            case "sessions":
                return (
                    <div className="p-5">
                        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-j-gray-300 p-6 text-center">
                            <Smartphone size={30} className="text-j-gray-400" />
                            <p className="mt-3 text-sm font-bold text-j-gray-700">Sessões ainda não disponíveis</p>
                            <p className="mt-1 max-w-sm text-xs leading-relaxed text-j-gray-400">Os dispositivos conectados serão exibidos aqui quando essa funcionalidade estiver integrada ao backend.</p>
                        </div>
                    </div>
                );
            case "event-history":
                return (
                    <div className="p-5">
                        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-j-gray-300 p-6 text-center">
                            <CalendarCheck size={30} className="text-j-gray-400" />
                            <p className="mt-3 text-sm font-bold text-j-gray-700">Nenhum histórico carregado</p>
                            <p className="mt-1 max-w-sm text-xs leading-relaxed text-j-gray-400">As inscrições e participações em eventos serão apresentadas aqui após a integração com o backend.</p>
                        </div>
                    </div>
                );
            case "account-activity":
                return (
                    <div className="p-5">
                        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-j-gray-300 p-6 text-center">
                            <ListChecks size={30} className="text-j-gray-400" />
                            <p className="mt-3 text-sm font-bold text-j-gray-700">Nenhuma atividade carregada</p>
                            <p className="mt-1 max-w-sm text-xs leading-relaxed text-j-gray-400">As alterações importantes da conta serão apresentadas aqui quando o histórico estiver disponível no backend.</p>
                        </div>
                    </div>
                );
            case "financial-history":
                return (
                    <div className="p-5">
                        <p className="text-sm leading-relaxed text-j-gray-500">
                            Consulte as cobranças, mensalidades, pagamentos e comprovantes vinculados à sua conta.
                        </p>
                        <Button type="button" onClick={() => router.push("/financeiro")} className="mt-5 gap-2">Abrir histórico financeiro<ChevronRight size={16} /></Button>
                    </div>
                );
            case "notification-types":
                return <div className="px-5"><Toggle checked={preferences.events} onChange={() => toggle("events")} label="Eventos" description="Novos eventos, alterações e lembretes." /><Toggle checked={preferences.announcements} onChange={() => toggle("announcements")} label="Avisos do clube" description="Comunicados publicados pela administração." /><Toggle checked={preferences.finance} onChange={() => toggle("finance")} label="Financeiro" description="Cobranças, vencimentos e pagamentos." /></div>;
            case "notification-channels":
                return <div className="px-5"><Toggle checked={preferences.email} onChange={() => toggle("email")} label="E-mail" description="Receber no endereço cadastrado." /><Toggle checked={preferences.whatsapp} onChange={() => toggle("whatsapp")} label="WhatsApp" description="Disponível após integração do clube." /></div>;
            case "profile-visibility":
                return <div className="px-5"><Toggle checked={preferences.publicPhone} onChange={() => toggle("publicPhone")} label="Mostrar meu telefone" description="Outros associados poderão visualizar seu contato." /><Toggle checked={preferences.publicVehicles} onChange={() => toggle("publicVehicles")} label="Mostrar meus veículos" description="Exibir seus veículos para outros membros." /><Toggle checked={preferences.publicPhoto} onChange={() => toggle("publicPhoto")} label="Mostrar minha foto" description="Usar sua foto no diretório do clube." /></div>;
            case "medical-access":
                return (
                    <div className="p-5">
                        <Toggle checked={preferences.emergencyMedicalAccess} onChange={() => toggle("emergencyMedicalAccess")} label="Acesso médico em emergência" description="Autorizar pessoas responsáveis a consultar os dados em uma emergência." />
                        <div className="mt-4 flex gap-3 rounded-xl border border-j-yellow-300 bg-j-yellow-100/40 p-4"><Eye size={18} className="shrink-0 text-j-yellow-700" /><p className="text-xs leading-relaxed text-j-gray-600">Os dados médicos nunca ficam públicos. O acesso deve ser autorizado e registrado.</p></div>
                    </div>
                );
            case "theme":
                return (
                    <div className="grid gap-3 p-5 sm:grid-cols-3">
                        {([["light", "Claro", Sun], ["dark", "Escuro", Moon], ["system", "Do dispositivo", Monitor]] as const).map(([value, label, Icon]) => (
                            <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)} className={twMerge("flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-5 text-sm font-bold", theme === value ? "border-[var(--accent-text)] bg-j-blue-50 text-j-blue-800" : "border-j-gray-200 text-j-gray-500")}>
                                <Icon size={24} />{label}
                            </button>
                        ))}
                    </div>
                );
            case "tips":
                return <div className="px-5"><Toggle checked={preferences.tips} onChange={() => toggle("tips")} label="Mostrar dicas de uso" description="Exibir sugestões rápidas durante a navegação." /></div>;
            case "tutorial":
                return <div className="p-5"><p className="text-sm text-j-gray-500">Reinicie o passo a passo para rever as principais áreas do sistema.</p><Button type="button" onClick={() => { resetAllTours(); router.push("/feed"); }} className="mt-5">Refazer tutorial</Button></div>;
            case "support":
                return <div className="p-5"><p className="text-sm text-j-gray-500">O canal de atendimento será definido pela administração do clube.</p><Button type="button" onClick={() => toast("Canal de suporte ainda não configurado.")} className="mt-5">Falar com a administração</Button></div>;
            case "legal":
                return <div className="divide-y divide-j-gray-100 px-5"><button type="button" className="flex w-full cursor-pointer items-center justify-between py-5 text-sm font-bold text-j-gray-700">Política de privacidade<ChevronRight size={18} /></button><button type="button" className="flex w-full cursor-pointer items-center justify-between py-5 text-sm font-bold text-j-gray-700">Termos de uso<ChevronRight size={18} /></button></div>;
        }
    }

    const showSave = ["notification-types", "notification-channels", "profile-visibility", "medical-access", "theme", "tips"].includes(optionKey);

    return (
        <div className="min-h-full w-full p-3 pb-8 md:p-4">
            <div className="flex w-full flex-col gap-6">
                <PageHeader title="Configurações" breadcrumbs={[{ label: "Home", href: "/feed" }, { label: "Configurações" }]} />

                <div ref={panelRef} className="scroll-mt-3 rounded-2xl border border-j-gray-200 bg-j-white shadow-sm">
                    <div className="sticky top-0 z-10 flex min-h-16 items-center gap-2 rounded-t-2xl border-b border-j-gray-200 bg-j-white/95 px-3 py-2 backdrop-blur-sm lg:hidden">
                        {mobileLevel !== "sections" && <button
                            type="button"
                            onClick={() => navigateLevel(mobileLevel === "editor" ? "options" : "sections", "back")}
                            aria-label={mobileLevel === "editor" ? `Voltar para ${section.label}` : "Voltar para categorias"}
                            className={twMerge(styles.navigationButton, "flex size-11 shrink-0 items-center justify-center rounded-xl bg-j-gray-100 text-j-blue-800")}
                        ><ArrowLeft size={20} aria-hidden="true" /></button>}
                        <div className="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
                            <p className="truncate text-xs font-medium text-j-gray-500">{mobileLevel === "sections" ? "Suas preferências, do seu jeito" : mobileLevel === "options" ? "Configurações" : section.label}</p>
                            <p className="truncate text-sm font-extrabold text-j-blue-800">{mobileLevel === "sections" ? "Categorias" : mobileLevel === "options" ? section.label : option.label}</p>
                        </div>
                        <div className="flex shrink-0 gap-1" aria-hidden="true">
                            {["sections", "options", "editor"].map((level) => <span key={level} className={twMerge("h-1.5 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none", mobileLevel === level ? "w-5 bg-j-blue-800" : "w-1.5 bg-j-gray-200")} />)}
                        </div>
                    </div>
                    <div className="overflow-clip rounded-b-2xl lg:rounded-2xl">
                        <div key={`${mobileLevel}:${sectionKey}:${optionKey}`} data-direction={direction} className={twMerge(styles.pageTransition, "grid min-h-[min(65dvh,32rem)] w-full items-stretch lg:min-h-[calc(100dvh-10.5rem)] lg:grid-cols-[240px_290px_minmax(0,1fr)]")}>
                            <aside data-settings-panel="sections" className={twMerge("border-j-gray-200 bg-j-blue-800 p-3 lg:block lg:border-r", mobileLevel !== "sections" && "hidden")}>
                                <div className="px-3 pb-4 pt-2 text-j-white">
                                    <h2 tabIndex={-1} className="text-base font-black outline-none">Configurações</h2>
                                    <p className="mt-1 text-xs text-j-white/60">Escolha uma categoria</p>
                                </div>
                                <nav aria-label="Categorias de configurações" className="space-y-1">
                                    {SECTIONS.map((item) => {
                                        const Icon = item.icon;
                                        const active = item.key === sectionKey;
                                        return (
                                            <button key={item.key} data-settings-key={item.key} aria-current={active ? "true" : undefined} type="button" onClick={() => chooseSection(item)} className={twMerge(styles.navigationButton, "flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left", active ? "bg-j-yellow-300 text-j-blue-800" : "text-j-white/75 hover:bg-j-blue-700 hover:text-j-white")}>
                                                <Icon size={18} className="shrink-0" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{item.label}</span><span className={twMerge("block truncate text-[11px]", active ? "text-j-blue-700" : "text-j-white/65")}>{item.description}</span></span><ChevronRight size={15} className="shrink-0" />
                                            </button>
                                        );
                                    })}
                                </nav>
                            </aside>

                            <aside data-settings-panel="options" className={twMerge("border-j-gray-200 bg-j-gray-100/50 p-3 lg:block lg:border-r", mobileLevel !== "options" && "hidden")}>
                                <div className="px-2 pb-3 pt-1">
                                    <h2 tabIndex={-1} className="text-sm font-extrabold text-j-gray-700 outline-none">{section.label}</h2>
                                    <p className="mt-1 text-xs text-j-gray-400">Selecione o que deseja configurar</p>
                                </div>
                                <nav aria-label={section.label} className="space-y-2">
                                    {section.options.map((item) => {
                                        const Icon = item.icon;
                                        const active = item.key === option.key;
                                        return (
                                            <button key={item.key} data-settings-key={item.key} aria-current={active ? "true" : undefined} type="button" onClick={() => chooseOption(item)} className={twMerge(styles.navigationButton, "flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors", active ? "border-j-blue-800 bg-j-white text-j-blue-800 shadow-sm" : "border-transparent text-j-gray-600 hover:border-j-gray-200 hover:bg-j-white")}>
                                                <Icon size={18} className="shrink-0" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{item.label}</span><span className="block text-xs text-j-gray-500">{item.description}</span></span><ChevronRight size={15} className="shrink-0" />
                                            </button>
                                        );
                                    })}
                                </nav>
                            </aside>

                            <section data-settings-panel="editor" aria-label={option.label} className={twMerge("min-w-0 flex-col bg-j-white lg:block", mobileLevel === "editor" ? "flex" : "hidden")}>
                                {renderEditorHeader()}
                                {renderEditorContent()}
                                {showSave && <footer className={twMerge(styles.saveBar, "sticky bottom-0 z-10 mt-auto flex justify-end border-t border-j-gray-200 bg-j-white/95 px-5 py-4 backdrop-blur-sm lg:static lg:bg-j-gray-100/50")}><Button type="button" onClick={save} className="gap-2"><Save size={16} />Salvar alterações</Button></footer>}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
