"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, RefreshCw, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/common/button";
import {
    cancelAdminPasswordRecoveryRequestAction,
    listAdminUserPasswordRecoveryRequestsAction,
    listAdminUserRefreshTokensAction,
    listAdminUserSessionsAction,
    logoutAdminSessionAction,
    revokeAdminRefreshTokenAction,
    type AdminPasswordRecoveryRequest,
    type AdminRefreshToken,
    type AdminSession,
} from "@/actions/admin/security";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";

type SecurityPermission = "SESSION_READ" | "SESSION_LOGOUT" | "REFRESH_TOKEN_READ" | "REFRESH_TOKEN_REVOKE" | "PASSWORD_RECOVERY_READ" | "PASSWORD_RECOVERY_CANCEL";
type ConfirmTarget =
    | { kind: "session"; id: number; description: string }
    | { kind: "refresh-token"; id: number; description: string }
    | { kind: "recovery-request"; id: number; description: string };

const permissionActions: Record<SecurityPermission, string> = {
    SESSION_READ: "SESSION_READ",
    SESSION_LOGOUT: "SESSION_LOGOUT",
    REFRESH_TOKEN_READ: "REFRESH_TOKEN_READ",
    REFRESH_TOKEN_REVOKE: "REFRESH_TOKEN_REVOKE",
    PASSWORD_RECOVERY_READ: "PASSWORD_RECOVERY_READ",
    PASSWORD_RECOVERY_CANCEL: "PASSWORD_RECOVERY_CANCEL",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
});

function formatDate(value: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

function statusLabel(status: string) {
    const labels: Record<string, string> = {
        ACTIVE: "Ativa",
        REVOKED: "Revogado",
        LOGGED_OUT: "Encerrada",
        ROTATED: "Substituído",
        OPEN: "Aberto",
        RESOLVED: "Resolvido",
        CANCELLED: "Cancelado",
        EXPIRED: "Expirado",
    };
    return labels[status] ?? status;
}

function StatusBadge({ status }: { status: string }) {
    const tone = status === "ACTIVE" || status === "OPEN"
        ? "bg-j-green-100 text-j-green-700"
        : status === "REVOKED" || status === "LOGGED_OUT" || status === "CANCELLED"
            ? "bg-j-gray-200 text-j-gray-600"
            : "bg-j-yellow-100 text-j-yellow-700";

    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{statusLabel(status)}</span>;
}

export function hasAdminSecurityReadPermission(permissions: PermissionModule[]) {
    return (["SESSION_READ", "REFRESH_TOKEN_READ", "PASSWORD_RECOVERY_READ"] as SecurityPermission[])
        .some((permission) => hasPermission(permissions, "AUTHENTICATION", permissionActions[permission]));
}

export function UserSecurityTab({ userId }: { userId: number }) {
    const permissions = useUserStore((state) => state.permissions);
    const queryClient = useQueryClient();
    const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
    const [activeSection, setActiveSection] = useState<"sessions" | "tokens" | "recovery">("sessions");

    const canReadSessions = hasPermission(permissions, "AUTHENTICATION", permissionActions.SESSION_READ);
    const canLogoutSession = hasPermission(permissions, "AUTHENTICATION", permissionActions.SESSION_LOGOUT);
    const canReadTokens = hasPermission(permissions, "AUTHENTICATION", permissionActions.REFRESH_TOKEN_READ);
    const canRevokeToken = hasPermission(permissions, "AUTHENTICATION", permissionActions.REFRESH_TOKEN_REVOKE);
    const canReadRecovery = hasPermission(permissions, "AUTHENTICATION", permissionActions.PASSWORD_RECOVERY_READ);
    const canCancelRecovery = hasPermission(permissions, "AUTHENTICATION", permissionActions.PASSWORD_RECOVERY_CANCEL);

    useEffect(() => {
        if (canReadSessions && canReadTokens && canReadRecovery) return;
        if (!canReadSessions && !canReadTokens && !canReadRecovery) return;
        if (activeSection === "sessions" && canReadSessions) return;
        if (activeSection === "tokens" && canReadTokens) return;
        if (activeSection === "recovery" && canReadRecovery) return;
        setActiveSection(canReadSessions ? "sessions" : canReadTokens ? "tokens" : "recovery");
    }, [activeSection, canReadSessions, canReadTokens, canReadRecovery]);

    const sessionsQuery = useQuery({
        queryKey: ["admin-user-security", userId, "sessions"],
        queryFn: () => listAdminUserSessionsAction(userId),
        enabled: canReadSessions,
        retry: false,
    });
    const tokensQuery = useQuery({
        queryKey: ["admin-user-security", userId, "refresh-tokens"],
        queryFn: () => listAdminUserRefreshTokensAction(userId),
        enabled: canReadTokens,
        retry: false,
    });
    const recoveryQuery = useQuery({
        queryKey: ["admin-user-security", userId, "recovery-requests"],
        queryFn: () => listAdminUserPasswordRecoveryRequestsAction(userId),
        enabled: canReadRecovery,
        retry: false,
    });

    const actionMutation = useMutation({
        mutationFn: async (target: ConfirmTarget) => {
            if (target.kind === "session") return logoutAdminSessionAction(target.id);
            if (target.kind === "refresh-token") return revokeAdminRefreshTokenAction(target.id);
            return cancelAdminPasswordRecoveryRequestAction(target.id);
        },
        onSuccess: async (_result, target) => {
            const queryKey = target.kind === "session"
                ? "sessions"
                : target.kind === "refresh-token"
                    ? "refresh-tokens"
                    : "recovery-requests";
            await queryClient.invalidateQueries({ queryKey: ["admin-user-security", userId, queryKey] });
            setConfirmTarget(null);
            toast.success(target.kind === "session" ? "Sessão encerrada." : target.kind === "refresh-token" ? "Token revogado." : "Pedido de recuperação cancelado.");
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Não foi possível concluir a ação."),
    });

    const sectionsCount = Number(canReadSessions) + Number(canReadTokens) + Number(canReadRecovery);

    if (sectionsCount === 0) {
        return <NoPermission />;
    }

    return (
        <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl bg-j-blue-50 p-4 text-sm text-j-blue-800">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>Esta área exibe somente metadados de segurança. Segredos, hashes e tokens não são retornados pela API.</p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="tablist" aria-label="Dados de segurança">
                {([
                    { key: "sessions", label: "Sessões", allowed: canReadSessions, count: sessionsQuery.data?.length ?? 0 },
                    { key: "tokens", label: "Tokens", allowed: canReadTokens, count: tokensQuery.data?.length ?? 0 },
                    { key: "recovery", label: "Recuperação", allowed: canReadRecovery, count: recoveryQuery.data?.length ?? 0 },
                ] as const).filter((item) => item.allowed).map((item) => (
                    <button key={item.key} type="button" role="tab" aria-selected={activeSection === item.key} onClick={() => setActiveSection(item.key)}
                        className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-bold ${activeSection === item.key ? "border-j-blue-800 bg-j-blue-800 text-j-white" : "border-j-gray-200 bg-j-white text-j-gray-700"}`}>
                        <span>{item.label}</span><span className={`rounded-full px-2 py-0.5 text-xs ${activeSection === item.key ? "bg-j-white/15" : "bg-j-gray-100"}`}>{item.count}</span>
                    </button>
                ))}
            </div>

            {canReadSessions && activeSection === "sessions" && (
                <SecuritySection
                    title="Sessões"
                    description="Sessões de autenticação vinculadas a este usuário."
                    isLoading={sessionsQuery.isLoading}
                    error={sessionsQuery.error}
                    onRetry={() => void sessionsQuery.refetch()}
                    isEmpty={!sessionsQuery.isLoading && !sessionsQuery.error && (sessionsQuery.data?.length ?? 0) === 0}
                    emptyMessage="Nenhuma sessão encontrada."
                >
                    <ActiveAndHistory records={sessionsQuery.data ?? []} isActive={(item) => item.status === "ACTIVE"} activeLabel="Sessões ativas" historyLabel="Histórico de sessões">
                        {(session) => <SessionRow key={session.id} session={session} canLogout={canLogoutSession} onLogout={() => setConfirmTarget({ kind: "session", id: session.id, description: `encerrar a sessão #${session.id}` })} />}
                    </ActiveAndHistory>
                </SecuritySection>
            )}

            {canReadTokens && activeSection === "tokens" && (
                <SecuritySection
                    title="Refresh tokens"
                    description="Tokens de renovação e sessão de origem."
                    isLoading={tokensQuery.isLoading}
                    error={tokensQuery.error}
                    onRetry={() => void tokensQuery.refetch()}
                    isEmpty={!tokensQuery.isLoading && !tokensQuery.error && (tokensQuery.data?.length ?? 0) === 0}
                    emptyMessage="Nenhum token encontrado."
                >
                    <ActiveAndHistory records={tokensQuery.data ?? []} isActive={(item) => item.status === "ACTIVE"} activeLabel="Tokens ativos" historyLabel="Histórico de tokens">
                        {(token) => <RefreshTokenRow key={token.id} token={token} canRevoke={canRevokeToken} onRevoke={() => setConfirmTarget({ kind: "refresh-token", id: token.id, description: `revogar o token #${token.id}` })} />}
                    </ActiveAndHistory>
                </SecuritySection>
            )}

            {canReadRecovery && activeSection === "recovery" && (
                <SecuritySection
                    title="Pedidos de recuperação de senha"
                    description="Solicitações de redefinição de senha deste usuário."
                    isLoading={recoveryQuery.isLoading}
                    error={recoveryQuery.error}
                    onRetry={() => void recoveryQuery.refetch()}
                    isEmpty={!recoveryQuery.isLoading && !recoveryQuery.error && (recoveryQuery.data?.length ?? 0) === 0}
                    emptyMessage="Nenhum pedido de recuperação encontrado."
                >
                    <ActiveAndHistory records={recoveryQuery.data ?? []} isActive={(item) => item.status === "OPEN"} activeLabel="Pedidos em aberto" historyLabel="Histórico de pedidos">
                        {(request) => <RecoveryRequestRow key={request.id} request={request} canCancel={canCancelRecovery} onCancel={() => setConfirmTarget({ kind: "recovery-request", id: request.id, description: `cancelar o pedido #${request.id}` })} />}
                    </ActiveAndHistory>
                </SecuritySection>
            )}

            {confirmTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-j-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !actionMutation.isPending) setConfirmTarget(null); }}>
                    <section role="alertdialog" aria-modal="true" aria-labelledby="security-confirm-title" aria-describedby="security-confirm-description" className="w-full max-w-md rounded-2xl bg-j-white p-6 shadow-2xl">
                        <h2 id="security-confirm-title" className="text-lg font-extrabold text-j-blue-800">Confirmar ação de segurança?</h2>
                        <p id="security-confirm-description" className="mt-2 text-sm leading-relaxed text-j-gray-600">Deseja realmente {confirmTarget.description}? Esta ação pode impedir que o usuário continue usando o recurso.</p>
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" disabled={actionMutation.isPending} onClick={() => setConfirmTarget(null)} className="border border-j-gray-200 bg-j-white text-j-gray-700 hover:bg-j-gray-100">Voltar</Button>
                            <Button type="button" disabled={actionMutation.isPending} onClick={() => actionMutation.mutate(confirmTarget)} className="bg-j-red-500 text-j-white hover:bg-j-red-600 hover:text-j-white">
                                {actionMutation.isPending ? "Processando..." : "Confirmar"}
                            </Button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

function NoPermission() {
    return (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-j-gray-300 p-6 text-center">
            <CircleAlert size={28} className="text-j-gray-400" />
            <p className="mt-3 text-sm font-bold text-j-gray-700">Sem permissão de leitura de segurança</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-j-gray-500">Seu acesso não inclui sessões, refresh tokens ou pedidos de recuperação.</p>
        </div>
    );
}

function ActiveAndHistory<T extends { status: string; createdAt: string }>({
    records,
    isActive,
    activeLabel,
    historyLabel,
    children,
}: {
    records: T[];
    isActive: (record: T) => boolean;
    activeLabel: string;
    historyLabel: string;
    children: (record: T) => ReactNode;
}) {
    const [showAllHistory, setShowAllHistory] = useState(false);
    const newestFirst = (items: T[]) => items.slice().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    const active = newestFirst(records.filter(isActive));
    const history = newestFirst(records.filter((record) => !isActive(record)));
    const visibleHistory = showAllHistory ? history : history.slice(0, 5);

    return (
        <div>
            <div>
                <div className="border-b border-j-gray-100 bg-j-gray-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-j-gray-500 sm:px-5">
                    {activeLabel} <span className="ml-1 rounded-full bg-j-white px-2 py-0.5 text-j-gray-700">{active.length}</span>
                </div>
                {active.length ? active.map((record) => children(record)) : (
                    <p className="px-4 py-5 text-sm text-j-gray-500 sm:px-5">Nenhum item ativo.</p>
                )}
            </div>
            {history.length > 0 && (
                <details className="border-t border-j-gray-200">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-j-gray-600 hover:bg-j-gray-50 sm:px-5">
                        {historyLabel} ({history.length}) <span className="float-right text-j-gray-400">Expandir</span>
                    </summary>
                    <div className="divide-y divide-j-gray-100">
                        {visibleHistory.map((record) => children(record))}
                        {history.length > 5 && (
                            <button type="button" onClick={() => setShowAllHistory((value) => !value)} className="w-full px-4 py-3 text-sm font-bold text-j-blue-800 hover:bg-j-gray-50 sm:px-5">
                                {showAllHistory ? "Mostrar menos" : `Mostrar todos (${history.length})`}
                            </button>
                        )}
                    </div>
                </details>
            )}
        </div>
    );
}

interface SecuritySectionProps {
    title: string;
    description: string;
    isLoading: boolean;
    error: Error | null;
    onRetry: () => void;
    isEmpty: boolean;
    emptyMessage: string;
    children: ReactNode;
}

function SecuritySection({ title, description, isLoading, error, onRetry, isEmpty, emptyMessage, children }: SecuritySectionProps) {
    return (
        <section className="overflow-hidden rounded-xl border border-j-gray-200 bg-j-white">
            <header className="border-b border-j-gray-200 px-4 py-3 sm:px-5">
                <h3 className="font-extrabold text-j-gray-700">{title}</h3>
                <p className="mt-0.5 text-xs text-j-gray-500">{description}</p>
            </header>
            {isLoading ? (
                <p className="px-4 py-6 text-sm text-j-gray-500 sm:px-5">Carregando...</p>
            ) : error ? (
                <div className="flex flex-col items-start gap-3 p-4 sm:p-5">
                    <p className="text-sm text-j-red-500">Não foi possível carregar esta informação.</p>
                    <Button type="button" onClick={onRetry} className="gap-2 border border-j-gray-200 bg-j-white text-j-gray-700 hover:bg-j-gray-100"><RefreshCw size={15} /> Tentar novamente</Button>
                </div>
            ) : isEmpty ? (
                <p className="px-4 py-6 text-sm text-j-gray-500 sm:px-5">{emptyMessage}</p>
            ) : (
                <div className="divide-y divide-j-gray-100">{children}</div>
            )}
        </section>
    );
}

function RecordFields({ fields }: { fields: Array<[string, string]> }) {
    return (
        <dl className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-4">
            {fields.map(([label, value]) => (
                <div key={label} className="min-w-0">
                    <dt className="text-j-gray-400">{label}</dt>
                    <dd className="mt-0.5 break-words font-semibold text-j-gray-700">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

function SessionRow({ session, canLogout, onLogout }: { session: AdminSession; canLogout: boolean; onLogout: () => void }) {
    return (
        <article className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-j-blue-800">Sessão #{session.id}</strong><StatusBadge status={session.status} /></div>
                <RecordFields fields={[["Criada", formatDate(session.createdAt)], ["Expira", formatDate(session.expiresAt)], ["Encerrada", formatDate(session.loggedOutAt)]]} />
            </div>
            {canLogout && session.status === "ACTIVE" && <Button type="button" onClick={onLogout} className="shrink-0 bg-j-red-500 text-j-white hover:bg-j-red-600 hover:text-j-white">Encerrar sessão</Button>}
        </article>
    );
}

function RefreshTokenRow({ token, canRevoke, onRevoke }: { token: AdminRefreshToken; canRevoke: boolean; onRevoke: () => void }) {
    return (
        <article className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-j-blue-800">Token #{token.id}</strong><StatusBadge status={token.status} /></div>
                <RecordFields fields={[["Sessão", `#${token.sessionId}`], ["Criado", formatDate(token.createdAt)], ["Expira", formatDate(token.expiresAt)], ["Substituído por", token.replacedByTokenId ? `#${token.replacedByTokenId}` : "—"]]} />
            </div>
            {canRevoke && token.status === "ACTIVE" && <Button type="button" onClick={onRevoke} className="shrink-0 bg-j-red-500 text-j-white hover:bg-j-red-600 hover:text-j-white">Revogar token</Button>}
        </article>
    );
}

function RecoveryRequestRow({ request, canCancel, onCancel }: { request: AdminPasswordRecoveryRequest; canCancel: boolean; onCancel: () => void }) {
    const method = request.method?.replaceAll("_", " ").toLowerCase() ?? "—";
    return (
        <article className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-j-blue-800">Pedido #{request.id}</strong><StatusBadge status={request.status} /></div>
                <RecordFields fields={[["Método", method], ["Criado", formatDate(request.createdAt)], ["Expira", formatDate(request.expiresAt)], ["Resolvido", formatDate(request.resolvedAt)], ["Cancelado", formatDate(request.cancelledAt)]]} />
            </div>
            {canCancel && request.status === "OPEN" && <Button type="button" onClick={onCancel} className="shrink-0 bg-j-red-500 text-j-white hover:bg-j-red-600 hover:text-j-white">Cancelar pedido</Button>}
        </article>
    );
}
