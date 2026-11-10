import type { AdminEventDashboard } from '@/schemas/publications/admin';
import { billingLabels } from '@/components/pages/admin/gestao-financeira/billingDisplay';

const registrationLabels = { PENDING_PAYMENT: 'Aguardando pagamento', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada' } as const;

/** Participation confirmation is not proof of a homologated payment. Capacity derives from participating vehicles. */
export function EventDashboard({ data }: { data: AdminEventDashboard }) {
    const groups = [
        { title: 'Pessoas e veículos', values: [['Pessoas', data.totalPeople], ['Dependentes', data.dependents], ['Veículos', data.vehicles], ['Capacidade dos veículos', data.totalCapacity], ['Vagas disponíveis', data.availableSeats]] },
        { title: 'Convidados', values: [['Pendentes', data.guestsPending], ['Aprovados', data.guestsApproved], ['Em espera', data.guestsStandby], ['Alocados', data.guestsAllocated], ['Cancelados', data.guestsCancelled]] },
        { title: 'Pendências', values: [['Cobranças não pagas', data.unpaidCharges], ['Pagamentos em validação', data.pendingValidation], ['Pendências após o prazo', data.postCutoffPending]] },
    ];
    return <div className="min-w-0 space-y-5">
        <p className="text-sm text-secondary">Participação confirmada indica inscrição confirmada; um pagamento em validação pode satisfazer a participação. Não comprova pagamento homologado. Esta consulta pode atualizar confirmações.</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{groups.map(group => <section key={group.title} className="min-w-0 rounded-lg bg-background-secondary p-4"><h4 className="font-bold text-primary">{group.title}</h4><dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4">{group.values.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-secondary">{label}</dt><dd className="text-lg font-bold text-primary">{value}</dd></div>)}</dl></section>)}</div>
        <h4 className="font-bold">Inscrições ({data.registrations.length})</h4>
        {data.registrations.length ? <ul className="space-y-3">{data.registrations.map(registration => <li key={registration.id} className="break-words rounded-lg border border-input-border p-3">Inscrição #{registration.id} · Usuário #{registration.userId} · {registrationLabels[registration.status]}<ul>{registration.allocations.map(allocation => <li key={allocation.vehicleId}>Veículo #{allocation.vehicleId} · Titular: {allocation.member ? 'Sim' : 'Não'} · Dependentes: {allocation.dependentIds.join(', ') || 'Nenhum'}</li>)}</ul>{registration.unallocatedDependentIds.length > 0 && <p>Dependentes sem transporte: {registration.unallocatedDependentIds.join(', ')}</p>}</li>)}</ul> : <p>Nenhuma inscrição.</p>}
        <h4 className="font-bold">Fatos financeiros ({data.financial.length})</h4>
        {data.financial.length ? <ul className="space-y-3">{data.financial.map((fact, index) => <li key={`${fact.memberChargeId}-${index}`} className="break-words rounded-lg border border-input-border p-3"><p>Definição #{fact.chargeDefinitionId ?? 'Não informada'} · {fact.definitionName ?? 'Nome não informado'} · Usuário #{fact.userId ?? 'Não informado'}</p><p>Valor: {fact.amount?.toLocaleString('pt-BR') ?? 'Não informado'} · Estado efetivo: {fact.effectiveStatus ? billingLabels[fact.effectiveStatus] ?? fact.effectiveStatus : 'Não informado'}</p><p>Pagamento: {fact.paymentStatus ? billingLabels[fact.paymentStatus] ?? fact.paymentStatus : 'Não informado'} · Enviado em UTC: {fact.paymentSubmittedAt ?? 'Não informado'}</p><p>Cobrança #{fact.memberChargeId ?? 'Não informada'} · Ciclo #{fact.chargeCycleId ?? 'Não informado'} · Vencimento: {fact.dueDate ?? 'Não informado'}</p></li>)}</ul> : <p>Nenhum fato financeiro.</p>}
    </div>;
}
