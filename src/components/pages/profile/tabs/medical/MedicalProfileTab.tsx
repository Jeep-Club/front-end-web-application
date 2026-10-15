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
    Plus,
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

const hasText = (value: string | null | undefined) => Boolean(value?.trim());

export function MedicalProfileTab() {
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

    return (
        <div className="flex flex-col gap-5 rounded-3xl border border-j-gray-200 bg-gradient-to-br from-j-gray-50 via-white to-j-blue-50/40 p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm"><HeartPulse size={23} /></span>
                    <div>
                        <h3 className="text-lg font-extrabold text-j-blue-800">Meu perfil de saúde</h3>
                        <p className="mt-0.5 text-sm text-j-gray-500">Informações úteis para seu cuidado e em caso de emergência.</p>
                    </div>
                </div>
                <Button onClick={openEditor} className="h-11 w-full shrink-0 justify-center whitespace-nowrap rounded-xl px-5 sm:w-auto">
                    {data ? <Edit3 size={16} /> : <Plus size={16} />}
                    <span>{data ? "Editar informações" : "Adicionar informações"}</span>
                </Button>
            </div>

            {!data && (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-j-gray-300 bg-white/80 px-5 py-10 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-j-blue-50 text-j-blue-700"><Activity size={22} /></span>
                    <p className="mt-3 font-bold text-j-gray-700">Seu perfil médico está vazio</p>
                    <p className="mt-1 max-w-md text-sm text-j-gray-500">Adicione dados de saúde e um contato de emergência para deixá-los disponíveis no seu perfil.</p>
                </div>
            )}

            {data && <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MedicalCard title="Informações médicas" icon={Activity} accent="bg-red-100 text-red-600">
                    {data.bloodType && data.bloodType !== "UNKNOWN" && <div className="flex items-center justify-between rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-white px-4 py-3">
                        <div><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-j-gray-500">Tipo sanguíneo</span><span className="mt-1 block text-xs text-j-gray-500">Informação importante em emergências</span></div>
                        <span className="rounded-lg bg-white px-3 py-1 text-2xl font-black text-red-600 shadow-sm">{BLOOD_TYPE_LABELS[data.bloodType]}</span>
                    </div>}
                    {hasText(data.allergies) && <ProfileItem label="Alergias" value={data.allergies!} />}
                    {hasText(data.chronicConditions) && <ProfileItem label="Condições crônicas" value={data.chronicConditions!} />}
                    {(!data.bloodType || data.bloodType === "UNKNOWN") && !hasText(data.allergies) && !hasText(data.chronicConditions) && <EmptyCardState text="Nenhuma informação médica cadastrada." />}
                </MedicalCard>

                <MedicalCard title="Medicamentos" icon={Pill} accent="bg-amber-100 text-amber-700">
                    {hasText(data.continuousMedications) ? <ProfileItem label="Uso contínuo" value={data.continuousMedications!} /> : <EmptyCardState text="Nenhum medicamento informado." />}
                </MedicalCard>

                <MedicalCard title="Plano de saúde" icon={ShieldPlus} accent="bg-emerald-100 text-emerald-700">
                    {hasText(data.healthInsuranceProvider) && <ProfileItem label="Operadora" value={data.healthInsuranceProvider!} />}
                    {hasText(data.healthInsurancePlan) && <ProfileItem label="Plano" value={data.healthInsurancePlan!} />}
                    {hasText(data.healthInsuranceNumber) && <ProfileItem label="Número da carteirinha" value={data.healthInsuranceNumber!} />}
                    {!hasText(data.healthInsuranceProvider) && !hasText(data.healthInsurancePlan) && !hasText(data.healthInsuranceNumber) && <EmptyCardState text="Nenhum plano informado." />}
                </MedicalCard>

                <MedicalCard title="Contato de emergência" icon={Ambulance} accent="bg-blue-100 text-blue-700">
                    {hasText(data.emergencyContactName) && <ProfileItem label="Nome" value={data.emergencyContactName!} />}
                    {hasText(data.emergencyContactPhone) && <ProfileItem label="Telefone" value={data.emergencyContactPhone!} />}
                    {hasText(data.emergencyContactRelationship) && <ProfileItem label="Parentesco" value={data.emergencyContactRelationship!} />}
                    {!hasText(data.emergencyContactName) && !hasText(data.emergencyContactPhone) && !hasText(data.emergencyContactRelationship) && <EmptyCardState text="Nenhum contato de emergência cadastrado." />}
                </MedicalCard>

                <MedicalCard title="Observações" icon={ClipboardPlus} accent="bg-violet-100 text-violet-700" className="md:col-span-2 xl:col-span-2">
                    {hasText(data.observations) ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-j-gray-600">{data.observations}</p> : <EmptyCardState text="Nenhuma observação adicional." />}
                </MedicalCard>
            </div>}
        </div>
    );
}

function MedicalCard({ title, icon: Icon, accent, className = "", children }: { title: string; icon: ElementType; accent: string; className?: string; children: React.ReactNode }) {
    return (
        <section className={`flex h-full flex-col rounded-2xl border border-j-gray-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 ${className}`}>
            <header className="mb-4 flex items-center gap-3 border-b border-j-gray-100 pb-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}><Icon size={19} /></span>
                <h4 className="font-extrabold text-j-gray-800">{title}</h4>
            </header>
            <div className="flex flex-col gap-3">{children}</div>
        </section>
    );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="block text-[10px] font-bold uppercase tracking-wide text-j-gray-400">{label}</span>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold leading-relaxed text-j-gray-800">{value}</p>
        </div>
    );
}

function EmptyCardState({ text }: { text: string }) {
    return <p className="rounded-xl border border-dashed border-j-gray-200 bg-j-gray-50/80 px-3 py-4 text-sm text-j-gray-500">{text}</p>;
}

export default MedicalProfileTab;
