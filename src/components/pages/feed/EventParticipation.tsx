"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BadgeCheck, CalendarCheck, X } from "lucide-react";
import { cancelMyEventRegistrationAction, getMyEventRegistrationAction, registerForEventAction } from "@/actions/publications/event-registration";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";

type EventCharge = { name: string; amount: number; requiredForParticipation: boolean };
const currency = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

export function EventParticipation({ eventId, eventStatus, charges = [], compact = false }: { eventId: number; eventStatus: "OPEN" | "IN_PROGRESS" | "FINISHED" | "CANCELLED"; charges?: EventCharge[]; compact?: boolean }) {
    const permissions = useUserStore((state) => state.permissions);
    const canRegister = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTER");
    const canReadOwnRegistration = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTRATION_READ");
    const canCancel = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTRATION_CANCEL");
    const queryClient = useQueryClient();
    const registrationQueryKey = ["events", "registration", "me", eventId, permissions];
    const registration = useQuery({
        queryKey: registrationQueryKey,
        queryFn: () => getMyEventRegistrationAction(eventId),
        enabled: canReadOwnRegistration && eventStatus === "OPEN",
        staleTime: 15_000,
        retry: false,
    });
    const register = useMutation({
        mutationFn: () => registerForEventAction(eventId),
        onSuccess: async (result) => {
            queryClient.setQueryData(registrationQueryKey, result);
            await queryClient.invalidateQueries({ queryKey: ["publications"] });
            toast.success(result.status === "PENDING_PAYMENT" ? "Inscrição registrada. Há um pagamento pendente para este evento." : "Presença confirmada. Você está na lista do evento!");
        },

        onError: async (error) => {
            if (canReadOwnRegistration) await queryClient.invalidateQueries({ queryKey: registrationQueryKey, exact: true });
            toast.error(error.message || "Não foi possível confirmar sua participação.");
        },


    });
    const cancel = useMutation({
        mutationFn: () => cancelMyEventRegistrationAction(eventId),
        onSuccess: async (result) => {
            queryClient.setQueryData(registrationQueryKey, result);
            await queryClient.invalidateQueries({ queryKey: ["publications"] });
            toast.success("Sua inscrição foi cancelada.");
        },
        onError: (error) => toast.error(error.message || "Não foi possível cancelar sua inscrição."),
    });

    if (!canRegister && !canReadOwnRegistration) return null;

    const currentRegistration = registration.data;
    const requiredAmount = charges.filter((charge) => charge.requiredForParticipation).reduce((total, charge) => total + charge.amount, 0);
    const isPending = register.isPending || cancel.isPending;
    const buttonClass = compact
        ? "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-j-yellow-300 px-4 text-sm font-extrabold text-j-blue-900 shadow-sm transition-colors hover:bg-j-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 disabled:cursor-wait disabled:opacity-60"
        : "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-j-yellow-300 px-5 text-sm font-extrabold text-j-blue-900 shadow-sm transition-colors hover:bg-j-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-j-blue-800 disabled:cursor-wait disabled:opacity-60";

    if (currentRegistration && currentRegistration.status !== "CANCELLED") {
        const pendingPayment = currentRegistration.status === "PENDING_PAYMENT";
        const label = pendingPayment ? "Inscrição pendente de pagamento" : "Você vai participar";
        return <div className={`flex flex-wrap items-center gap-2 ${compact ? "w-full" : ""}`}>
            <span role="status" className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold ${pendingPayment ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}>
                {pendingPayment ? <CalendarCheck size={17} aria-hidden="true" /> : <BadgeCheck size={17} aria-hidden="true" />}{label}
            </span>
            {canCancel && eventStatus === "OPEN" && <button type="button" disabled={isPending} onClick={() => cancel.mutate()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-j-gray-300 px-4 text-sm font-bold text-j-gray-600 transition-colors hover:border-red-300 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-j-blue-800 disabled:opacity-50">
                <X size={16} aria-hidden="true" />{cancel.isPending ? "Cancelando..." : "Cancelar inscrição"}
            </button>}
        </div>;
    }



    if (currentRegistration?.status === "CANCELLED") return <div className={`flex flex-col gap-1.5 ${compact ? "w-full" : ""}`}>
        <span role="status" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-j-gray-100 px-4 text-sm font-bold text-j-gray-600">
            <X size={17} aria-hidden="true" />Inscrição cancelada
        </span>
        <p className="text-xs leading-relaxed text-j-gray-500">Após cancelar, não dá para se inscrever novamente neste evento. Fale com a administração se quiser voltar.</p>
    </div>;
    if (!canRegister || eventStatus !== "OPEN") return null;
    if (canReadOwnRegistration && registration.isLoading) return <button type="button" disabled className={buttonClass}>Verificando inscrição...</button>;

    return <div className={`flex flex-col gap-2 ${compact ? "w-full" : ""}`}>
        {charges.length > 0 && <div className="rounded-xl bg-j-gray-100 px-3 py-2 text-xs text-j-gray-600" aria-label="Valores do evento">
            {requiredAmount > 0 ? <p className="font-bold text-j-blue-800">Inscrição: {currency(requiredAmount)}{charges.filter((charge) => charge.requiredForParticipation).length > 1 ? " (obrigatório)" : ""}</p> : <p className="font-bold text-j-blue-800">Participação gratuita</p>}
            {charges.filter((charge) => !charge.requiredForParticipation).map((charge) => <p key={charge.name}>{charge.name}: {currency(charge.amount)} (opcional)</p>)}
        </div>}
        <button type="button" disabled={isPending} onClick={() => register.mutate()} className={buttonClass}>
        <CalendarCheck size={18} aria-hidden="true" />{register.isPending ? "Confirmando presença..." : "Participar do evento"}
        </button>
    </div>;
}
