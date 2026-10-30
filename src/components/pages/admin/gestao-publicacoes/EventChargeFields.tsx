"use client";
import { useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/common/button';
import { InputRegister } from '@/components/common/input/input-register';
import { InputCheckbox } from '@/components/common/input/input-checkbox';
import { InputDate } from '@/components/common/input/input-date';
import { SelectRegister } from '@/components/common/select/select-register';
import { listEventChargeCatalogAction } from '@/server/actions/publications/events';
import type { EventChargeFormRow } from '@/schemas/publications/create';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';

/** Event rules are a complete collection, distinct from billing definitions and actual debts. */
export function EventChargeFields({ disabled = false }: { disabled?: boolean }) {
    const { control, setValue, formState: { errors } } = useFormContext<{ charges: EventChargeFormRow[] }>();
    const { fields, append, remove } = useFieldArray({ control, name: 'charges' });
    const rows = useWatch({ control, name: 'charges' }) ?? [];
    const [page, setPage] = useState(0);
    const permissions = useUserStore(state => state.permissions);
    const canCatalog = ['EVENT_CREATE', 'EVENT_UPDATE'].some(action => hasPermission(permissions, 'PUBLICATIONS', action));
    const catalog = useQuery({ queryKey: ['publications', 'admin', 'event-charge-catalog', { page, size: 12 }, permissions], queryFn: () => listEventChargeCatalogAction({ page, size: 12 }), enabled: canCatalog && !disabled, retry: false });
    return <fieldset disabled={disabled} className="w-full min-w-0 space-y-4"><legend className="text-lg font-bold text-j-blue-800">Regras de cobrança</legend>
        <p className="text-sm">A configuração substitui todas as regras. Remover regras não apaga definições, associações, dívidas ou pagamentos. A definição inline é criada de verdade no financeiro. Vencimento é uma data civil independente do cutoff.</p>
        {!canCatalog && <p>Sem permissão para consultar o catálogo.</p>}
        {catalog.isLoading && <p role="status">Carregando catálogo...</p>}
        {catalog.isError && <div role="alert"><p>{catalog.error.message}</p><Button onClick={() => void catalog.refetch()}>Tentar catálogo novamente</Button></div>}
        {catalog.data && <div aria-busy={catalog.isFetching} className="flex flex-wrap items-center gap-2"><p>Catálogo: página {page + 1} de {Math.max(1, catalog.data.totalPages)}</p><Button disabled={disabled || page === 0 || catalog.isFetching} onClick={() => setPage(page - 1)}>Catálogo anterior</Button><Button disabled={disabled || catalog.data.last || catalog.isFetching} onClick={() => setPage(page + 1)}>Próximo catálogo</Button></div>}
        {fields.map((field, index) => { const row = rows[index]; if (!row) return null; return <fieldset key={field.id} className="min-w-0 space-y-3 rounded-xl border border-j-gray-200 p-3"><legend className="font-bold">Cobrança {index + 1}</legend>
            <SelectRegister name={`charges.${index}.mode`} label="Origem da definição"><option value="existing">Definição existente</option><option value="inline">Criar definição inline</option></SelectRegister>
            {row.mode === 'existing' ? <><SelectRegister name={`charges.${index}.chargeDefinitionId`} label="Definição de cobrança" onChange={event => { const entry = catalog.data?.content.find(item => item.id === Number(event.target.value)); setValue(`charges.${index}.paymentAcceptancePolicy`, entry?.paymentAcceptancePolicy ?? ''); }}><option value="">Selecione uma definição</option>{row.chargeDefinitionId && !catalog.data?.content.some(item => String(item.id) === row.chargeDefinitionId) && <option value={row.chargeDefinitionId}>Definição #{row.chargeDefinitionId} (fora desta página)</option>}{catalog.data?.content.map(entry => <option key={entry.id} value={String(entry.id)}>#{entry.id} · {entry.name} · valor atual {entry.defaultAmount} · {entry.paymentAcceptancePolicy}</option>)}</SelectRegister><p className="text-sm">Valor do catálogo é atual, não um snapshot histórico da regra. {row.paymentAcceptancePolicy && `Política: ${row.paymentAcceptancePolicy}.`}</p></> : <><InputRegister name={`charges.${index}.name`} label="Nome da definição" required /><InputRegister name={`charges.${index}.description`} label="Descrição da definição" /><InputRegister name={`charges.${index}.amount`} label="Valor da definição" inputMode="decimal" required /><InputCheckbox name={`charges.${index}.billingRequired`} label="Obrigação financeira (billingRequired)" /></>}
            <InputCheckbox name={`charges.${index}.requiredForParticipation`} label="Exigir para participação (requiredForParticipation)" />
            <InputRegister name={`charges.${index}.participationCutoff`} label="Cutoff de participação (UTC)" placeholder="2099-11-15T11:00:00Z" />
            <p className="text-sm">Vazio usa o início do evento. Deve estar no futuro e até o início. Participação obrigatória ou vencimento vazio exige AFTER_DUE_DATE.</p>
            <InputDate name={`charges.${index}.financialDueDate`} label="Vencimento financeiro (opcional)" />
            <Button aria-label={`Remover cobrança ${index + 1}`} onClick={() => remove(index)}>Remover cobrança</Button>
        </fieldset>; })}
        {!rows.length && <p>Sem regras de cobrança. Salvar assim envia a coleção vazia.</p>}
        {errors.charges && <p role="alert" className="text-input-error-text">{errors.charges.message ?? errors.charges.root?.message ?? 'Confira as regras de cobrança.'}</p>}
        <Button onClick={() => append({ mode: 'existing', chargeDefinitionId: '', name: '', description: '', amount: '', billingRequired: false, requiredForParticipation: false, participationCutoff: '', financialDueDate: '', paymentAcceptancePolicy: '' })}>Adicionar cobrança</Button>
    </fieldset>;
}
