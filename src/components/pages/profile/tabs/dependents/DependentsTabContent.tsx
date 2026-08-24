'use client';

import { useQuery } from '@tanstack/react-query';
import {
    CalendarDays,
    HeartPulse,
    IdCard,
    Pencil,
    Phone,
    Plus,
    RefreshCw,
    ShieldCheck,
    Trash2,
    UserRound,
} from 'lucide-react';
import { listDependentsAction } from '@/actions/dependents';
import { Button } from '@/components/common/button';
import { maskCPF } from '@/utils/masks/maskCPF';
import { maskDate } from '@/utils/masks/maskDate';
import { maskPhoneNumber } from '@/utils/masks/maskPhoneNumber';
import { useModal } from '@/providers/ModalProvider';
import { CreateDependentModal } from './CreateDependentModal';
import { DeleteDependentModal } from './DeleteDependentModal';

const RELATIONSHIP_LABELS: Record<MemberDependentRelationshipType, string> = {
    CHILD: 'Filho(a)',
    GUEST: 'Convidado(a)',
    OTHER: 'Outro',
    PARENT: 'Pai/Mãe',
    SIBLING: 'Irmão/Irmã',
    SPOUSE: 'Cônjuge',
};

const BLOOD_TYPE_LABELS: Record<string, string> = {
    A_POSITIVE: 'A+', A_NEGATIVE: 'A-', B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-', O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
    UNKNOWN: 'Não informado',
};

function bloodTypeLabel(value: string | null) {
    if (!value) return 'Não informado';
    return BLOOD_TYPE_LABELS[value] ?? value;
}

function InfoItem({ icon: Icon, label, value }: {
    icon: typeof IdCard;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl bg-j-gray-100/70 px-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-j-white text-j-blue-700 shadow-sm">
                <Icon size={15} />
            </span>
            <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wide text-j-gray-400">{label}</span>
                <p className="truncate text-sm font-extrabold text-j-gray-700">{value}</p>
            </div>
        </div>
    );
}

function DependentCard({ dependent, onEdit, onDelete }: {
    dependent: MemberDependent;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-j-gray-200 bg-j-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-j-blue-200 hover:shadow-md">
            <header className="relative flex items-center gap-3 overflow-hidden border-b border-j-gray-100 bg-gradient-to-r from-blue-50 to-j-white p-4">
                <span className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-j-yellow-300/15" />
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300 shadow-sm">
                    <UserRound size={23} />
                </span>
                <div className="relative min-w-0 flex-1">
                    <h4 className="truncate text-base font-black text-j-blue-800">{dependent.name}</h4>
                    <span className="mt-1 inline-flex rounded-full border border-j-blue-100 bg-j-white px-2.5 py-1 text-[11px] font-extrabold text-j-blue-700 shadow-sm">
                        {RELATIONSHIP_LABELS[dependent.relationshipType]}
                    </span>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-3 p-4">
                <InfoItem icon={IdCard} label="CPF" value={maskCPF(dependent.cpf)} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <InfoItem icon={CalendarDays} label="Nascimento" value={maskDate(dependent.birthDate)} />
                    <InfoItem icon={Phone} label="Telefone" value={maskPhoneNumber(dependent.phoneNumber)} />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                        <HeartPulse size={17} />
                        Tipo sanguíneo
                    </div>
                    <strong className="rounded-lg bg-j-white px-2.5 py-1 text-sm font-black text-red-600 shadow-sm">
                        {bloodTypeLabel(dependent.medicalProfile.bloodType)}
                    </strong>
                </div>

                <div className={`flex items-center gap-2 rounded-lg px-1 py-1 text-xs font-bold ${dependent.consentAccepted ? 'text-j-green-600' : 'text-j-gray-400'}`}>
                    <ShieldCheck size={16} />
                    {dependent.consentAccepted ? 'Consentimento aceito' : 'Consentimento pendente'}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 border-t border-j-gray-100 pt-3">
                    <button type="button" onClick={onEdit} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-yellow-100 bg-yellow-50 px-3 py-2.5 text-sm font-extrabold text-j-gray-700 transition-colors hover:border-j-yellow-300 hover:bg-yellow-100">
                        <Pencil size={16} className="text-j-yellow-500" /> Editar
                    </button>
                    <button type="button" onClick={onDelete} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-extrabold text-red-500 transition-colors hover:border-red-200 hover:bg-red-100">
                        <Trash2 size={16} /> Excluir
                    </button>
                </div>
            </div>
        </article>
    );
}

export function DependentsTabContent() {
    const { setContent, setOpen } = useModal();
    const { data = [], isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: ['dependents'],
        queryFn: listDependentsAction,
    });
    const open = (content: React.ReactNode) => { setContent(content); setOpen(); };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-j-gray-700">Meus dependentes</h3>
                <Button onClick={() => open(<CreateDependentModal />)}>
                    <Plus size={16} /><span className="hidden sm:inline">Incluir dependente</span><span className="sm:hidden">Incluir</span>
                </Button>
            </div>
            {isLoading && <p className="text-sm text-j-gray-400">Carregando dependentes...</p>}
            {isError && <div className="flex flex-col items-start gap-3"><p className="text-sm text-j-red-400">Não foi possível carregar seus dependentes.</p><Button onClick={() => refetch()} disabled={isFetching}><RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />Tentar novamente</Button></div>}
            {!isLoading && !isError && !data.length && <p className="text-sm text-j-gray-400">Você ainda não tem dependentes cadastrados.</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {data.map((dependent) => <DependentCard key={dependent.id} dependent={dependent} onEdit={() => open(<CreateDependentModal dependent={dependent} />)} onDelete={() => open(<DeleteDependentModal dependent={dependent} />)} />)}
            </div>
        </div>
    );
}