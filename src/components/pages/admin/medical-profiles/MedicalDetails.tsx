import type { ReactNode } from "react";
import { Activity, Ambulance, ClipboardPlus, Pill, ShieldPlus, type LucideIcon } from "lucide-react";
import { BloodType } from "@/schemas/admin/medical-profile";
import { maskPhoneNumber } from "@/utils/masks/maskPhoneNumber";

function Card({ title, icon: Icon, accent, children, className = "" }: { title: string; icon: LucideIcon; accent: string; children: ReactNode; className?: string }) {
    return <section className={`min-w-0 rounded-2xl border border-j-gray-200/90 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
        <header className="mb-4 flex items-center gap-3 border-b border-j-gray-100 pb-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}><Icon size={19} aria-hidden="true" /></span>
            <h3 className="font-extrabold text-j-gray-800">{title}</h3>
        </header>
        <dl className="flex flex-col gap-3">{children}</dl>
    </section>;
}

function Item({ label, value }: { label: string; value: string }) {
    return <div><dt className="text-[10px] font-bold uppercase tracking-wide text-j-gray-400">{label}</dt><dd className={`mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed ${value.trim() ? "font-semibold text-j-gray-800" : "text-j-gray-500"}`}>{value.trim() || "Não informado"}</dd></div>;
}

export default function MedicalDetails({ profile }: { profile: GetMedicalProfileResponse }) {
    const blood = profile.bloodType === "UNKNOWN" ? "Não informado" : BloodType[profile.bloodType as keyof typeof BloodType] ?? profile.bloodType;
    return <div className="grid items-stretch gap-4 sm:grid-cols-2">
        <Card title="Informações médicas" icon={Activity} accent="bg-red-100 text-red-600">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-white px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-j-gray-500">Tipo sanguíneo</dt>
                <dd className="rounded-lg bg-white px-3 py-1 text-xl font-black text-red-600 shadow-sm">{blood}</dd>
            </div>
            <Item label="Alergias" value={profile.allergies} />
            <Item label="Condições crônicas" value={profile.chronicConditions} />
        </Card>
        <Card title="Medicamentos" icon={Pill} accent="bg-amber-100 text-amber-700"><Item label="Uso contínuo" value={profile.continuousMedications} /></Card>
        <Card title="Plano de saúde" icon={ShieldPlus} accent="bg-emerald-100 text-emerald-700">
            <Item label="Operadora" value={profile.healthInsuranceProvider} /><Item label="Plano" value={profile.healthInsurancePlan} /><Item label="Número da carteirinha" value={profile.healthInsuranceNumber} />
        </Card>
        <Card title="Contato de emergência" icon={Ambulance} accent="bg-blue-100 text-blue-700">
            <Item label="Nome" value={profile.emergencyContactName} /><Item label="Telefone" value={profile.emergencyContactPhone ? maskPhoneNumber(profile.emergencyContactPhone) : ""} /><Item label="Parentesco" value={profile.emergencyContactRelationship} />
        </Card>
        <Card title="Observações" icon={ClipboardPlus} accent="bg-violet-100 text-violet-700" className="sm:col-span-2"><Item label="Informações adicionais" value={profile.observations} /></Card>
    </div>;
}
