export const DEPENDENT_STATUS_LABEL: Record<AdminDependentStatus, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    ARCHIVED: "Arquivado",
};

export const DEPENDENT_STATUS_BADGE_CLASS: Record<AdminDependentStatus, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    INACTIVE: "bg-amber-50 text-amber-700 border border-amber-200",
    ARCHIVED: "bg-slate-100 text-slate-600 border border-slate-200",
};

export const DEPENDENT_STATUS_DOT_STYLE: Record<AdminDependentStatus, string> = {
    ACTIVE: "bg-emerald-500",
    INACTIVE: "bg-amber-500",
    ARCHIVED: "bg-slate-400",
};

export const DEPENDENT_RELATIONSHIP_LABEL: Record<DependentRelationshipType, string> = {
    SPOUSE: "Cônjuge",
    CHILD: "Filho(a)",
    PARENT: "Pai / Mãe",
    SIBLING: "Irmão(ã)",
    GUEST: "Convidado(a)",
    OTHER: "Outro",
};

export const ADMIN_DEPENDENT_STATUS_FILTER_OPTIONS: Array<{
    value: AdminDependentStatus | "";
    label: string;
}> = [
    { value: "", label: "Todos os status" },
    { value: "ACTIVE", label: "Ativos" },
    { value: "INACTIVE", label: "Inativos" },
    { value: "ARCHIVED", label: "Arquivados" },
];

export const ADMIN_DEPENDENT_RELATIONSHIP_FILTER_OPTIONS: Array<{
    value: DependentRelationshipType | "";
    label: string;
}> = [
    { value: "", label: "Todos os parentescos" },
    { value: "SPOUSE", label: "Cônjuge" },
    { value: "CHILD", label: "Filho(a)" },
    { value: "PARENT", label: "Pai / Mãe" },
    { value: "SIBLING", label: "Irmão(ã)" },
    { value: "GUEST", label: "Convidado(a)" },
    { value: "OTHER", label: "Outro" },
];

export function formatDependentCpf(cpf?: string | null): string {
    if (!cpf) return "—";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatDependentPhone(phone?: string | null): string {
    if (!phone) return "Não informado";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phone;
}

export function formatDependentBirthDate(birthDate?: string | null): string {
    if (!birthDate) return "—";
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthDate);
    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }
    return birthDate;
}

export function formatDependentDateTime(iso?: string | null): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function getAdminDependentPhotoUrl(
    dependent: Pick<AdminDependentItem, "id" | "userId" | "photoUrl" | "updatedAt">,
): string | null {
    if (!dependent.photoUrl) return null;
    const version = dependent.updatedAt ? `?v=${encodeURIComponent(dependent.updatedAt)}` : "";
    return `/api/admin/users/${dependent.userId}/dependents/${dependent.id}/photo${version}`;
}
