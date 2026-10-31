'use client';
import { confirmAction } from '@/components/common/tour/confirmTourExit';

import { Button } from '@/components/common/button';
import { getUserActivationInvitationAction,resendUserActivationInvitationAction,revokeUserActivationInvitationAction } from '@/server/actions/admin/users/activation-invitation';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { Ban,ChevronDown,Mail,RefreshCw } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const labels: Record<AdminInvitationStatus, string> = {
    QUEUED: 'Na fila de envio',
    SENT: 'Enviado',
    DELIVERY_FAILED: 'Falha na entrega',
    REVOKED: 'Revogado',
};

const statusStyles: Record<AdminInvitationStatus, string> = {
    QUEUED: 'bg-amber-100 text-amber-800',
    SENT: 'bg-blue-100 text-blue-800',
    DELIVERY_FAILED: 'bg-red-100 text-red-800',
    REVOKED: 'bg-j-gray-100 text-j-gray-600',
};

export function UserActivationInvitation({ userId, userStatus }: { userId: number; userStatus: UserStatus }) {
    const [showMore, setShowMore] = useState(false);
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['admin-users', userId, 'activation-invitation'],
        queryFn: () => getUserActivationInvitationAction(userId),
        enabled: userStatus === 'PENDING_FIRST_ACCESS',
        retry: false,
    });
    const resend = useMutation({
        mutationFn: () => resendUserActivationInvitationAction(userId),
        onSuccess: (data) => {
            queryClient.setQueryData(['admin-users', userId, 'activation-invitation'], data);
            toast.success('Convite reenviado.');
        },

    });
    const revoke = useMutation({
        mutationFn: () => revokeUserActivationInvitationAction(userId),
        onSuccess: () => {
            queryClient.setQueryData<AdminUserInvitationStatusResponse>(['admin-users', userId, 'activation-invitation'], {
                userId,
                invitationStatus: 'REVOKED',
            });
            toast.success('Convite revogado. O link de ativação não poderá mais ser usado.');
        },

    });
    const isRevoked = query.data?.invitationStatus === 'REVOKED';
    const isBusy = query.isFetching || resend.isPending || revoke.isPending;

    if (userStatus !== 'PENDING_FIRST_ACCESS') return null;

    return (
        <section className="rounded-2xl border border-j-gray-200 bg-gradient-to-br from-white to-j-gray-50 p-4 shadow-sm sm:col-span-2 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300"><Mail size={19} /></span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-j-blue-800">Convite de ativação</h3>
                            {query.data && <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[query.data.invitationStatus]}`}>{labels[query.data.invitationStatus]}</span>}
                            {query.isLoading && <span className="text-xs text-j-gray-500">Consultando status...</span>}
                        </div>
                        <p className="mt-1 text-sm text-j-gray-600">O usuário ainda precisa ativar a conta pelo e-mail.</p>
                        {query.isError && <p role="alert" className="mt-1 text-xs text-j-red-600">{query.error.message}</p>}
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <Button type="button" disabled={isBusy} onClick={() => resend.mutate()} className="min-h-10 gap-2 rounded-xl bg-j-yellow-300 px-4 text-j-blue-900 hover:bg-yellow-400 hover:text-j-blue-900">
                        {resend.isPending ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />} {isRevoked ? 'Enviar novo convite' : 'Reenviar convite'}
                    </Button>
                    <Button type="button" disabled={isBusy} onClick={() => void query.refetch()} aria-label="Atualizar status do convite" className="min-h-10 gap-2 rounded-xl border border-j-gray-300 bg-white px-3 text-j-gray-700 hover:bg-j-gray-100 hover:text-j-gray-800">
                        <RefreshCw size={16} className={query.isFetching ? 'animate-spin' : ''} /><span className="sm:hidden">Atualizar</span>
                    </Button>
                    {!isRevoked && <Button type="button" onClick={() => setShowMore((current) => !current)} aria-expanded={showMore} className="min-h-10 gap-1 rounded-xl bg-transparent px-2 text-xs text-j-gray-500 hover:bg-j-gray-100 hover:text-j-gray-700">
                        Opções <ChevronDown size={15} className={showMore ? 'rotate-180 transition-transform' : 'transition-transform'} />
                    </Button>}
                </div>
            </div>
            {showMore && !isRevoked && <div className="mt-4 flex justify-end border-t border-j-gray-200 pt-3">
                <Button type="button" disabled={isBusy} onClick={async () => {
                    if (await confirmAction('Revogar este convite? O link enviado por e-mail deixará de funcionar.')) revoke.mutate();
                }} className="min-h-9 gap-2 rounded-lg bg-transparent px-3 text-xs text-j-red-700 hover:bg-red-50 hover:text-j-red-800">
                    {revoke.isPending ? <RefreshCw size={15} className="animate-spin" /> : <Ban size={15} />} Revogar convite
                </Button>
            </div>}
        </section>
    );
}
