"use client";

import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    Ambulance,
    ClipboardPlus,
    Edit3,
    HeartPulse,
    Pill,
    RefreshCw,
    ShieldPlus,
} from "lucide-react";

import { getMedicalProfileAction } from "@/actions/profile/medical-profile";
import { Button } from "@/components/common/button";
import { useModal } from "@/providers/ModalProvider";
import { EditMedicalProfileModal } from "./EditMedicalProfileModal";

const BLOOD_TYPE_LABELS: Record<MedicalProfileBloodType, string> = {
    A_POSITIVE: "A+", A_NEGATIVE: "A-", B_POSITIVE: "B+", B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+", AB_NEGATIVE: "AB-", O_POSITIVE: "O+", O_NEGATIVE: "O-",
    UNKNOWN: "—",
};

function display(value: string | null | undefined) {
    return value?.trim() || "Não informado";
}

export function MedicalProfileTabContent() {
    const { setContent, setOpen } = useModal();
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ["medical-profile", "me"],
        queryFn: getMedicalProfileAction,
    });

    const openEditor = () => {
        setContent(<EditMedicalProfileModal medicalProfile={data ?? null} />);
        setOpen();
    };

    if (isLoading) {
        return <p className="text-sm text-j-gray-400">Carregando perfil médico...</p>;
    }

    if (isError) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-j-red-400">Não foi possível carregar seu perfil médico.</p>
                <Button onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                    Tentar novamente
                </Button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-j-gray-300 bg-j-gray-100/50 px-5 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-j-blue-100 text-j-blue-800">
                    <HeartPulse size={28} />
                </span>
                <div>
                    <h3 className="font-extrabold text-j-gray-700">Seu perfil médico ainda não foi preenchido</h3>
                    <p className="mt-1 max-w-md text-sm text-j-gray-500">Cadastre informações importantes para facilitar o atendimento em uma emergência.</p>
                </div>
                <Button onClick={openEditor}><ClipboardPlus size={17} /> Cadastrar perfil médico</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-bold text-j-gray-700">Meu perfil médico</h3>
                    <p className="text-xs text-j-gray-400">Informações para atendimento e contato em emergências</p>
                </div>
                <Button onClick={openEditor} className="self-start sm:self-auto"><Edit3 size={16} /> Editar perfil</Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MedicalCard title="Informações médicas" icon={Activity} accent="bg-red-100 text-red-600">
                    <div className="mb-3 flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-j-gray-500">Tipo sanguíneo</span>
                        <span className="text-2xl font-extrabold text-red-600">{data.bloodType ? BLOOD_TYPE_LABELS[data.bloodType] : "—"}</span>
                    </div>
                    <ProfileItem label="Alergias" value={display(data.allergies)} />
                    <ProfileItem label="Condições crônicas" value={display(data.chronicConditions)} />
                </MedicalCard>

                <MedicalCard title="Medicamentos" icon={Pill} accent="bg-amber-100 text-amber-700">
                    <ProfileItem label="Uso contínuo" value={display(data.continuousMedications)} />
                </MedicalCard>

                <MedicalCard title="Plano de saúde" icon={ShieldPlus} accent="bg-emerald-100 text-emerald-700">
                    <ProfileItem label="Operadora" value={display(data.healthInsuranceProvider)} />
                    <ProfileItem label="Plano" value={display(data.healthInsurancePlan)} />
                    <ProfileItem label="Carteirinha" value={display(data.healthInsuranceNumber)} />
                </MedicalCard>

                <MedicalCard title="Contato de emergência" icon={Ambulance} accent="bg-blue-100 text-blue-700">
                    <ProfileItem label="Nome" value={display(data.emergencyContactName)} />
                    <ProfileItem label="Telefone" value={display(data.emergencyContactPhone)} />
                    <ProfileItem label="Parentesco" value={display(data.emergencyContactRelationship)} />
                </MedicalCard>

                <MedicalCard title="Observações" icon={ClipboardPlus} accent="bg-violet-100 text-violet-700" className="md:col-span-2 xl:col-span-2">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-j-gray-600">{display(data.observations)}</p>
                </MedicalCard>
            </div>
        </div>
    );
}

function MedicalCard({ title, icon: Icon, accent, className = "", children }: { title: string; icon: ElementType; accent: string; className?: string; children: React.ReactNode }) {
    return (
        <section className={`flex min-h-44 flex-col rounded-2xl border border-j-gray-200 bg-j-white p-4 shadow-sm ${className}`}>
            <header className="mb-4 flex items-center gap-3 border-b border-j-gray-100 pb-3">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}><Icon size={18} /></span>
                <h4 className="font-extrabold text-j-gray-700">{title}</h4>
            </header>
            <div className="flex flex-col gap-3">{children}</div>
        </section>
    );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="block text-[10px] font-bold uppercase tracking-wide text-j-gray-400">{label}</span>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm font-semibold text-j-gray-700">{value}</p>
        </div>
    );
}

export default MedicalProfileTabContent;
