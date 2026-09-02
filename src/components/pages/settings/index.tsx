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
import { useState } from "react";
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
type Theme = "light" | "dark" | "system";

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
                    "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors",
                    checked ? "bg-j-blue-800" : "bg-j-gray-300",
                )}
            >
                <span className={twMerge(
                    "absolute left-1 top-1 h-4 w-4 rounded-full bg-j-white shadow-sm transition-transform",
                    checked ? "translate-x-5" : "translate-x-1",
                )} />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const [sectionKey, setSectionKey] = useState<SectionKey>("account");
    const [optionKey, setOptionKey] = useState<OptionKey>("personal-data");
    const [mobileLevel, setMobileLevel] = useState<MobileLevel>("sections");
    const [theme, setTheme] = useState<Theme>("system");
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

    function chooseSection(nextSection: SettingSection) {
        setSectionKey(nextSection.key);
        setOptionKey(nextSection.options[0].key);
        setMobileLevel("options");
    }

    function chooseOption(nextOption: SettingOption) {
        setOptionKey(nextOption.key);
        setMobileLevel("editor");
    }

    function toggle(key: keyof typeof preferences) {
        setPreferences((current) => ({ ...current, [key]: !current[key] }));
    }

    function save() {
        toast.success("Preferências salvas neste protótipo.");
    }

    function renderEditorHeader() {
        const Icon = option.icon;
        return (
            <header className="border-b border-j-gray-200 px-5 py-4">
                <button
                    type="button"
                    onClick={() => setMobileLevel("options")}
                    className="mb-3 flex cursor-pointer items-center gap-2 text-xs font-bold text-j-blue-800 lg:hidden"
                >
                    <ArrowLeft size={16} />
                    Voltar para {section.label}
                </button>
                <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-j-blue-50 p-2.5 text-j-blue-800"><Icon size={20} /></span>
                    <div>
                        <h2 className="text-base font-extrabold text-j-gray-700">{option.label}</h2>
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
                        <p className="text-sm leading-relaxed text-j-gray-500">Cobranças, mensalidades, pagamentos e comprovantes ficam no módulo financeiro.</p>
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
                            <button key={value} type="button" onClick={() => setTheme(value)} className={twMerge("flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-5 text-sm font-bold", theme === value ? "border-j-blue-800 bg-j-blue-50 text-j-blue-800" : "border-j-gray-200 text-j-gray-500")}>
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
                <PageHeader title="Configurações" breadcrumbs={[{ label: "Início", href: "/feed" }, { label: "Configurações" }]} />

                <div className="grid min-h-[calc(100vh-10.5rem)] w-full items-stretch overflow-hidden rounded-xl border border-j-gray-200 bg-j-white shadow-sm lg:grid-cols-[240px_290px_minmax(0,1fr)]">
                    <aside className={twMerge("border-j-gray-200 bg-j-blue-800 p-3 lg:block lg:border-r", mobileLevel !== "sections" && "hidden")}>
                        <div className="px-3 pb-4 pt-2 text-j-white">
                            <p className="text-base font-black">Configurações</p>
                            <p className="mt-1 text-xs text-j-white/60">Escolha uma categoria</p>
                        </div>
                        <nav className="space-y-1">
                            {SECTIONS.map((item) => {
                                const Icon = item.icon;
                                const active = item.key === sectionKey;
                                return (
                                    <button key={item.key} type="button" onClick={() => chooseSection(item)} className={twMerge("flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left", active ? "bg-j-yellow-300 text-j-blue-800" : "text-j-white/75 hover:bg-j-blue-700 hover:text-j-white")}>
                                        <Icon size={18} /><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{item.label}</span><span className={twMerge("block truncate text-[11px]", active ? "text-j-blue-700" : "text-j-white/45")}>{item.description}</span></span><ChevronRight size={15} />
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <aside className={twMerge("border-j-gray-200 bg-j-gray-100/50 p-3 lg:block lg:border-r", mobileLevel !== "options" && "hidden")}>
                        <button type="button" onClick={() => setMobileLevel("sections")} className="mb-3 flex cursor-pointer items-center gap-2 px-2 pt-1 text-xs font-bold text-j-blue-800 lg:hidden"><ArrowLeft size={16} />Voltar às categorias</button>
                        <div className="px-2 pb-3 pt-1">
                            <p className="text-sm font-extrabold text-j-gray-700">{section.label}</p>
                            <p className="mt-1 text-xs text-j-gray-400">Selecione o que deseja configurar</p>
                        </div>
                        <nav className="space-y-2">
                            {section.options.map((item) => {
                                const Icon = item.icon;
                                const active = item.key === option.key;
                                return (
                                    <button key={item.key} type="button" onClick={() => chooseOption(item)} className={twMerge("flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors", active ? "border-j-blue-800 bg-j-white text-j-blue-800 shadow-sm" : "border-transparent text-j-gray-600 hover:border-j-gray-200 hover:bg-j-white")}>
                                        <Icon size={18} /><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{item.label}</span><span className="block text-[11px] text-j-gray-400">{item.description}</span></span><ChevronRight size={15} />
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <main className={twMerge("min-w-0 bg-j-white lg:block", mobileLevel !== "editor" && "hidden")}>
                        {renderEditorHeader()}
                        {renderEditorContent()}
                        {showSave && <footer className="flex justify-end border-t border-j-gray-200 bg-j-gray-100/50 px-5 py-4"><Button type="button" onClick={save} className="gap-2"><Save size={16} />Salvar alterações</Button></footer>}
                    </main>
                </div>
            </div>
        </div>
    );
}
