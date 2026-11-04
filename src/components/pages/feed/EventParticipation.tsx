"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { BadgeCheck, CalendarCheck, X } from "lucide-react";
import { cancelMyEventRegistrationAction, getMyEventRegistrationAction, registerForEventAction } from "@/actions/publications/event-registration";
import { listVehiclesMemberAction } from "@/actions/vehicles/list-member";
import { listDependentsAction } from "@/actions/dependents";
import { useModal } from "@/providers/ModalProvider";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";

type EventCharge = { name: string; description?: string | null; amount: number; requiredForParticipation: boolean };
type Allocation = { vehicleId: number; member: boolean; dependentIds: number[] };
const currency = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

function EventRegistrationForm({ onSubmit, busy }: { onSubmit: (allocations: Allocation[], dependentIds: number[]) => Promise<unknown>; busy: boolean }) {
    const vehicles = useQuery({ queryKey: ["event-registration", "vehicles"], queryFn: () => listVehiclesMemberAction({ page: 0, size: 50 }) });
    const dependents = useQuery({ queryKey: ["event-registration", "dependents"], queryFn: () => listDependentsAction() });
    const [vehicleId, setVehicleId] = useState("");
    const [dependentIds, setDependentIds] = useState<number[]>([]);
    const vehicleItems = vehicles.data?.content ?? [];
    const activeDependents = (dependents.data ?? []).filter((dependent) => dependent.status === "ACTIVE");
    return <div className="flex flex-col gap-4">
        <p className="text-sm text-j-gray-600">Informe o veículo e os dependentes que participarão com você.</p>
        {vehicles.isLoading || dependents.isLoading ? <p role="status" className="text-sm text-j-gray-500">Carregando seus dados...</p> : null}
        {(vehicles.isError || dependents.isError) && <p role="alert" className="text-sm text-red-600">Não foi possível carregar veículos ou dependentes. Feche e tente novamente.</p>}
        {vehicleItems.length > 0 && <label className="flex flex-col gap-1 text-sm font-semibold text-j-gray-700">Veículo (opcional)<select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} className="rounded-xl border border-j-gray-300 bg-white px-3 py-2"><option value="">Sem veículo</option>{vehicleItems.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.nickname || vehicle.model} · {vehicle.plate}</option>)}</select></label>}
        {activeDependents.length > 0 && <fieldset className="flex flex-col gap-2"><legend className="mb-2 text-sm font-semibold text-j-gray-700">Dependentes (opcional)</legend>{activeDependents.map((dependent) => <label key={dependent.id} className="flex items-center gap-2 text-sm text-j-gray-600"><input type="checkbox" checked={dependentIds.includes(dependent.id)} onChange={(event) => setDependentIds((current) => event.target.checked ? [...current, dependent.id] : current.filter((id) => id !== dependent.id))} />{dependent.name}</label>)}</fieldset>}
        <div className="flex flex-col-reverse gap-3 border-t border-j-gray-200 pt-4 sm:flex-row">
            <button type="button" disabled={busy || vehicles.isLoading || dependents.isLoading || vehicles.isError || dependents.isError} onClick={() => void onSubmit(vehicleId ? [{ vehicleId: Number(vehicleId), member: true, dependentIds }] : [], vehicleId ? [] : dependentIds)} className="min-h-11 flex-1 rounded-xl bg-j-yellow-300 px-4 text-sm font-extrabold text-j-blue-900 disabled:opacity-50">{busy ? "Confirmando inscrição..." : "Concluir inscrição"}</button>
        </div>
    </div>;
}

function EventRegistrationDialog({ title, amount, paid, onClose, onSubmit, busy }: { title: string; amount: number; paid: boolean; onClose: () => void; onSubmit: (allocations: Allocation[], dependentIds: number[]) => Promise<unknown>; busy: boolean }) {
    const [confirmed, setConfirmed] = useState(!paid);
    return <div role="dialog" aria-modal="true" aria-labelledby="event-registration-title" className="flex max-h-[92dvh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        <div><h2 id="event-registration-title" className="text-xl font-extrabold text-j-blue-800">{paid && !confirmed ? "Confirmar participação" : "Inscrição no evento"}</h2><p className="mt-2 text-sm text-j-gray-600">{title}</p></div>
        {paid && !confirmed ? <><div className="rounded-2xl bg-j-gray-100 p-4"><p className="text-sm text-j-gray-600">Entrada</p><p className="mt-1 text-2xl font-extrabold text-j-blue-800">{currency(amount)}</p><p className="mt-2 text-xs leading-relaxed text-j-gray-500">Ao concluir a inscrição, o valor será registrado como pendente no seu histórico de gastos.</p></div><div className="flex flex-col-reverse gap-3 sm:flex-row"><button type="button" onClick={onClose} className="min-h-11 flex-1 rounded-xl border border-j-gray-300 px-4 text-sm font-bold text-j-gray-600">Cancelar</button><button type="button" onClick={() => setConfirmed(true)} className="min-h-11 flex-1 rounded-xl bg-j-yellow-300 px-4 text-sm font-extrabold text-j-blue-900">Confirmar e continuar</button></div></> : <><EventRegistrationForm onSubmit={onSubmit} busy={busy} /><button type="button" onClick={onClose} disabled={busy} className="text-sm font-semibold text-j-gray-500">Voltar</button></>}
    </div>;
}

export function EventParticipation({ eventId, eventStatus, charges = [], compact = false, eventTitle = "Evento" }: { eventId: number; eventStatus: "OPEN" | "IN_PROGRESS" | "FINISHED" | "CANCELLED"; charges?: EventCharge[]; compact?: boolean; eventTitle?: string }) {
    const permissions = useUserStore((state) => state.permissions);
    const canRegister = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTER");
    const canReadOwnRegistration = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTRATION_READ");
    const canCancel = hasPermission(permissions, "PUBLICATIONS", "EVENT_REGISTRATION_CANCEL");
    const { setContent, setOpen, setClose } = useModal();
    const queryClient = useQueryClient();
    const registrationQueryKey = ["events", "registration", "me", eventId, permissions];
    const registration = useQuery({ queryKey: registrationQueryKey, queryFn: () => getMyEventRegistrationAction(eventId), enabled: canReadOwnRegistration && eventStatus === "OPEN", staleTime: 15_000, retry: false });
    const register = useMutation({
        mutationFn: ({ allocations, dependentIds }: { allocations: Allocation[]; dependentIds: number[] }) => registerForEventAction(eventId, allocations, dependentIds),
        onSuccess: async (result) => { queryClient.setQueryData(registrationQueryKey, result); await queryClient.invalidateQueries({ queryKey: ["publications"] }); setClose(); toast.success(result.status === "PENDING_PAYMENT" ? "Inscrição registrada. O pagamento está pendente." : "Inscrição realizada com sucesso!"); },
        onError: async (error) => { if (canReadOwnRegistration) await queryClient.invalidateQueries({ queryKey: registrationQueryKey, exact: true }); toast.error(error.message || "Não foi possível confirmar sua participação."); },
    });
    const cancel = useMutation({ mutationFn: () => cancelMyEventRegistrationAction(eventId), onSuccess: async (result) => { queryClient.setQueryData(registrationQueryKey, result); await queryClient.invalidateQueries({ queryKey: ["publications"] }); toast.success("Sua inscrição foi cancelada."); }, onError: (error) => toast.error(error.message || "Não foi possível cancelar sua inscrição.") });
    if (!canRegister && !canReadOwnRegistration) return null;
    const requiredCharges = charges.filter((charge) => charge.requiredForParticipation);
    const requiredAmount = requiredCharges.reduce((total, charge) => total + charge.amount, 0);
    const paid = requiredAmount > 0;
    const isPending = register.isPending || cancel.isPending;
    const buttonClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-j-yellow-300 px-4 text-sm font-extrabold text-j-blue-900 shadow-sm transition-colors hover:bg-j-yellow-400 disabled:cursor-wait disabled:opacity-60 ${compact ? "w-full" : ""}`;
    const currentRegistration = registration.data;
    if (currentRegistration && currentRegistration.status !== "CANCELLED") return <div className={`flex flex-wrap items-center gap-2 ${compact ? "w-full" : ""}`}><span role="status" className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-extrabold ${currentRegistration.status === "PENDING_PAYMENT" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}><BadgeCheck size={17} />{currentRegistration.status === "PENDING_PAYMENT" ? "Inscrição pendente de pagamento" : "Você vai participar"}</span>{canCancel && eventStatus === "OPEN" && <button type="button" disabled={isPending} onClick={() => cancel.mutate()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-j-gray-300 px-4 text-sm font-bold text-j-gray-600">{cancel.isPending ? "Cancelando..." : <><X size={16} />Cancelar inscrição</>}</button>}</div>;
    if (currentRegistration?.status === "CANCELLED") return <span role="status" className="inline-flex min-h-11 items-center rounded-xl bg-j-gray-100 px-4 text-sm font-bold text-j-gray-600">Inscrição cancelada. Fale com a administração para voltar.</span>;
    if (!canRegister || eventStatus !== "OPEN") return null;
    if (canReadOwnRegistration && registration.isLoading) return <button type="button" disabled className={buttonClass}>Verificando inscrição...</button>;
    const openRegistration = () => { setContent(<EventRegistrationDialog title={eventTitle} amount={requiredAmount} paid={paid} busy={register.isPending} onClose={setClose} onSubmit={(allocations, dependentIds) => register.mutateAsync({ allocations, dependentIds })} />); setOpen(); };
    return <div className={`flex flex-col gap-2 ${compact ? "w-full" : ""}`}>
        <div className="rounded-xl bg-j-gray-100 px-3 py-2 text-sm text-j-gray-600" aria-label="Valores do evento">{paid ? <><p className="font-bold text-j-blue-800">{currency(requiredAmount)} — {requiredCharges[0]?.name || "Inscrição"}</p>{requiredCharges[0]?.description && <p className="mt-1 text-xs">{requiredCharges[0].description}</p>}</> : <p className="font-bold text-j-blue-800">Entrada gratuita</p>}{charges.filter((charge) => !charge.requiredForParticipation).map((charge) => <p key={charge.name}>{charge.name}: {currency(charge.amount)} (opcional)</p>)}</div>
        <button type="button" disabled={isPending} onClick={openRegistration} className={buttonClass}><CalendarCheck size={18} />Participar do evento</button>
    </div>;
}
