"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CalendarDays,
    Car,
    CheckCircle2,
    Compass,
    HeartPulse,
    HelpCircle,
    KeyRound,
    Newspaper,
    Play,
    ReceiptText,
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
import { TutorialImageViewerModal } from "@/components/pages/tutoriais/TutorialImageViewerModal";
import { adminModules, canAccessAdminModule } from "@/config/adminModules";
import {
    MEMBER_VISUAL_GUIDES,
    type TutorialImageStep,
} from "@/config/tutorialVisualGuides";
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
    imageSteps?: TutorialImageStep[];
    supportsLiveTour?: boolean;
}

const STOP_WORDS = new Set([
    "a",
    "as",
    "o",
    "os",
    "ao",
    "aos",
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
    "num",
    "numa",
    "nuns",
    "numas",
    "um",
    "uma",
    "uns",
    "umas",
    "para",
    "pra",
    "pro",
    "pras",
    "pros",
    "por",
    "com",
    "sem",
    "ou",
    "nem",
    "ja",
    "so",
    "mais",
    "muito",
    "muita",
    "muitos",
    "muitas",
    "tambem",
    "como",
    "que",
    "qual",
    "quais",
    "onde",
    "aonde",
    "adonde",
    "donde",
    "quando",
    "quanto",
    "quantos",
    "quanta",
    "quantas",
    "porque",
    "pq",
    "quem",
    "eu",
    "voce",
    "me",
    "te",
    "se",
    "lhe",
    "lhes",
    "meu",
    "minha",
    "meus",
    "minhas",
    "seu",
    "sua",
    "seus",
    "suas",
    "deste",
    "desta",
    "destes",
    "destas",
    "disso",
    "disto",
    "neste",
    "nesta",
    "nestes",
    "nestas",
    "nisso",
    "nisto",
    "esse",
    "essa",
    "esses",
    "essas",
    "isso",
    "este",
    "esta",
    "estes",
    "estas",
    "isto",
    "aquele",
    "aquela",
    "aqueles",
    "aquelas",
    "aquilo",
    "faco",
    "fazer",
    "quero",
    "preciso",
    "gostaria",
    "posso",
    "pode",
    "podemos",
    "poderia",
    "consigo",
    "consegue",
    "conseguimos",
    "conseguir",
    "sobre",
    "aqui",
    "la",
    "ali",
    "fica",
    "ficam",
    "ficar",
    "tem",
    "ter",
    "esta",
    "estao",
    "ser",
    "ir",
    "vou",
    "vai",
    "pelo",
    "pela",
    "pelos",
    "pelas",
    "ola",
    "oi",
    "opa",
    "favor",
    "pfv",
    "porfavor",
    "sabe",
    "saber",
    "sei",
    "alguem",
    "coisa",
    "tudo",
    "ajuda",
    "duvida",
    "duvidas",
]);

/**
 * Verbos de ação/intenção comuns em perguntas naturais ("como eu cadastro...", "onde vejo...").
 * Eles somam pontos quando aparecem no tutorial, mas não bloqueiam o resultado se o
 * substantivo/assunto principal da dúvida for encontrado.
 */
const INTENT_VERBS = new Set([
    "cadastrar",
    "cadastro",
    "cadastra",
    "cadastrei",
    "cadastrando",
    "adicionar",
    "adiciono",
    "adiciona",
    "adicionando",
    "incluir",
    "incluo",
    "inclui",
    "colocar",
    "coloco",
    "coloca",
    "botar",
    "boto",
    "bota",
    "criar",
    "crio",
    "cria",
    "registrar",
    "registro",
    "registra",
    "inserir",
    "insiro",
    "insere",
    "atualizar",
    "atualizo",
    "atualiza",
    "editar",
    "edito",
    "edita",
    "alterar",
    "altero",
    "altera",
    "mudar",
    "mudo",
    "muda",
    "trocar",
    "troco",
    "troca",
    "modificar",
    "corrigir",
    "ver",
    "vejo",
    "ve",
    "visualizar",
    "consultar",
    "consulto",
    "consulta",
    "encontrar",
    "encontro",
    "encontra",
    "achar",
    "acho",
    "acha",
    "buscar",
    "busco",
    "busca",
    "procurar",
    "procuro",
    "procura",
    "olhar",
    "olho",
    "olha",
    "acessar",
    "acesso",
    "acessa",
    "abrir",
    "abro",
    "abre",
    "entrar",
    "entro",
    "entra",
    "excluir",
    "excluo",
    "exclui",
    "apagar",
    "apago",
    "apaga",
    "remover",
    "removo",
    "remove",
    "deletar",
    "deleto",
    "deleta",
    "cancelar",
    "cancelo",
    "cancela",
    "desativar",
    "ativar",
    "gerenciar",
    "gerencio",
    "gerencia",
    "administrar",
    "configurar",
    "enviar",
    "envio",
    "envia",
    "mandar",
    "mando",
    "manda",
    "baixar",
    "exportar",
    "imprimir",
    "confirmar",
    "validar",
    "aprovar",
    "rejeitar",
]);

/**
 * Mapa de sinônimos do domínio do clube para expandir termos coloquiais
 * digitados pelos associados para os termos equivalentes do catálogo.
 */
const SYNONYM_MAP: Record<string, string[]> = {
    carro: ["veiculo", "jeep", "4x4", "frota", "automovel"],
    carros: ["veiculos", "jeep", "4x4", "frota"],
    jipe: ["veiculo", "jeep", "4x4", "frota"],
    jipes: ["veiculos", "jeep", "4x4", "frota"],
    jeep: ["veiculo", "4x4", "frota"],
    caminhonete: ["veiculo", "jeep", "4x4", "frota"],
    camionete: ["veiculo", "jeep", "4x4", "frota"],
    "4x4": ["veiculo", "jeep", "frota"],
    veiculo: ["carro", "jeep", "4x4", "frota"],
    veiculos: ["carros", "jeep", "4x4", "frota"],
    placa: ["veiculo", "frota", "4x4"],
    medico: ["ficha", "medica", "saude", "emergencia", "sangue", "alergia"],
    medica: ["ficha", "medico", "saude", "emergencia", "sangue", "alergia"],
    saude: ["ficha", "medica", "emergencia", "sangue", "alergia"],
    sangue: ["ficha", "medica", "saude", "emergencia", "sanguineo"],
    alergia: ["ficha", "medica", "saude", "emergencia"],
    remedio: ["ficha", "medica", "saude", "emergencia", "medicamento"],
    remedios: ["ficha", "medica", "saude", "emergencia", "medicamentos"],
    medicamento: ["ficha", "medica", "saude", "emergencia"],
    emergencia: ["ficha", "medica", "saude"],
    filho: ["dependente", "dependentes", "familia", "familiar"],
    filha: ["dependente", "dependentes", "familia", "familiar"],
    filhos: ["dependente", "dependentes", "familia", "familiar"],
    esposa: ["dependente", "dependentes", "familia", "familiar"],
    marido: ["dependente", "dependentes", "familia", "familiar"],
    conjuge: ["dependente", "dependentes", "familia", "familiar"],
    familia: ["dependente", "dependentes", "familiar"],
    dependente: ["dependentes", "familia", "perfil"],
    boleto: ["pagamento", "cobranca", "mensalidade", "fatura", "financeiro"],
    pix: ["pagamento", "comprovante", "mensalidade", "financeiro"],
    recibo: ["comprovante", "pagamento", "mensalidade"],
    fatura: ["cobranca", "mensalidade", "pagamento", "financeiro"],
    mensalidade: ["pagamento", "cobranca", "fatura", "financeiro"],
    pagar: ["pagamento", "comprovante", "mensalidade", "fatura"],
    guincho: ["ferramenta", "ferramentas", "equipamento", "resgate", "manilha"],
    cinta: ["ferramenta", "ferramentas", "equipamento", "resgate", "manilha"],
    manilha: ["ferramenta", "ferramentas", "equipamento", "resgate"],
    resgate: ["ferramenta", "ferramentas", "equipamento", "guincho"],
    equipamento: ["ferramenta", "ferramentas", "resgate"],
    equipamentos: ["ferramenta", "ferramentas", "resgate"],
    trilha: ["evento", "eventos", "passeio", "expedicao", "mural", "agenda", "calendario"],
    passeio: ["evento", "eventos", "trilha", "mural", "agenda", "calendario"],
    inscricao: ["evento", "eventos", "participar", "presenca", "convidado"],
    participar: ["evento", "eventos", "inscricao", "presenca"],
    convidado: ["evento", "eventos", "inscricao", "participar"],
    calendario: ["agenda", "eventos", "datas", "mes"],
    data: ["agenda", "calendario", "eventos", "vencimento"],
    datas: ["agenda", "calendario", "eventos"],
    post: ["publicacao", "publicacoes", "postagem", "mural", "feed", "aviso"],
    postar: ["publicacao", "publicacoes", "postagem", "criar", "mural"],
    noticia: ["aviso", "avisos", "publicacao", "mural", "feed"],
    carteirinha: ["perfil", "conta", "dados", "pessoais", "socio", "carteira", "pdf", "png"],
    carteira: ["carteirinha", "perfil", "conta", "dados", "pessoais", "socio"],
    pdf: ["carteirinha", "baixar", "exportar", "dados", "medicos"],
    endereco: ["perfil", "conta", "dados", "pessoais"],
    telefone: ["perfil", "conta", "dados", "pessoais", "usuarios"],
    email: ["perfil", "conta", "dados", "pessoais", "usuarios"],
    tema: ["configuracoes", "escuro", "claro", "modo", "aparencia", "preferencias"],
    escuro: ["tema", "configuracoes", "modo", "preferencias"],
    claro: ["tema", "configuracoes", "modo", "preferencias"],
    notificacao: ["configuracoes", "preferencias", "avisos"],
    notificacoes: ["configuracoes", "preferencias", "avisos"],
    privacidade: ["configuracoes", "visibilidade", "perfil"],
    senha: ["login", "acesso", "conta", "configuracoes", "provisoria", "aprovar"],
    cargo: ["role", "roles", "permissao", "permissoes", "acesso"],
    permissao: ["role", "roles", "permissoes", "cargo", "cargos", "rbac"],
};

export function normalizeTutorialText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Reduz uma palavra normalizada em português ao seu radical aproximado (stemming leve)
 * para que variações como "cadastro", "cadastrar", "cadastrais" e "cadastrado"
 * tenham correspondência entre si.
 */
export function stemPortugueseWord(word: string): string {
    if (word.length <= 4) return word;

    const suffixes = [
        "amentos",
        "imentos",
        "amento",
        "imento",
        "acoes",
        "icoes",
        "acao",
        "icao",
        "adoras",
        "adores",
        "adora",
        "ador",
        "aveis",
        "iveis",
        "avel",
        "ivel",
        "cais",
        "ais",
        "eis",
        "ois",
        "uis",
        "ando",
        "endo",
        "indo",
        "adas",
        "ados",
        "idas",
        "idos",
        "ada",
        "ado",
        "ida",
        "ido",
        "aram",
        "eram",
        "iram",
        "ar",
        "er",
        "ir",
        "as",
        "es",
        "is",
        "os",
        "am",
        "em",
        "a",
        "e",
        "o",
        "s",
    ];

    for (const suffix of suffixes) {
        if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
            return word.slice(0, word.length - suffix.length);
        }
    }

    return word;
}

/**
 * Calcula se duas palavras têm no máximo 1 edição de diferença (erro de digitação simples),
 * aplicado apenas para palavras com pelo menos 5 caracteres.
 */
function isOneEditAway(a: string, b: string): boolean {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    if (Math.min(a.length, b.length) < 5) return false;

    let edits = 0;
    let i = 0;
    let j = 0;

    while (i < a.length && j < b.length) {
        if (a[i] === b[j]) {
            i++;
            j++;
        } else {
            edits++;
            if (edits > 1) return false;
            if (a.length > b.length) {
                i++;
            } else if (b.length > a.length) {
                j++;
            } else {
                i++;
                j++;
            }
        }
    }

    if (i < a.length || j < b.length) {
        edits++;
    }

    return edits <= 1;
}

export const TUTORIAL_CATALOG: TutorialCatalogItem[] = [
    {
        id: "feed-home",
        title: "Mural do Clube e Inscrição em Eventos",
        description:
            "Filtre avisos e eventos no mural, curta, comente e confirme sua participação com veículo e dependentes.",
        category: "member",
        categoryLabel: "Membro",
        href: "/feed",
        storageKey: "tour_completed_feed",
        stepCount: getFeedTourSteps(false).length,
        icon: Compass,
        imageSteps: MEMBER_VISUAL_GUIDES["feed-home"],
        supportsLiveTour: true,
        topics: [
            "Filtros de publicações",
            "Inscrição em eventos e trilhas",
            "Escolha de veículo e convidado",
            "Curtidas e comentários",
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
            "inscricao",
            "participar",
            "convidado",
            "curtir",
            "comentar",
        ],
    },
    {
        id: "member-vehicles",
        title: "Cadastrar e Editar Veículo 4x4",
        description:
            "Adicione seu Jeep ou 4x4 no perfil com modelo, placa, ano e fotos para usar nas inscrições de trilhas.",
        category: "member",
        categoryLabel: "Membro",
        href: "/profile",
        storageKey: "tour_completed_member_vehicles",
        stepCount: MEMBER_VISUAL_GUIDES["member-vehicles"].length,
        icon: Car,
        imageSteps: MEMBER_VISUAL_GUIDES["member-vehicles"],
        supportsLiveTour: true,
        topics: [
            "Aba Veículos no perfil",
            "Incluir veículo 4x4",
            "Placa, modelo e galeria de fotos",
        ],
        keywords: [
            "meu veiculo",
            "veiculos",
            "cadastrar veiculo",
            "cadastrar carro",
            "editar veiculo",
            "meu jeep",
            "4x4",
            "placa",
            "renavam",
            "foto veiculo",
        ],
    },
    {
        id: "member-medical",
        title: "Preencher Ficha Médica de Emergência",
        description:
            "Mantenha tipo sanguíneo, alergias, medicações e contato de emergência atualizados para apoio em trilhas.",
        category: "member",
        categoryLabel: "Membro",
        href: "/profile",
        storageKey: "tour_completed_member_medical",
        stepCount: MEMBER_VISUAL_GUIDES["member-medical"].length,
        icon: HeartPulse,
        imageSteps: MEMBER_VISUAL_GUIDES["member-medical"],
        supportsLiveTour: true,
        topics: [
            "Aba Dados médicos",
            "Tipo sanguíneo e alergias",
            "Contato de emergência",
        ],
        keywords: [
            "ficha medica",
            "dados medicos",
            "saude",
            "tipo sanguineo",
            "alergia",
            "remedio",
            "medicamento",
            "emergencia",
        ],
    },
    {
        id: "profile-account",
        title: "Dados Pessoais e Carteirinha de Associado",
        description:
            "Atualize seus dados cadastrais e visualize ou baixe sua Carteirinha do Clube em PNG ou PDF.",
        category: "member",
        categoryLabel: "Membro",
        href: "/profile",
        storageKey: "tour_completed_profile",
        stepCount: getProfileTourSteps(false).length,
        icon: User,
        imageSteps: MEMBER_VISUAL_GUIDES["profile-account"],
        supportsLiveTour: true,
        topics: [
            "Dados pessoais",
            "Carteira de Associado frente e verso",
            "Baixar em PNG ou PDF",
        ],
        keywords: [
            "perfil",
            "conta",
            "dados pessoais",
            "dados cadastrais",
            "carteirinha",
            "carteira de associado",
            "baixar pdf",
            "png",
            "telefone",
            "email",
        ],
    },
    {
        id: "member-dependents",
        title: "Cadastrar Dependentes e Familiares",
        description:
            "Inclua filhos, cônjuge ou familiares no seu perfil para levá-los facilmente nos eventos do clube.",
        category: "member",
        categoryLabel: "Membro",
        href: "/profile",
        storageKey: "tour_completed_member_dependents",
        stepCount: MEMBER_VISUAL_GUIDES["member-dependents"].length,
        icon: Users,
        imageSteps: MEMBER_VISUAL_GUIDES["member-dependents"],
        supportsLiveTour: true,
        topics: [
            "Aba Dependentes",
            "Incluir familiar",
            "Foto e vínculo",
        ],
        keywords: [
            "dependentes",
            "dependente",
            "filho",
            "filha",
            "esposa",
            "marido",
            "conjuge",
            "familia",
        ],
    },
    {
        id: "member-tools",
        title: "Cadastrar Ferramentas e Equipamentos de Resgate",
        description:
            "Registre guincho, cinta, manilha e equipamentos de apoio que você leva nas expedições.",
        category: "member",
        categoryLabel: "Membro",
        href: "/profile",
        storageKey: "tour_completed_member_tools",
        stepCount: MEMBER_VISUAL_GUIDES["member-tools"].length,
        icon: Wrench,
        imageSteps: MEMBER_VISUAL_GUIDES["member-tools"],
        supportsLiveTour: true,
        topics: [
            "Aba Ferramentas",
            "Incluir equipamento",
            "Ativar ou desativar item",
        ],
        keywords: [
            "minhas ferramentas",
            "ferramentas",
            "equipamentos",
            "resgate",
            "guincho",
            "cinta",
            "manilha",
        ],
    },
    {
        id: "member-agenda",
        title: "Consultar Agenda Mensal de Trilhas",
        description:
            "Veja todos os eventos do clube organizados por mês no calendário e abra os detalhes com um clique.",
        category: "member",
        categoryLabel: "Membro",
        href: "/agenda",
        storageKey: "tour_completed_member_agenda",
        stepCount: MEMBER_VISUAL_GUIDES["member-agenda"].length,
        icon: CalendarDays,
        imageSteps: MEMBER_VISUAL_GUIDES["member-agenda"],
        supportsLiveTour: false,
        topics: [
            "Calendário mensal",
            "Navegação entre meses",
            "Resumo rápido do evento",
        ],
        keywords: [
            "agenda",
            "calendario",
            "datas",
            "proximos eventos",
            "trilhas do mes",
        ],
    },
    {
        id: "member-financial",
        title: "Consultar Mensalidades e Histórico Financeiro",
        description:
            "Acompanhe suas cobranças e mensalidades, filtre por pendentes ou pagas e veja datas de vencimento.",
        category: "member",
        categoryLabel: "Membro",
        href: "/financeiro",
        storageKey: "tour_completed_member_financial",
        stepCount: MEMBER_VISUAL_GUIDES["member-financial"].length,
        icon: ReceiptText,
        imageSteps: MEMBER_VISUAL_GUIDES["member-financial"],
        supportsLiveTour: false,
        topics: [
            "Menu Histórico financeiro",
            "Filtro por status",
            "Vencimento e valor",
        ],
        keywords: [
            "historico financeiro",
            "financeiro",
            "mensalidade",
            "cobranca",
            "boleto",
            "pix",
            "pagamento",
            "pendente",
            "paga",
        ],
    },
    {
        id: "member-password-recovery",
        title: "Recuperar Senha de Acesso",
        description:
            "Veja como solicitar o código de recuperação com seu CPF caso tenha esquecido a senha de entrada.",
        category: "member",
        categoryLabel: "Membro",
        href: "/forgot-password",
        storageKey: "tour_completed_member_password_recovery",
        stepCount: MEMBER_VISUAL_GUIDES["member-password-recovery"].length,
        icon: KeyRound,
        imageSteps: MEMBER_VISUAL_GUIDES["member-password-recovery"],
        supportsLiveTour: false,
        topics: [
            "Atalho Esqueceu a senha?",
            "Envio do código por CPF",
            "Redefinição de acesso",
        ],
        keywords: [
            "recuperar senha",
            "esqueci minha senha",
            "esqueceu a senha",
            "redefinir senha",
            "trocar senha",
            "alterar senha",
            "senha",
            "codigo",
            "login",
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
        imageSteps: MEMBER_VISUAL_GUIDES["public-landing-home"],
        supportsLiveTour: true,
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
            "Aprenda como buscar dúvidas na Central e usar o botão de ajuda no cabeçalho em qualquer tela.",
        category: "member",
        categoryLabel: "Membro",
        href: "/tutoriais",
        storageKey: "tour_completed_tutorials_page",
        stepCount: getTutorialsPageTourSteps(false).length,
        icon: HelpCircle,
        imageSteps: MEMBER_VISUAL_GUIDES["tutorials-hub"],
        supportsLiveTour: true,
        topics: [
            "Barra de busca",
            "Guias ilustrados",
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

    const subjectTokens = tokens.filter((token) => !INTENT_VERBS.has(token));
    const coreTokens = subjectTokens.length > 0 ? subjectTokens : tokens;

    const scored = byCategory
        .map((item) => {
            const titleNorm = normalizeTutorialText(item.title);
            const descNorm = normalizeTutorialText(item.description);
            const topicsNorm = normalizeTutorialText(item.topics.join(" "));
            const keywordsNorm = normalizeTutorialText(item.keywords.join(" "));
            const fullText = `${titleNorm} ${descNorm} ${topicsNorm} ${keywordsNorm}`;

            const itemWords = fullText.split(" ").filter(Boolean);
            const itemStems = new Set(itemWords.map(stemPortugueseWord));
            const titleStems = new Set(
                titleNorm.split(" ").filter(Boolean).map(stemPortugueseWord),
            );
            const keywordsStems = new Set(
                keywordsNorm.split(" ").filter(Boolean).map(stemPortugueseWord),
            );
            const topicsStems = new Set(
                topicsNorm.split(" ").filter(Boolean).map(stemPortugueseWord),
            );

            let score = 0;

            if (titleNorm.includes(normalizedQuery)) score += 12;
            if (keywordsNorm.includes(normalizedQuery)) score += 10;
            if (topicsNorm.includes(normalizedQuery)) score += 8;
            if (descNorm.includes(normalizedQuery)) score += 6;

            let matchedTokens = 0;
            let matchedCoreTokens = 0;

            for (const token of tokens) {
                const isCore = coreTokens.includes(token);
                const tokenStem = stemPortugueseWord(token);
                const synonyms =
                    SYNONYM_MAP[token] ?? SYNONYM_MAP[tokenStem] ?? [];
                const synonymStems = synonyms.map(stemPortugueseWord);

                let tokenScore = 0;

                // 1. Match direto por substring
                if (titleNorm.includes(token)) {
                    tokenScore = 6;
                } else if (keywordsNorm.includes(token)) {
                    tokenScore = 5;
                } else if (topicsNorm.includes(token)) {
                    tokenScore = 4;
                } else if (fullText.includes(token)) {
                    tokenScore = 3;
                }
                // 2. Match por radical da palavra em português (ex.: "cadastro" <-> "cadastrais" / "cadastrar")
                else if (tokenStem.length >= 3) {
                    if (titleStems.has(tokenStem)) {
                        tokenScore = 5;
                    } else if (keywordsStems.has(tokenStem)) {
                        tokenScore = 4;
                    } else if (topicsStems.has(tokenStem)) {
                        tokenScore = 3;
                    } else if (
                        itemStems.has(tokenStem) ||
                        itemWords.some(
                            (w) =>
                                w.startsWith(tokenStem) ||
                                (tokenStem.length >= 4 &&
                                    w.length >= 4 &&
                                    tokenStem.startsWith(stemPortugueseWord(w))),
                        )
                    ) {
                        tokenScore = 2;
                    }
                }

                // 3. Match por sinônimos do domínio do clube (ex.: "carro" / "jipe" -> "veiculo")
                if (tokenScore === 0 && synonyms.length > 0) {
                    if (
                        synonyms.some(
                            (syn) =>
                                titleNorm.includes(syn) ||
                                keywordsNorm.includes(syn),
                        )
                    ) {
                        tokenScore = 4;
                    } else if (
                        synonyms.some((syn) => fullText.includes(syn)) ||
                        synonymStems.some((synStem) => itemStems.has(synStem))
                    ) {
                        tokenScore = 3;
                    }
                }

                // 4. Tolerância a pequenos erros de digitação (ex.: "veiclo" -> "veiculo")
                if (tokenScore === 0 && token.length >= 5) {
                    const hasTypoMatch = itemWords.some(
                        (w) =>
                            isOneEditAway(token, w) ||
                            isOneEditAway(tokenStem, stemPortugueseWord(w)),
                    );
                    if (hasTypoMatch) {
                        tokenScore = 2;
                    }
                }

                if (tokenScore > 0) {
                    score += tokenScore;
                    matchedTokens++;
                    if (isCore) {
                        matchedCoreTokens++;
                    }
                }
            }

            const minCoreRequired =
                coreTokens.length >= 3
                    ? Math.ceil(coreTokens.length * 0.5)
                    : 1;

            if (matchedCoreTokens < minCoreRequired && score < 10) {
                return { item, score: 0 };
            }

            if (matchedTokens === tokens.length) {
                score += 4;
            }

            return { item, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.map((entry) => entry.item);
}

interface TutorialRowItemProps {
    tutorial: TutorialCatalogItem;
    isCompleted: boolean;
    isFirst: boolean;
    isBestMatch?: boolean;
    onStart: (tutorial: TutorialCatalogItem) => void;
}

function TutorialRowItem({
    tutorial,
    isCompleted,
    isFirst,
    isBestMatch = false,
    onStart,
}: TutorialRowItemProps) {
    const Icon = tutorial.icon;
    const hasImageGuide = Boolean(tutorial.imageSteps?.length);
    const stepCount = tutorial.imageSteps?.length ?? tutorial.stepCount;
    const stepLabel = `${stepCount} ${stepCount === 1 ? "passo" : "passos"}`;

    return (
        <article
            className={twMerge(
                "flex flex-col gap-4 rounded-2xl border bg-j-white p-4 shadow-xs transition-all sm:p-5 md:flex-row md:items-center md:justify-between md:gap-6",
                isBestMatch
                    ? "border-2 border-j-yellow-400 shadow-sm"
                    : isCompleted
                      ? "border-j-gray-200"
                      : "border-j-gray-300 hover:border-j-yellow-400 hover:shadow-sm",
            )}
        >
            {/* Bloco Esquerdo/Superior: Ícone + Textos */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4 md:flex-1">
                <div className="flex items-center gap-3 sm:block">
                    <span
                        className={twMerge(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border sm:h-14 sm:w-14",
                            isCompleted
                                ? "border-j-gray-200 bg-j-gray-100 text-j-gray-600"
                                : "border-j-gray-200 bg-j-blue-50 text-j-blue-800",
                        )}
                    >
                        <Icon size={26} strokeWidth={2} aria-hidden="true" />
                    </span>

                    {/* No celular, o título fica ao lado do ícone para aproveitar melhor a largura */}
                    <div className="flex flex-col gap-1 sm:hidden">
                        <h3 className="text-lg font-extrabold leading-snug text-j-blue-800">
                            {tutorial.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {isBestMatch && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-j-yellow-300 px-2 py-0.5 text-xs font-extrabold text-j-blue-900">
                                    <Sparkles size={12} aria-hidden="true" />
                                    Melhor resultado
                                </span>
                            )}
                            <span className="rounded-md border border-j-gray-200 bg-j-gray-100 px-2 py-0.5 text-xs font-semibold text-j-gray-600">
                                {stepLabel}
                            </span>
                            {isCompleted && (
                                <span
                                    style={{
                                        backgroundColor: "var(--success-surface)",
                                        color: "var(--success-text)",
                                        borderColor: "var(--success-border)",
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold"
                                >
                                    <CheckCircle2 size={13} aria-hidden="true" />
                                    Já concluído
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                    {/* No tablet/desktop, o título e os selos ficam alinhados na primeira linha do bloco central */}
                    <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
                        <h3 className="text-lg font-extrabold leading-snug text-j-blue-800">
                            {tutorial.title}
                        </h3>
                        {isBestMatch && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-j-yellow-300 px-2.5 py-0.5 text-xs font-extrabold text-j-blue-900">
                                <Sparkles size={13} aria-hidden="true" />
                                Melhor resultado
                            </span>
                        )}
                        <span className="rounded-lg border border-j-gray-200 bg-j-gray-100 px-2.5 py-0.5 text-xs font-semibold text-j-gray-600">
                            {stepLabel}
                        </span>
                        {isCompleted && (
                            <span
                                style={{
                                    backgroundColor: "var(--success-surface)",
                                    color: "var(--success-text)",
                                    borderColor: "var(--success-border)",
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-bold"
                            >
                                <CheckCircle2 size={14} aria-hidden="true" />
                                Já concluído
                            </span>
                        )}
                    </div>

                    <p className="text-sm leading-relaxed text-j-gray-600 sm:text-base">
                        {tutorial.description}
                    </p>
                </div>
            </div>

            {/* Bloco Direito/Inferior: Botão de Ação (100% no mobile, largura fixa confortável no desktop) */}
            <div className="border-t border-j-gray-100 pt-3 md:w-52 md:shrink-0 md:border-t-0 md:pt-0">
                <button
                    id={isFirst ? "tour-tutorials-start-btn" : undefined}
                    type="button"
                    onClick={() => onStart(tutorial)}
                    className={twMerge(
                        "flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-j-blue-800",
                        isCompleted
                            ? "border border-j-gray-300 bg-j-gray-100 text-j-blue-800 hover:border-j-yellow-300 hover:bg-j-yellow-300 hover:text-j-blue-900"
                            : "bg-j-yellow-300 text-j-blue-900 shadow-xs hover:bg-j-yellow-400",
                    )}
                >
                    {isCompleted ? (
                        <>
                            <RotateCcw size={16} aria-hidden="true" />
                            Rever tutorial
                        </>
                    ) : (
                        <>
                            <Play
                                size={16}
                                fill="currentColor"
                                aria-hidden="true"
                            />
                            {hasImageGuide ? "Ver tutorial" : "Iniciar tutorial"}
                        </>
                    )}
                </button>
            </div>
        </article>
    );
}

export default function TutorialsPageContent() {
    const router = useRouter();
    const permissions = useUserStore((state) => state.permissions);
    const [searchQuery, setSearchQuery] = useState("");
    const [completedKeys, setCompletedKeys] = useState<Record<string, boolean>>(
        {},
    );
    const [activeImageTutorial, setActiveImageTutorial] =
        useState<TutorialCatalogItem | null>(null);

    const { restartTour } = usePageTour({
        storageKey: "tour_completed_tutorials_page",
        steps: getTutorialsPageTourSteps,
        autoStartOnFirstVisit: false,
        enabled: true,
    });

    useEffect(() => {
        const syncCompleted = () => {
            const next: Record<string, boolean> = {};
            for (const item of TUTORIAL_CATALOG) {
                try {
                    if (localStorage.getItem(item.storageKey) === "true") {
                        next[item.storageKey] = true;
                    }
                } catch {
                    // Ignora indisponibilidade de storage
                }
            }
            setCompletedKeys(next);
        };

        syncCompleted();
        window.addEventListener("storage", syncCompleted);
        window.addEventListener("tour:progress-updated", syncCompleted);
        return () => {
            window.removeEventListener("storage", syncCompleted);
            window.removeEventListener("tour:progress-updated", syncCompleted);
        };
    }, []);

    const results = useMemo(
        () =>
            filterTutorials(
                TUTORIAL_CATALOG,
                permissions,
                searchQuery,
            ),
        [permissions, searchQuery],
    );

    const startLiveTour = (tutorial: TutorialCatalogItem) => {
        if (tutorial.id === "tutorials-hub") {
            restartTour();
            return;
        }
        requestTourStart(tutorial.storageKey);
        router.push(tutorial.href);
    };

    const handleStartTutorial = (tutorial: TutorialCatalogItem) => {
        if (tutorial.imageSteps?.length) {
            setActiveImageTutorial(tutorial);
            return;
        }
        startLiveTour(tutorial);
    };

    const handleMarkImageTutorialCompleted = (storageKey: string) => {
        try {
            localStorage.setItem(storageKey, "true");
            window.dispatchEvent(new Event("tour:progress-updated"));
        } catch {
            // Ignora indisponibilidade de storage
        }
        setCompletedKeys((prev) => ({ ...prev, [storageKey]: true }));
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const isFiltering = Boolean(searchQuery.trim());

    return (
        <div className="min-h-full w-full p-4 pb-14 md:p-6">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <PageHeader
                    id="tour-tutorials-header"
                    title="Central de Tutoriais"
                    breadcrumbs={[
                        { label: "Home", href: "/feed" },
                        { label: "Tutoriais" },
                    ]}
                    actions={
                        <TourHelpButton
                            id="tour-tutorials-help-btn"
                            onClick={restartTour}
                            label="Como usar esta página?"
                            className="h-11 w-full justify-center px-4 text-sm sm:w-auto"
                        />
                    }
                />

                {/* MÓDULO 1 (Protagonismo Principal): "O que você quer fazer hoje?" */}
                <section
                    aria-label="Pesquisa de tutoriais"
                    className="flex flex-col gap-6 rounded-2xl border border-j-gray-200 bg-j-white p-5 shadow-xs sm:p-7"
                >
                    {/* Hero de Busca: Protagonismo máximo logo ao entrar na página */}
                    <div className="flex flex-col gap-4 rounded-2xl border-2 border-j-yellow-400 bg-j-blue-50 p-4 shadow-xs sm:p-6">
                        <div className="flex flex-col gap-1.5">
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-j-yellow-300 px-3 py-1 text-xs font-extrabold text-j-blue-900">
                                <HelpCircle size={14} aria-hidden="true" />
                                Tire sua dúvida agora
                            </span>
                            <h2 className="text-xl font-extrabold text-j-blue-800 sm:text-2xl">
                                O que você quer fazer hoje?
                            </h2>
                            <p className="text-sm text-j-gray-600 sm:text-base">
                                Escreva abaixo qual é a sua dúvida ou escolha um tutorial da lista:
                            </p>
                        </div>

                        {/* Barra de Busca Principal */}
                        <div id="tour-tutorials-search" className="w-full">
                            <InputSearch
                                value={searchQuery}
                                onSubmit={setSearchQuery}
                                submitOnChange
                                label="Qual é a sua dúvida?"
                                placeholder="Qual é a sua dúvida? Escreva o que procura (ex.: cadastrar veículo, ficha médica, carteirinha, senha)..."
                                iconClassName="left-4 text-j-blue-800"
                                clearButtonClassName="right-3"
                                className="h-14 rounded-xl border-2 border-j-blue-800/30 bg-j-white pl-12 pr-11 text-base font-medium text-j-gray-700 shadow-sm focus:border-j-blue-800 sm:h-16 sm:text-lg"
                            />
                        </div>
                    </div>
                </section>

                {/*
                    MÓDULO 2 (Desativado temporariamente):
                    "Próximo passo sugerido" / Acompanhamento de progresso nos tutoriais.
                    Desativado para manter o foco direto ao ponto na busca de dúvidas e no sumário.
                */}

                {/* MÓDULO 3: Lista em Linhas Horizontais (Sumário de Tutoriais) */}
                <section
                    id="tour-tutorials-results"
                    aria-label="Lista de tutoriais"
                    className="flex flex-col gap-4"
                >
                    {results.length > 0 ? (
                        <div className="flex flex-col gap-3.5">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-extrabold text-j-blue-800 sm:text-xl">
                                    {searchQuery.trim()
                                        ? `Tutoriais encontrados (${results.length})`
                                        : "Todos os tutoriais disponíveis"}
                                </h2>
                                {isFiltering && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-j-gray-600 transition-colors hover:bg-j-gray-100 hover:text-j-blue-800 focus-visible:outline-2 focus-visible:outline-j-blue-800 sm:text-sm"
                                    >
                                        <RotateCcw size={15} aria-hidden="true" />
                                        Limpar busca
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-3.5">
                                {results.map((tutorial, index) => (
                                    <TutorialRowItem
                                        key={tutorial.id}
                                        tutorial={tutorial}
                                        isCompleted={Boolean(
                                            completedKeys[
                                                tutorial.storageKey
                                            ],
                                        )}
                                        isFirst={index === 0}
                                        isBestMatch={searchQuery.trim() ? index === 0 : false}
                                        onStart={handleStartTutorial}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div
                            role="status"
                            className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-j-gray-300 bg-j-white p-8 text-center"
                        >
                            <HelpCircle
                                size={36}
                                className="text-j-gray-400"
                                aria-hidden="true"
                            />
                            <h2 className="mt-3 text-lg font-bold text-j-blue-800">
                                Nenhum tutorial encontrado
                            </h2>
                            <p className="mt-1.5 text-sm text-j-gray-600">
                                Não encontramos resultados para &ldquo;{searchQuery}&rdquo;.
                            </p>
                            <Button
                                type="button"
                                onClick={handleClearSearch}
                                className="mt-4 min-h-11 px-5 text-sm font-bold"
                            >
                                Mostrar todos os tutoriais
                            </Button>
                        </div>
                    )}
                </section>
            </div>

            <TutorialImageViewerModal
                title={activeImageTutorial?.title ?? ""}
                steps={activeImageTutorial?.imageSteps ?? []}
                isOpen={Boolean(activeImageTutorial)}
                onClose={() => setActiveImageTutorial(null)}
                completeLabel={
                    activeImageTutorial && activeImageTutorial.href !== "/tutoriais"
                        ? "Concluir e ir para a tela"
                        : "Concluir"
                }
                onComplete={() => {
                    if (!activeImageTutorial) return;
                    const target = activeImageTutorial;
                    handleMarkImageTutorialCompleted(target.storageKey);
                    if (target.href && target.href !== "/tutoriais") {
                        router.push(target.href);
                    }
                }}
                onOpenLiveTour={
                    activeImageTutorial &&
                    activeImageTutorial.supportsLiveTour !== false &&
                    activeImageTutorial.id !== "tutorials-hub"
                        ? () => {
                              const target = activeImageTutorial;
                              setActiveImageTutorial(null);
                              startLiveTour(target);
                          }
                        : undefined
                }
            />
        </div>
    );
}
