"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, CarFront, LoaderCircle, Users, UserRoundPlus, X } from "lucide-react";
import Link from "next/link";
import { listVehiclesMemberAction } from "@/server/actions/vehicles/list-member";
import { listDependentsAction } from "@/server/actions/dependents";
import { useModal } from "@/providers/ModalProvider";
import { maskCPF } from "@/utils/masks";
import { isValidCPF } from "@/utils/validate/validateCPF";


import { VehiclePhotoCarousel } from "@/components/pages/profile/tabs/vehicles/VehiclePhotoCarousel";
import { vehiclePhotoKeys } from "@/utils/media/vehiclePhotos";

export interface EventRegistrationFormData {
    vehicleId: number;
    dependentIds: number[];
    guest?: { name: string; cpf: string };
}

export function EventRegistrationModal({ eventId, onSubmit, canRequestGuest }: {
    eventId: number;
    onSubmit: (data: EventRegistrationFormData) => Promise<unknown>;
    canRequestGuest: boolean;
}) {
    const { setClose } = useModal();
    const [vehicleId, setVehicleId] = useState("");
    const [dependentIds, setDependentIds] = useState<number[]>([]);
    const [includeGuest, setIncludeGuest] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [guestCPF, setGuestCPF] = useState("");
    const [guestCPFError, setGuestCPFError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const vehiclesQuery = useQuery({
        queryKey: ["vehicles", "list-member", "event-registration", 0],
        queryFn: () => listVehiclesMemberAction({ page: 0, size: 50 }),
    });
    const dependentsQuery = useQuery({ queryKey: ["dependents"], queryFn: listDependentsAction });
    const vehicles = (vehiclesQuery.data?.content ?? []).filter((vehicle) => vehicle.status === "ACTIVE");
    const dependents = (dependentsQuery.data ?? []).filter((dependent) => dependent.status === "ACTIVE");
    const loading = vehiclesQuery.isPending || dependentsQuery.isPending;
    const loadError = vehiclesQuery.isError || dependentsQuery.isError;

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!vehicleId) return;
        const guestCPFDigits = guestCPF.replace(/\D/g, "");
        if (includeGuest && (!canRequestGuest || guestName.trim().length < 2 || !isValidCPF(guestCPFDigits))) {
            setGuestCPFError(includeGuest && !isValidCPF(guestCPFDigits));
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
            vehicleId: Number(vehicleId),
            dependentIds,
            ...(includeGuest ? { guest: { name: guestName.trim(), cpf: guestCPFDigits } } : {}),
            });
        } catch {
            setIsSubmitting(false);
        }
    }

    function toggleDependent(id: number) {
        setDependentIds((selected) => selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
    }

    return <section aria-labelledby="event-registration-title" className="max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-j-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-j-gray-200 px-5 py-5 sm:px-6">
            <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-j-yellow-600">Inscrição no evento</p>
                <h2 id="event-registration-title" className="mt-1 text-xl font-extrabold text-j-blue-900">Como você vai participar?</h2>
                <p className="mt-1 text-sm text-j-gray-500">Escolha o veículo e quem vai com você.</p>
            </div>
            <button type="button" onClick={setClose} aria-label="Fechar" className="rounded-full p-2 text-j-gray-500 hover:bg-j-gray-100"><X size={20} /></button>
        </header>

        {loading ? <p role="status" className="p-6 text-sm text-j-gray-500">Carregando seus veículos e dependentes...</p> : loadError ? <div role="alert" className="p-6"><p className="text-sm text-red-600">Não foi possível carregar seus veículos e dependentes.</p><button type="button" onClick={() => { void vehiclesQuery.refetch(); void dependentsQuery.refetch(); }} className="mt-3 text-sm font-bold text-j-blue-700 underline">Tentar novamente</button></div> : (
            <form onSubmit={submit} className="flex flex-col gap-5 p-5 sm:p-6">
                <fieldset>
                    <legend className="mb-2 flex items-center gap-2 text-sm font-extrabold text-j-blue-900"><CarFront size={17} />Seu veículo <span className="text-j-red-500">*</span></legend>

                    {vehicles.length ? <div role="radiogroup" aria-label="Selecione seu veículo" className="grid gap-2 sm:grid-cols-2">
                        {vehicles.map((vehicle) => {
                            const photos = vehiclePhotoKeys(vehicle);
                            const label = vehicle.nickname || `${vehicle.model} • ${vehicle.plate}`;
                            const selected = vehicleId === String(vehicle.id);
                            return <button key={vehicle.id} type="button" role="radio" aria-checked={selected} onClick={() => setVehicleId(String(vehicle.id))} className={`flex min-w-0 items-center gap-3 rounded-xl border p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-j-blue-800 ${selected ? "border-j-blue-700 bg-blue-50 ring-2 ring-j-blue-100" : "border-j-gray-200 hover:border-j-blue-300 hover:bg-j-gray-100"}`}>
                                <VehiclePhotoCarousel photos={photos.length ? photos : undefined} cover={vehicle.photo} alt={`Foto do veículo ${label}`} className="h-16 w-20 shrink-0 rounded-lg" />
                                <span className="min-w-0"><span className="block truncate text-sm font-extrabold text-j-blue-900">{label}</span><span className="mt-1 block truncate text-xs text-j-gray-500">{vehicle.plate} · {vehicle.modelYear}</span></span>
                            </button>;
                        })}
                    </div> : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Você ainda não tem um veículo ativo cadastrado. <Link href="/profile" onClick={setClose} className="font-bold underline">Cadastrar veículo</Link></p>}


                </fieldset>

                <fieldset>
                    <legend className="mb-2 flex items-center gap-2 text-sm font-extrabold text-j-blue-900"><Users size={17} />Dependentes que vão com você</legend>
                    {dependents.length ? <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-j-gray-200 p-3">
                        {dependents.map((dependent) => <label key={dependent.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-j-gray-700 hover:bg-j-gray-100">
                            <input type="checkbox" checked={dependentIds.includes(dependent.id)} onChange={() => toggleDependent(dependent.id)} className="size-4 accent-[#ffcc00]" />
                            <span className="font-semibold">{dependent.name}</span>
                        </label>)}
                    </div> : <p className="rounded-xl bg-j-gray-100 p-3 text-sm text-j-gray-500">Você não tem dependentes ativos cadastrados.</p>}
                </fieldset>

                {canRequestGuest && <fieldset className="rounded-2xl border border-j-gray-200 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                        <input type="checkbox" checked={includeGuest} onChange={(event) => setIncludeGuest(event.target.checked)} className="mt-0.5 size-4 accent-[#ffcc00]" />
                        <span><span className="flex items-center gap-2 text-sm font-extrabold text-j-blue-900"><UserRoundPlus size={17} />Vou levar um convidado</span><span className="mt-1 block text-xs text-j-gray-500">O pedido do convidado será enviado para aprovação.</span></span>
                    </label>
                    {includeGuest && <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-bold text-j-gray-700">Nome do convidado<input required minLength={2} maxLength={150} value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Nome completo" className="mt-1 min-h-11 w-full rounded-xl border border-j-gray-300 px-3 text-sm font-normal focus:border-j-blue-700 focus:outline-none focus:ring-2 focus:ring-j-blue-100" /></label>
                        <label className="text-xs font-bold text-j-gray-700">CPF do convidado<input required inputMode="numeric" autoComplete="off" aria-invalid={guestCPFError} value={guestCPF} onChange={(event) => { setGuestCPF(maskCPF(event.target.value)); setGuestCPFError(false); }} placeholder="000.000.000-00" className="mt-1 min-h-11 w-full rounded-xl border border-j-gray-300 px-3 text-sm font-normal focus:border-j-blue-700 focus:outline-none focus:ring-2 focus:ring-j-blue-100" />{guestCPFError && <span className="mt-1 block text-xs font-medium text-red-600">Informe um CPF válido.</span>}</label>
                    </div>}
                </fieldset>}

                <footer className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={setClose} disabled={isSubmitting} className="min-h-11 rounded-xl border border-j-gray-300 px-5 text-sm font-bold text-j-gray-600 hover:bg-j-gray-100 disabled:opacity-50">Voltar</button>
                    <button type="submit" disabled={!vehicles.length || !vehicleId || isSubmitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-j-yellow-300 px-5 text-sm font-extrabold text-j-blue-900 hover:bg-j-yellow-400 disabled:cursor-not-allowed disabled:opacity-50">
                        {isSubmitting ? <><LoaderCircle size={16} className="animate-spin" />Confirmando...</> : <><CalendarCheck size={17} />Confirmar participação</>}
                    </button>
                </footer>
            </form>
        )}
        <span className="sr-only">Evento {eventId}</span>
    </section>;
}
