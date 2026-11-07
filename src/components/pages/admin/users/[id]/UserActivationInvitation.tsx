'use client';

import { Button } from '@/components/common/button';
import {
    getUserActivationInvitationAction,
    resendUserActivationInvitationAction,
} from '@/server/actions/admin/users/activation-invitation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const labels: Record<AdminInvitationStatus, string> = {
    QUEUED: 'Na fila de envio',
    SENT: 'Enviado',
    DELIVERY_FAILED: 'Falha na entrega',
    INVALIDATED: 'Invalidado (e-mail alterado)',
    REVOKED: 'Revogado',
};

const statusStyles: Record<AdminInvitationStatus, string> = {
    QUEUED: 'bg-amber-100 text-amber-800',
    SENT: 'bg-blue-100 text-blue-800',
    DELIVERY_FAILED: 'bg-red-100 text-red-800',
    INVALIDATED: 'bg-amber-100 text-amber-800',
    REVOKED: 'bg-j-gray-100 text-j-gray-600',
};

export function UserActivationInvitation({
    userId,
    userStatus,
}: {
    userId: number;
    userStatus: UserStatus;
}) {
    const queryClient = useQueryClient();
    const isEligibleStatus = userStatus === 'ACTIVE';

    const query = useQuery({
        queryKey: ['admin-users', userId, 'activation-invitation'],
        queryFn: () => getUserActivationInvitationAction(userId),
        enabled: isEligibleStatus,
        retry: false,
    });

    const resend = useMutation({
        mutationFn: () => resendUserActivationInvitationAction(userId),
        onSuccess: (data) => {
            queryClient.setQueryData(['admin-users', userId, 'activation-invitation'], data);
            toast.success('Convite de ativação enviado.');
        },
    });

    if (!isEligibleStatus) return null;

    const invitation = query.data;
    const isBusy = query.isFetching || resend.isPending;

    return (
        <section className="rounded-2xl border border-j-gray-200 bg-gradient-to-br from-white to-j-gray-50 p-4 shadow-sm sm:col-span-2 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300">
                        <Mail size={19} />
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-j-blue-800">Convite de ativação por e-mail</h3>
                            {invitation && (
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[invitation.invitationStatus]}`}
                                >
                                    {labels[invitation.invitationStatus] ?? invitation.invitationStatus}
                                </span>
                            )}
                            {query.isLoading && (
                                <span className="text-xs text-j-gray-500">Consultando status...</span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-j-gray-600">
                            {invitation?.invitationStatus === 'INVALIDATED'
                                ? 'O convite anterior foi invalidado após alteração de e-mail. Reenvie um novo convite se o primeiro acesso ainda estiver pendente.'
                                : invitation?.invitationStatus === 'DELIVERY_FAILED'
                                    ? 'Houve falha na entrega do convite anterior. Você pode reenviar um novo link de ativação.'
                                    : invitation
                                        ? 'Acompanhe o status de entrega ou reenvie o link de primeiro acesso para o e-mail cadastrado.'
                                        : 'Nenhum convite ativo emitido no momento. Caso a conta ainda esteja pendente de primeiro acesso, você pode emitir um convite por e-mail.'}
                        </p>
                        {query.isError && (
                            <p role="alert" className="mt-1 text-xs text-j-red-600">
                                {query.error.message}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <Button
                        type="button"
                        disabled={isBusy}
                        onClick={() => resend.mutate()}
                        className="min-h-10 gap-2 rounded-xl bg-j-yellow-300 px-4 text-j-blue-900 hover:bg-yellow-400 hover:text-j-blue-900"
                    >
                        {resend.isPending ? (
                            <RefreshCw size={16} className="animate-spin" />
                        ) : (
                            <Mail size={16} />
                        )}{' '}
                        {invitation ? 'Reenviar convite' : 'Emitir convite'}
                    </Button>
                    <Button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void query.refetch()}
                        aria-label="Atualizar status do convite"
                        className="min-h-10 gap-2 rounded-xl border border-j-gray-300 bg-white px-3 text-j-gray-700 hover:bg-j-gray-100 hover:text-j-gray-800"
                    >
                        <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} />
                        <span className="sm:hidden">Atualizar</span>
                    </Button>
                </div>
            </div>
        </section>
    );
}
