'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserActivationInvitationAction, resendUserActivationInvitationAction } from '@/actions/admin/users/activation-invitation';
import { Button } from '@/components/common/button';

const labels: Record<AdminInvitationStatus, string> = {
    QUEUED: 'Na fila de envio',
    SENT: 'Enviado',
    DELIVERY_FAILED: 'Falha na entrega',
};

export function UserActivationInvitation({ userId }: { userId: number }) {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['admin-users', userId, 'activation-invitation'],
        queryFn: () => getUserActivationInvitationAction(userId),
        enabled: false,
        retry: false,
    });
    const resend = useMutation({
        mutationFn: () => resendUserActivationInvitationAction(userId),
        onSuccess: (data) => {
            queryClient.setQueryData(['admin-users', userId, 'activation-invitation'], data);
            toast.success('Convite reenviado.');
        },
        onError: (error) => toast.error(error.message),
    });

    return (
        <section className="rounded-xl border border-j-gray-200 bg-j-white p-4 sm:col-span-2">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-j-blue-50 text-j-blue-800"><Mail size={19} /></span>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-j-blue-800">Convite de ativação</h3>
                    <p className="mt-1 text-sm text-j-gray-600">Consulte o envio ou solicite um novo convite por e-mail.</p>
                    {query.data && <p className="mt-2 text-sm font-semibold text-j-gray-700">Status: {labels[query.data.invitationStatus]}</p>}
                    {query.isError && <p role="alert" className="mt-2 text-sm text-j-red-600">{query.error.message}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" disabled={query.isFetching || resend.isPending} onClick={() => void query.refetch()} className="border border-j-gray-300 bg-j-white text-j-blue-800 hover:bg-j-gray-100 hover:text-j-blue-800">
                            {query.isFetching ? <RefreshCw size={16} className="animate-spin" /> : null} Consultar status
                        </Button>
                        <Button type="button" disabled={resend.isPending || query.isFetching} onClick={() => resend.mutate()}>
                            {resend.isPending ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />} Reenviar convite
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
