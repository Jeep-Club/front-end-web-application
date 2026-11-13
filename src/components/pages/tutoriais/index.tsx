"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Car,
    Compass,
    HeartPulse,
    HelpCircle,
    KeyRound,
    Newspaper,
    Play,
    RotateCcw,
    ShieldCheck,
    Sparkles,
    User,
    UserRoundCheck,
    Users,
    WalletCards,
    Wrench,
    type LucideIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components/common/button";
import { InputSearch } from "@/components/common/input/input-search";
import { PageHeader } from "@/components/common/page-header";
import TourHelpButton from "@/components/common/tour/TourHelpButton";
import { adminModules, canAccessAdminModule } from "@/config/adminModules";
import {
    getAdminPanelTourSteps,
    getDependentsTourSteps,
    getFeedTourSteps,
    getFinancialTourSteps,
    getHomeTourSteps,
    getMedicalProfilesTourSteps,
    getMembershipApplicationsTourSteps,
    getPaymentsTourSteps,
    getProfileTourSteps,
    getPublicationsTourSteps,
    getRolesTourSteps,
    getToolsTourSteps,
    getTutorialsPageTourSteps,
    getUsersTourSteps,
    getVehiclesTourSteps,
} from "@/config/tourSteps";
import { requestTourStart, usePageTour } from "@/hooks/useTour";
import { useUserStore } from "@/stores/userStore";

export type TutorialCategory = "all" | "member" | "admin";

export interface TutorialCatalogItem {
    id: string;
    title: string;
    description: string;
    category: Exclude<TutorialCategory, "all">;
    categoryLabel: string;
    href: string;
    storageKey: string;
    stepCount: number;
    icon: LucideIcon;
    adminModuleKey?: string;
    topics: string[];
    keywords: string[];
}

const STOP_WORDS = new Set([
    "a",
    "as",
    "o",
    "os",
    "de",
    "do",
    "da",
    "dos",
    "das",
    "em",
    "no",
    "na",
    "nos",
    "nas",
    "um",
    "uma",
    "para",
    "por",
    "com",
    "como",
    "que",
    "qual",
    "onde",
    "eu",
    "meu",
    "minha",
    "faco",
    "fazer",
    "ver",
    "sobre",
]);

export function normalizeTutorialText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export const TUTORIAL_CATALOG: TutorialCatalogItem[] = [
    {
        id: "feed-home",
        title: "Home e Mural do Clube",
        description:
            "Navegue pelas publicações, filtre por avisos e eventos, comente, curta e confirme sua participação.",
        category: "member",
        categoryLabel: "Membro",
        href: "/feed",
        storageKey: "tour_completed_feed",
        stepCount: getFeedTourSteps(false).length,
        icon: Compass,
        topics: [
            "Filtros de publicações",
            "Criar nova postagem",
            "Curtidas e comentários",
            "Eventos e agenda",
        ],
        keywords: [
            "home",
            "mural",
            "feed",
            "inicio",
            "publicacoes",
            "avisos",
            "eventos",
            "servicos",
            "presenca",
            "curtir",
            "comentar",
        ],
    },
    {
        id: "profile-account",
        title: "Perfil e Minha Conta",
        description:
            "Gerencie seus dados pessoais, ficha médica de trilha, dependentes, veículos 4x4 e ferramentas de apoio.",
        category: "member",
        categoryLabel: "Membro",
        href: "/profile",
        storageKey: "tour_completed_profile",
        stepCount: getProfileTourSteps(false).length,
        icon: User,
        topics: [
            "Dados cadastrais",
            "Ficha médica de emergência",
            "Dependentes",
            "Meus veículos e ferramentas",
        ],
        keywords: [
            "perfil",
            "conta",
            "dados pessoais",
            "ficha medica",
            "saude",
            "dependentes",
            "meu veiculo",
            "meu jeep",
            "minhas ferramentas",
        ],
    },
    {
        id: "public-landing-home",
        title: "Página Inicial Pública",
        description:
            "Apresentação do clube para visitantes, história, experiências off-road e formulário de associação.",
        category: "member",
        categoryLabel: "Membro",
        href: "/",
        storageKey: "tour_completed_home",
        stepCount: getHomeTourSteps().length,
        icon: Sparkles,
        topics: [
            "Área do sócio",
            "Quero ser sócio",
            "Trilhas e legado",
        ],
        keywords: [
            "landing page",
            "pagina publica",
            "quero ser socio",
            "historia",
            "trilhas",
        ],
    },
    {
        id: "tutorials-hub",
        title: "Central de Tutoriais",
        description:
            "Aprenda como buscar tópicos de ajuda, filtrar categorias e iniciar tutoriais guiados em qualquer tela.",
        category: "member",
        categoryLabel: "Membro",
        href: "/tutoriais",
        storageKey: "tour_completed_tutorials_page",
        stepCount: getTutorialsPageTourSteps(false).length,
        icon: HelpCircle,
        topics: [
            "Barra de busca",
            "Categorias",
            "Botão de ajuda no cabeçalho",
        ],
        keywords: [
            "ajuda",
            "duvida",
            "tutoriais",
            "como funciona",
        ],
    },
    {
        id: "admin-panel",
        title: "Painel Administrativo",
        description:
            "Visão geral dos módulos de gestão, busca rápida e atalho para fixar seus módulos favoritos na barra lateral.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin",
        storageKey: "tour_completed_admin_panel",
        stepCount: getAdminPanelTourSteps(false).length,
        icon: ShieldCheck,
        topics: [
            "Módulos autorizados",
            "Favoritos na barra lateral",
            "Acesso rápido",
        ],
        keywords: [
            "admin",
            "painel administrativo",
            "favoritar",
            "estrela",
            "modulos",
        ],
    },
    {
        id: "admin-publications",
        title: "Gestão de Publicações",
        description:
            "Crie, revise, publique, arquive e gerencie avisos, eventos oficiais e divulgação de serviços.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/gestao-publicacoes",
        storageKey: "tour_completed_admin_publications",
        stepCount: getPublicationsTourSteps(false).length,
        icon: Newspaper,
        adminModuleKey: "publication-management",
        topics: [
            "Criar evento ou aviso",
            "Rascunhos e publicados",
            "Ações editoriais",
        ],
        keywords: [
            "publicacoes",
            "criar evento",
            "publicar aviso",
            "rascunho",
            "arquivar",
        ],
    },
    {
        id: "admin-users",
        title: "Gestão de Usuários",
        description:
            "Consulte associados por nome, CPF ou e-mail, cadastre novos membros e ative ou desative contas.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/users",
        storageKey: "tour_completed_admin_users",
        stepCount: getUsersTourSteps(false).length,
        icon: Users,
        adminModuleKey: "users",
        topics: [
            "Busca por CPF e nome",
            "Status da conta",
            "Novo usuário",
        ],
        keywords: [
            "usuarios",
            "membros",
            "associados",
            "cadastrar usuario",
            "desativar",
            "cpf",
        ],
    },
    {
        id: "admin-membership-applications",
        title: "Solicitações de Associação",
        description:
            "Analise pedidos de novos sócios, leia a carta de apresentação e aprove gerando senha para WhatsApp ou convite por e-mail.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/users?tab=applications",
        storageKey: "tour_completed_admin_applications",
        stepCount: getMembershipApplicationsTourSteps(false).length,
        icon: UserRoundCheck,
        adminModuleKey: "membership-applications",
        topics: [
            "Ficha e carta de apresentação",
            "Aprovar gerando senha",
            "Rejeitar ou bloquear CPF",
        ],
        keywords: [
            "solicitacoes",
            "novos socios",
            "aprovar socio",
            "adesao",
            "senha provisoria",
            "bloquear cpf",
        ],
    },
    {
        id: "admin-roles-permissions",
        title: "Cargos e permissões",
        description:
            "Configure cargos personalizados, níveis de acesso e permissões granulares por módulo para os administradores.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/roles-permissoes",
        storageKey: "tour_completed_admin_roles",
        stepCount: getRolesTourSteps(false).length,
        icon: KeyRound,
        adminModuleKey: "roles-permissions",
        topics: [
            "Cargos cadastrados",
            "Permissões por módulo",
            "Atribuições de usuários",
        ],
        keywords: [
            "roles",
            "permissoes",
            "cargos",
            "acessos",
            "rbac",
            "autorizacao",
        ],
    },
    {
        id: "admin-payments",
        title: "Pagamentos e comprovantes",
        description:
            "Consulte comprovantes enviados pelos associados e aprove ou rejeite pagamentos de mensalidades e eventos.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/gestao-financeira/movimentacoes?movement=analysis",
        storageKey: "tour_completed_admin_payments",
        stepCount: getPaymentsTourSteps(false).length,
        icon: WalletCards,
        adminModuleKey: "financial-movements",
        topics: [
            "Pagamentos pendentes",
            "Conferir comprovante",
            "Confirmar ou rejeitar",
        ],
        keywords: [
            "pagamentos",
            "comprovante",
            "validar pagamento",
            "confirmar",
            "rejeitar",
            "pix",
        ],
    },
    {
        id: "admin-financial",
        title: "Gestão Financeira",
        description:
            "Acompanhe o painel financeiro, defina regras de cobrança, gere ciclos mensais e gerencie faturas e reembolsos.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/gestao-financeira",
        storageKey: "tour_completed_admin_financial",
        stepCount: getFinancialTourSteps(false).length,
        icon: WalletCards,
        adminModuleKey: "financial-overview",
        topics: [
            "Dashboard financeiro",
            "Definições e ciclos",
            "Cobranças e reembolsos",
        ],
        keywords: [
            "financeiro",
            "cobrancas",
            "mensalidades",
            "ciclos",
            "faturas",
            "reembolso",
        ],
    },
    {
        id: "admin-medical-profiles",
        title: "Gestão de Dados Médicos",
        description:
            "Consulte dados médicos de associados e dependentes para suporte em trilhas e exporte relatórios em PDF ou CSV.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/dados-medicos",
        storageKey: "tour_completed_admin_medical",
        stepCount: getMedicalProfilesTourSteps(false).length,
        icon: HeartPulse,
        adminModuleKey: "medical-profiles",
        topics: [
            "Fichas médicas de emergência",
            "Exportação em PDF/CSV",
            "Histórico de atualizações",
        ],
        keywords: [
            "dados medicos",
            "ficha medica",
            "saude",
            "emergencia",
            "exportar pdf",
        ],
    },
    {
        id: "admin-vehicles",
        title: "Gestão de Veículos",
        description:
            "Administre a frota de 4x4 do clube, consulte placas, modelos, proprietários e fotos dos veículos.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/veiculos",
        storageKey: "tour_completed_admin_vehicles",
        stepCount: getVehiclesTourSteps(false).length,
        icon: Car,
        adminModuleKey: "vehicles",
        topics: [
            "Frota de veículos 4x4",
            "Fotos e placas",
            "Cadastrar e editar veículos",
        ],
        keywords: [
            "veiculos",
            "frota",
            "4x4",
            "jeep",
            "placa",
            "cadastrar carro",
        ],
    },
    {
        id: "admin-tools",
        title: "Gestão de Ferramentas",
        description:
            "Acompanhe o catálogo de ferramentas e equipamentos de resgate cadastrados pelos associados.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/ferramentas",
        storageKey: "tour_completed_admin_tools",
        stepCount: getToolsTourSteps(false).length,
        icon: Wrench,
        adminModuleKey: "tools",
        topics: [
            "Catálogo de equipamentos",
            "Resgate e apoio off-road",
            "Ativar e desativar status",
        ],
        keywords: [
            "ferramentas",
            "equipamentos",
            "resgate",
            "guincho",
            "cinta",
        ],
    },
    {
        id: "admin-dependents",
        title: "Gestão de Dependentes",
        description:
            "Consulte dependentes de todos os associados, gerencie fotos privadas 3x4, status operacional e exporte relatórios.",
        category: "admin",
        categoryLabel: "Administração",
        href: "/admin/dependentes",
        storageKey: "tour_completed_admin_dependents",
        stepCount: getDependentsTourSteps(false).length,
        icon: Users,
        adminModuleKey: "dependents",
        topics: [
            "Busca por titular, nome e CPF",
            "Fotos 3x4 e ciclo de vida",
            "Exportação CSV/PDF e histórico",
        ],
        keywords: [
            "dependentes",
            "familiares",
            "filhos",
            "conjuge",
            "convidados",
            "titular",
        ],
    },
];

/**
 * Retorna os tutoriais disponíveis para o usuário conforme suas permissões
 * e filtra/ordena pelo termo ou dúvida pesquisada e categoria selecionada.
 */
export function filterTutorials(
    catalog: TutorialCatalogItem[],
    permissions: PermissionModule[],
    searchQuery: string,
    category: TutorialCategory = "all",
): TutorialCatalogItem[] {
    const accessible = catalog.filter((item) => {
        if (item.category !== "admin") return true;
        if (!item.adminModuleKey) {
            return adminModules.some((mod) =>
                canAccessAdminModule(permissions, mod),
            );
        }
        const moduleConfig = adminModules.find(
            (mod) => mod.key === item.adminModuleKey,
        );
        if (!moduleConfig) return false;
        return canAccessAdminModule(permissions, moduleConfig);
    });

    const byCategory =
        category === "all"
            ? accessible
            : accessible.filter((item) => item.category === category);

    const normalizedQuery = normalizeTutorialText(searchQuery);
    if (!normalizedQuery) {
        return byCategory;
    }

    const rawTokens = normalizedQuery.split(" ").filter(Boolean);
    const meaningfulTokens = rawTokens.filter(
        (token) => token.length > 1 && !STOP_WORDS.has(token),
    );
    const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

    const scored = byCategory
        .map((item) => {
            const titleNorm = normalizeTutorialText(item.title);
            const descNorm = normalizeTutorialText(item.description);
            const topicsNorm = normalizeTutorialText(item.topics.join(" "));
            const keywordsNorm = normalizeTutorialText(item.keywords.join(" "));
            const fullText = `${titleNorm} ${descNorm} ${topicsNorm} ${keywordsNorm}`;

            let score = 0;

            if (titleNorm.includes(normalizedQuery)) score += 12;
            if (keywordsNorm.includes(normalizedQuery)) score += 10;
            if (topicsNorm.includes(normalizedQuery)) score += 8;
            if (descNorm.includes(normalizedQuery)) score += 6;

            let matchedTokens = 0;
            for (const token of tokens) {
                if (titleNorm.includes(token)) {
                    score += 5;
                    matchedTokens++;
                } else if (keywordsNorm.includes(token)) {
                    score += 4;
                    matchedTokens++;
                } else if (topicsNorm.includes(token)) {
                    score += 3;
                    matchedTokens++;
                } else if (fullText.includes(token)) {
                    score += 2;
                    matchedTokens++;
                }
            }

            const allMatched = matchedTokens === tokens.length;
            const minRequired =
                tokens.length <= 2 ? tokens.length : Math.ceil(tokens.length * 0.6);

            if (matchedTokens < minRequired) {
                return { item, score: 0 };
            }

            if (allMatched) {
                score += 4;
            }

            return { item, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.map((entry) => entry.item);
}

export default function TutorialsPageContent() {
    const router = useRouter();
    const permissions = useUserStore((state) => state.permissions);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] =
        useState<TutorialCategory>("all");

    const { restartTour } = usePageTour({
        storageKey: "tour_completed_tutorials_page",
        steps: getTutorialsPageTourSteps,
        autoStartOnFirstVisit: false,
        enabled: true,
    });

    const accessibleAll = useMemo(
        () => filterTutorials(TUTORIAL_CATALOG, permissions, "", "all"),
        [permissions],
    );

    const memberCount = useMemo(
        () => accessibleAll.filter((item) => item.category === "member").length,
        [accessibleAll],
    );

    const adminCount = useMemo(
        () => accessibleAll.filter((item) => item.category === "admin").length,
        [accessibleAll],
    );

    const results = useMemo(
        () =>
            filterTutorials(
                TUTORIAL_CATALOG,
                permissions,
                searchQuery,
                selectedCategory,
            ),
        [permissions, searchQuery, selectedCategory],
    );

    const handleStartTutorial = (tutorial: TutorialCatalogItem) => {
        if (tutorial.id === "tutorials-hub") {
            restartTour();
            return;
        }
        requestTourStart(tutorial.storageKey);
        router.push(tutorial.href);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSelectedCategory("all");
    };

    return (
        <div className="min-h-full w-full p-3 pb-10 md:p-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <PageHeader
                    id="tour-tutorials-header"
                    title="Tutoriais"
                    breadcrumbs={[
                        { label: "Home", href: "/feed" },
                        { label: "Tutoriais" },
                    ]}
                    actions={
                        <TourHelpButton
                            id="tour-tutorials-help-btn"
                            onClick={restartTour}
                            label="Como usar?"
                            className="w-full justify-center sm:w-auto"
                        />
                    }
                />

                {/* Barra de Pesquisa e Filtros Rápidos */}
                <div className="flex flex-col gap-3">
                    <div id="tour-tutorials-search" className="w-full">
                        <InputSearch
                            value={searchQuery}
                            onSubmit={setSearchQuery}
                            submitOnChange
                            label="Pesquisar tutorial"
                            placeholder="Buscar tutorial por dúvida, tela ou funcionalidade..."
                            className="h-11 rounded-xl border border-j-gray-300 bg-j-white text-sm text-j-gray-800 shadow-xs focus:border-j-blue-800"
                        />
                    </div>

                    {/* Abas de Categorias Simplificadas */}
                    <div
                        id="tour-tutorials-categories"
                        role="tablist"
                        aria-label="Filtrar por categoria"
                        className="flex flex-wrap items-center gap-2"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={selectedCategory === "all"}
                            onClick={() => setSelectedCategory("all")}
                            className={twMerge(
                                "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors",
                                selectedCategory === "all"
                                    ? "bg-j-blue-800 text-j-white shadow-xs"
                                    : "bg-j-white text-j-gray-600 border border-j-gray-200 hover:text-j-blue-800",
                            )}
                        >
                            Todos
                            <span
                                className={twMerge(
                                    "rounded-full px-1.5 py-0.2 text-[10px]",
                                    selectedCategory === "all"
                                        ? "bg-j-white/20 text-j-white"
                                        : "bg-j-gray-100 text-j-gray-600",
                                )}
                            >
                                {accessibleAll.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={selectedCategory === "member"}
                            onClick={() => setSelectedCategory("member")}
                            className={twMerge(
                                "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors",
                                selectedCategory === "member"
                                    ? "bg-j-blue-800 text-j-white shadow-xs"
                                    : "bg-j-white text-j-gray-600 border border-j-gray-200 hover:text-j-blue-800",
                            )}
                        >
                            Membro
                            <span
                                className={twMerge(
                                    "rounded-full px-1.5 py-0.2 text-[10px]",
                                    selectedCategory === "member"
                                        ? "bg-j-white/20 text-j-white"
                                        : "bg-j-gray-100 text-j-gray-600",
                                )}
                            >
                                {memberCount}
                            </span>
                        </button>

                        {adminCount > 0 && (
                            <button
                                type="button"
                                role="tab"
                                aria-selected={selectedCategory === "admin"}
                                onClick={() => setSelectedCategory("admin")}
                                className={twMerge(
                                    "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors",
                                    selectedCategory === "admin"
                                        ? "bg-j-blue-800 text-j-white shadow-xs"
                                        : "bg-j-white text-j-gray-600 border border-j-gray-200 hover:text-j-blue-800",
                                )}
                            >
                                Administração
                                <span
                                    className={twMerge(
                                        "rounded-full px-1.5 py-0.2 text-[10px]",
                                        selectedCategory === "admin"
                                            ? "bg-j-white/20 text-j-white"
                                            : "bg-j-gray-100 text-j-gray-600",
                                    )}
                                >
                                    {adminCount}
                                </span>
                            </button>
                        )}

                        {(searchQuery.trim() || selectedCategory !== "all") && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-j-gray-500 hover:text-j-blue-800"
                            >
                                <RotateCcw size={13} aria-hidden="true" />
                                Limpar
                            </button>
                        )}
                    </div>
                </div>

                {/* Grade de Resultados Limpa */}
                <section
                    id="tour-tutorials-results"
                    aria-label="Resultados de tutoriais"
                    className="flex flex-col gap-4"
                >
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {results.map((tutorial, index) => {
                                const Icon = tutorial.icon;
                                const isAdmin = tutorial.category === "admin";

                                return (
                                    <article
                                        key={tutorial.id}
                                        className="flex flex-col justify-between rounded-xl border border-j-gray-200 bg-j-white p-4 shadow-xs transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex flex-col gap-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-j-blue-800 text-j-yellow-300">
                                                    <Icon
                                                        size={20}
                                                        aria-hidden="true"
                                                    />
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={twMerge(
                                                            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                                                            isAdmin
                                                                ? "bg-j-yellow-300/30 text-j-blue-900"
                                                                : "bg-blue-50 text-j-blue-800",
                                                        )}
                                                    >
                                                        {tutorial.categoryLabel}
                                                    </span>
                                                    <span className="rounded-md bg-j-gray-100 px-2 py-0.5 text-[10px] font-bold text-j-gray-500">
                                                        {tutorial.stepCount} passos
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-base font-bold text-j-blue-800">
                                                    {tutorial.title}
                                                </h3>
                                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-j-gray-600">
                                                    {tutorial.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-j-gray-100 pt-3">
                                            <button
                                                id={
                                                    index === 0
                                                        ? "tour-tutorials-start-btn"
                                                        : undefined
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleStartTutorial(tutorial)
                                                }
                                                className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-j-yellow-300 px-3 text-xs font-black uppercase tracking-wide text-j-blue-900 transition-colors hover:bg-j-yellow-400 focus-visible:outline-2 focus-visible:outline-j-blue-800"
                                            >
                                                <Play
                                                    size={14}
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                />
                                                Iniciar tutorial
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div
                            role="status"
                            className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-j-gray-300 bg-j-white p-6 text-center"
                        >
                            <HelpCircle size={28} className="text-j-gray-400" aria-hidden="true" />
                            <h3 className="mt-3 text-base font-bold text-j-blue-800">
                                Nenhum tutorial encontrado
                            </h3>
                            <p className="mt-1 text-xs text-j-gray-500">
                                Não encontramos resultados para &ldquo;{searchQuery}&rdquo;.
                            </p>
                            <Button
                                type="button"
                                onClick={handleClearSearch}
                                className="mt-3 h-9 px-3 text-xs"
                            >
                                Limpar busca
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
