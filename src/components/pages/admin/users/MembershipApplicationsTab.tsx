'use client';
import { confirmAction } from '@/components/common/tour/confirmTourExit';

import { Button } from '@/components/common/button';
import {
	approveMembershipApplicationWithLinkAction,
	approveMembershipApplicationWithTemporaryPasswordAction,
	generateUserTemporaryPasswordAction,
	listMembershipApplicationsAction,
	rejectAndBlockMembershipApplicantAction,
	rejectMembershipApplicationAction,
	resendMembershipActivationLinkAction,
} from '@/server/actions/admin/membership-applications';
import { useUserStore } from '@/stores/userStore';
import { maskCPF,maskPhoneNumber } from '@/utils/masks';
import { hasPermission } from '@/utils/permission/hasPermission';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { Check,Clipboard,LoaderCircle,Mail,MessageCircle,RefreshCw,ShieldAlert,X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ListPagination } from '@/components/common/table/ListPagination';

type GeneratedPasswordForWhatsApp = TemporaryPasswordApproval & { name: string; phoneNumber: string };

const statusLabel: Record<MembershipApplicationStatus, string> = {
    PENDING: 'Pendente', APPROVED: 'Aprovada', REJECTED: 'Rejeitada', COMPLETED: 'Concluída',
};

function applicationPhone(phoneNumber: string) {
    const digits = phoneNumber.replace(/\D/g, '');
    const nationalNumber = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
    return {
        display: digits.startsWith('55') && digits.length > 11 ? `+55 ${maskPhoneNumber(nationalNumber)}` : maskPhoneNumber(nationalNumber),
        whatsapp: digits.startsWith('55') ? digits : `55${digits}`,
    };
}

export function MembershipApplicationsTab() {
    const permissions = useUserStore((state) => state.permissions);
    const canRead = hasPermission(permissions, 'MEMBERSHIP', 'MEMBERSHIP_REQUEST_READ');
    const canApprove = hasPermission(permissions, 'MEMBERSHIP', 'MEMBERSHIP_REQUEST_APPROVE');
    const canReject = hasPermission(permissions, 'MEMBERSHIP', 'MEMBERSHIP_REQUEST_REJECT');
    const canBlock = hasPermission(permissions, 'MEMBERSHIP', 'MEMBERSHIP_APPLICANT_BLOCK');
    const canGeneratePassword = hasPermission(permissions, 'AUTHENTICATION', 'USER_TEMPORARY_PASSWORD_GENERATE');
    const [status, setStatus] = useState<MembershipApplicationStatus | ''>('PENDING');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const [temporaryPassword, setTemporaryPassword] = useState<GeneratedPasswordForWhatsApp | null>(null);
    const [approvedUserIds, setApprovedUserIds] = useState<Record<number, number>>({});
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['admin', 'membership-applications', status, page, pageSize],
        queryFn: () => listMembershipApplicationsAction({ page, size: pageSize, status: status || undefined }),
        enabled: canRead,
        retry: false,
    });

    const refreshList = async () => {
        await queryClient.invalidateQueries({ queryKey: ['admin', 'membership-applications'] });
    };
    const approve = useMutation({
        mutationFn: approveMembershipApplicationWithTemporaryPasswordAction,
        onSuccess: async (result, applicationId) => {
            const applicant = query.data?.content.find((item) => item.id === applicationId);
            setTemporaryPassword({ ...result, name: applicant?.name ?? 'associado', phoneNumber: applicant?.phoneNumber ?? '' });
            toast.success('Solicitação aprovada e usuário criado.');
            await refreshList();
        },

    });
    const approveByLink = useMutation({
        mutationFn: approveMembershipApplicationWithLinkAction,
        onSuccess: async (result, applicationId) => {
            setApprovedUserIds((current) => ({ ...current, [applicationId]: result.userId }));
            toast.success('Solicitação aprovada e convite enviado por e-mail.');
            await refreshList();
        },

    });
    const reject = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectMembershipApplicationAction(id, reason),
        onSuccess: async () => { toast.success('Solicitação rejeitada.'); await refreshList(); },

    });
    const rejectAndBlock = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) => rejectAndBlockMembershipApplicantAction(id, reason),
        onSuccess: async () => { toast.success('Solicitação rejeitada e CPF bloqueado.'); await refreshList(); },

    });
    const resend = useMutation({
        mutationFn: resendMembershipActivationLinkAction,
        onSuccess: async () => { toast.success('Convite reenviado.'); await refreshList(); },

    });
    const generatePassword = useMutation({
        mutationFn: ({ userId }: { userId: number; name: string; phoneNumber: string }) => generateUserTemporaryPasswordAction(userId),
        onSuccess: (result, variables) => {
            setTemporaryPassword({ ...result, name: variables.name, phoneNumber: variables.phoneNumber });
            toast.success('Senha provisória gerada.');
        },

    });

    if (!canRead) return <p className="rounded-xl bg-j-gray-50 p-5 text-sm text-j-gray-600">Seu usuário não tem permissão para consultar solicitações de associação.</p>;

    const busy = approve.isPending || approveByLink.isPending || reject.isPending || rejectAndBlock.isPending || resend.isPending || generatePassword.isPending;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-extrabold text-j-blue-800">Solicitações de associação</h2>
                    <p className="mt-1 text-sm text-j-gray-600">Analise os dados e a apresentação antes de aprovar ou rejeitar.</p>
                </div>
                <label id="tour-applications-status-filter" className="flex flex-col gap-1 text-xs font-bold text-j-gray-600">Status
                    <select value={status} onChange={(event) => { setStatus(event.target.value as MembershipApplicationStatus | ''); setPage(0); }} className="h-10 min-w-44 rounded-lg border border-j-gray-300 bg-white px-3 text-sm font-normal text-j-gray-800">
                        <option value="PENDING">Pendentes</option><option value="APPROVED">Aprovadas</option><option value="REJECTED">Rejeitadas</option><option value="COMPLETED">Concluídas</option><option value="">Todos os status</option>
                    </select>
                </label>
            </div>

            {temporaryPassword && (
                <section role="status" className="rounded-xl border border-j-yellow-400 bg-yellow-50 p-4">
                    <h3 className="font-bold text-j-blue-800">Senha provisória gerada</h3>
                    <p className="mt-1 text-sm text-j-gray-600">No primeiro acesso, o associado deverá criar uma senha permanente. Esta senha aparece somente nesta tela.</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <code className="rounded-lg border border-j-yellow-300 bg-white px-3 py-2 font-mono font-bold text-j-blue-800">{temporaryPassword.temporaryPassword}</code>
                        <Button type="button" onClick={async () => {
                            try { await navigator.clipboard.writeText(temporaryPassword.temporaryPassword); toast.success('Senha copiada.'); }
                            catch { toast.error('Não foi possível copiar automaticamente. Selecione e copie a senha.'); }
                        }} className="gap-2"><Clipboard size={16} /> Copiar senha</Button>
                        {temporaryPassword.phoneNumber && <a href={`https://wa.me/${applicationPhone(temporaryPassword.phoneNumber).whatsapp}?text=${encodeURIComponent(`Olá, ${temporaryPassword.name}! Sua solicitação de associação foi aprovada.\n\nSua senha provisória para o primeiro acesso é: ${temporaryPassword.temporaryPassword}\n\nApós entrar, você precisará criar uma nova senha.`)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"><MessageCircle size={16} /> Abrir WhatsApp</a>}
                        <Button type="button" onClick={() => setTemporaryPassword(null)} className="bg-j-gray-100 text-j-gray-700 hover:bg-j-gray-200 hover:text-j-gray-800">Fechar</Button>
                    </div>
                    <p className="mt-2 text-xs text-j-gray-500">Usuário #{temporaryPassword.userId}</p>
                </section>
            )}

            <div id="tour-applications-list" className="flex flex-col gap-4">
            {query.isLoading ? <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-j-gray-500"><LoaderCircle size={20} className="animate-spin" /> Carregando solicitações...</div> : null}
            {query.isError && <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-j-red-200 bg-j-red-50 p-6 text-center"><p className="text-sm text-j-red-700">{query.error.message}</p><Button type="button" onClick={() => void query.refetch()}><RefreshCw size={16} /> Tentar novamente</Button></div>}
            {query.data?.empty && <div className="rounded-xl border border-dashed border-j-gray-300 p-10 text-center text-sm text-j-gray-500">Nenhuma solicitação encontrada neste status.</div>}

            {query.data?.content.map((application, index) => {
                const reason = reasons[application.id] ?? '';
                const isPending = application.status === 'PENDING';
                const phone = applicationPhone(application.phoneNumber);
                const userId = application.userId ?? approvedUserIds[application.id];
                return (
                    <article key={application.id} className="rounded-2xl border border-j-gray-200 bg-white p-3 shadow-sm sm:p-4">
                        <header className="flex flex-wrap items-start justify-between gap-3">
                            <div><h3 className="text-lg font-extrabold text-j-blue-800">{application.name}</h3></div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : application.status === 'APPROVED' || application.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-j-gray-100 text-j-gray-600'}`}>{statusLabel[application.status]}</span>
                        </header>
                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-4">
                            <p><span className="block text-xs font-semibold text-j-gray-500">CPF</span><span className="font-medium text-j-gray-800">{maskCPF(application.cpf)}</span></p>
                            <p><span className="block text-xs font-semibold text-j-gray-500">Celular</span><a className="font-medium text-j-blue-700 underline" href={`https://wa.me/${phone.whatsapp}`} target="_blank" rel="noreferrer">{phone.display}</a></p>
                            <p className="col-span-2 min-w-0 lg:col-span-1"><span className="block text-xs font-semibold text-j-gray-500">E-mail</span><span className="break-words font-medium text-j-gray-800">{application.email || 'Não informado'}</span></p>
                            <p><span className="block text-xs font-semibold text-j-gray-500">Recebida</span><span className="font-medium text-j-gray-800">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(application.requestedAt))}</span></p>
                        </div>
                        <div className="mt-3 rounded-xl bg-j-gray-50 px-0 py-2"><h4 className="text-sm font-bold text-j-gray-700">Carta de apresentação</h4><p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-j-gray-700">{application.message || 'Nenhuma apresentação informada.'}</p></div>
                        {application.rejectionReason && <p className="mt-3 text-sm text-j-red-700"><strong>Motivo da rejeição:</strong> {application.rejectionReason}</p>}
                        {isPending && (canApprove || canReject) && <div id={index === 0 ? "tour-applications-actions" : undefined} className="mt-3 border-t border-j-gray-100 pt-3">
                            {canReject && <label className="mb-3 block text-xs font-bold text-j-gray-600">Motivo (opcional para rejeitar; obrigatório para bloquear)
                                <textarea value={reason} maxLength={2000} onChange={(event) => setReasons((current) => ({ ...current, [application.id]: event.target.value }))} rows={1} className="mt-1 block w-full rounded-lg border border-j-gray-300 p-2 text-sm font-normal text-j-gray-800" placeholder="Registre o motivo, se necessário." />
                            </label>}
                            <div className="flex flex-wrap justify-end gap-2">
                                {canApprove && <Button type="button" disabled={busy} onClick={async () => {
                                    if (await confirmAction(`Aprovar ${application.name} e gerar uma senha provisória?`)) approve.mutate(application.id);
                                }}><Check size={16} /> Aprovar e gerar senha</Button>}
                                {canApprove && application.email && <Button type="button" disabled={busy} onClick={async () => {
                                    if (await confirmAction(`Aprovar ${application.name} e enviar um convite por e-mail?`)) approveByLink.mutate(application.id);
                                }} className="bg-j-blue-100 text-j-blue-800 hover:bg-j-blue-200 hover:text-j-blue-900"><Mail size={16} /> Aprovar e enviar convite</Button>}
                                {canReject && <Button type="button" disabled={busy} onClick={async () => {
                                    if (await confirmAction(`Rejeitar a solicitação de ${application.name}?`)) reject.mutate({ id: application.id, reason });
                                }} className="bg-j-gray-100 text-j-gray-700 hover:bg-j-gray-200 hover:text-j-gray-800"><X size={16} /> Rejeitar</Button>}
                                {canBlock && <Button type="button" disabled={busy || !reason.trim()} onClick={async () => {
                                    if (await confirmAction(`Rejeitar e bloquear novas solicitações deste CPF?`)) rejectAndBlock.mutate({ id: application.id, reason });
                                }} className="bg-red-50 text-j-red-700 hover:bg-red-100 hover:text-j-red-800"><ShieldAlert size={16} /> Rejeitar e bloquear CPF</Button>}
                            </div>
                        </div>}
                        {application.status === 'APPROVED' && canApprove && application.email && <Button type="button" disabled={busy} onClick={() => resend.mutate(application.id)} className="mt-4 bg-j-blue-100 text-j-blue-800 hover:bg-j-blue-200 hover:text-j-blue-900"><RefreshCw size={16} /> Reenviar convite de ativação</Button>}
                        {application.status === 'APPROVED' && canGeneratePassword && userId && <Button type="button" disabled={busy} onClick={async () => {
                            if (await confirmAction(`Gerar uma nova senha provisória para ${application.name}?`)) {
                                generatePassword.mutate({ userId, name: application.name, phoneNumber: application.phoneNumber });
                            }
                        }} className="mt-4 ml-2 gap-2 bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900"><MessageCircle size={16} /> Gerar senha para WhatsApp</Button>}
                    </article>
                );
            })}

            {query.data && query.data.totalElements > 0 && <ListPagination itemLabel="solicitação" isFetching={query.isFetching} pagination={{
                pageIndex: query.data.number,
                pageSize,
                pageCount: query.data.totalPages,
                rowCount: query.data.totalElements,
                pageSizeOptions: [10, 20, 50],
                onChange: (next) => {
                    setPage(next.pageSize !== pageSize ? 0 : next.pageIndex);
                    setPageSize(next.pageSize);
                },
            }} />}
            </div>
        </div>
    );
}
