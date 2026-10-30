"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { BadgeCheck, CalendarCheck, X } from "lucide-react";
import { cancelMyEventRegistrationAction, getMyEventRegistrationAction, registerForEventAction, requestEventGuestAction } from "@/server/actions/publications/event-registration";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { useModal } from "@/providers/ModalProvider";
import { EventRegistrationModal, type EventRegistrationFormData } from "./EventRegistrationModal";

export function EventParticipation({ eventId, eventStatus, compact = false }: { eventId: number; eventStatus: "OPEN" | "IN_PROGRESS" | "FINISHED" | "CANCELLED"; compact?: boolean }) {
    const permissions = useUserStore((state) => state.permissions);
    const canRegister = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTER");
    const canReadOwnRegistration = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTRATION_READ");
    const canCancel = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTRATION_CANCEL");
    const canRequestGuest = hasPermission(permissions, "PUBLICATIONS", "EVENT_GUEST_REQUEST_CREATE");
    const queryClient = useQueryClient();
    const { setContent, setOpen, setClose } = useModal();
    const [guestRetryData, setGuestRetryData] = useState<{ vehicleId: number; cpf: string; guestName: string } | null>(null);
    const registrationQueryKey = ["events", "registration", "me", eventId, permissions];
    const registration = useQuery({
        queryKey: registrationQueryKey,
        queryFn: () => getMyEventRegistrationAction(eventId),
        enabled: canReadOwnRegistration && eventStatus === "OPEN",
        staleTime: 15_000,
        retry: false,
    });
    const register = useMutation({
        mutationFn: async (data: EventRegistrationFormData) => {
            const registration = await registerForEventAction(eventId, data);
            if (!data.guest) return { registration, guestRequested: false, guestError: false, guestRetryData: null };
            try {
                await requestEventGuestAction(eventId, { vehicleId: data.vehicleId, cpf: data.guest.cpf, guestName: data.guest.name });
                return { registration, guestRequested: true, guestError: false, guestRetryData: null };
            } catch {
                return { registration, guestRequested: false, guestError: true, guestRetryData: { vehicleId: data.vehicleId, cpf: data.guest.cpf, guestName: data.guest.name } };
            }
        },
        onSuccess: async ({ registration: result, guestRequested, guestError, guestRetryData: retryData }) => {
            queryClient.setQueryData(registrationQueryKey, result);
            await queryClient.invalidateQueries({ queryKey: ["publications"] });
            setGuestRetryData(retryData);
            if (guestRequested) toast.success("Solicitação do convidado enviada para aprovação.");
            if (guestError) toast.error("Sua inscrição foi feita, mas o pedido do convidado não foi enviado. Tente novamente no botão abaixo.");
            setClose();
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
    const retryGuest = useMutation({
        mutationFn: () => {
            if (!guestRetryData) throw new Error("Não há solicitação para reenviar.");
            return requestEventGuestAction(eventId, guestRetryData);
        },
        onSuccess: () => {
            setGuestRetryData(null);
            toast.success("Solicitação do convidado enviada para aprovação.");
        },
        onError: (error) => toast.error(error.message || "Não foi possível reenviar a solicitação do convidado."),
    });

    if (!canRegister && !canReadOwnRegistration) return null;

    const currentRegistration = registration.data;
    const isPending = register.isPending || cancel.isPending || retryGuest.isPending;
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
            {canRequestGuest && guestRetryData && eventStatus === "OPEN" && <button type="button" disabled={retryGuest.isPending} onClick={() => retryGuest.mutate()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-300 px-4 text-sm font-bold text-amber-800 transition-colors hover:bg-amber-50 disabled:opacity-50">
                {retryGuest.isPending ? "Enviando pedido..." : "Tentar pedido do convidado novamente"}
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

    function openRegistrationModal() {
        setContent(<EventRegistrationModal eventId={eventId} canRequestGuest={canRequestGuest} onSubmit={(data) => register.mutateAsync(data)} />);
        setOpen();
    }

    return <button type="button" disabled={isPending} onClick={openRegistrationModal} className={buttonClass}>
        <CalendarCheck size={18} aria-hidden="true" />{register.isPending ? "Confirmando presença..." : "Participar do evento"}
    </button>;
}
