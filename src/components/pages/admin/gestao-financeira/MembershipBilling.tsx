"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, RefreshCw, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input/input";
import { Select } from "@/components/common/select";
import { getMembershipBillingConfigurationAction, updateMembershipBillingConfigurationAction } from "@/server/actions/admin/membership/billingConfiguration";
import { getChargeDefinitionAction } from "@/server/actions/billing/chargeDefinitions/get";
import { listChargeDefinitionsAction } from "@/server/actions/billing/chargeDefinitions/list";
import { useUserStore } from "@/stores/userStore";
import { hasPermission } from "@/utils/permission/hasPermission";
import { billingLabels } from "./billingDisplay";
import { CHARGE_RECURRENCE_LABEL, formatCurrencyBRL } from "./chargeDefinitionDisplay";

const configurationKey = ["membership", "billing-configuration"] as const;
const secondaryButton = "border border-j-gray-300 bg-j-white text-j-gray-700 hover:bg-j-gray-100 hover:text-j-gray-700 focus-visible:bg-j-gray-100 focus-visible:text-j-gray-700";

export function MembershipBilling() {
    const permissions = useUserStore(state => state.permissions);
    const canRead = hasPermission(permissions, "MEMBERSHIP", "BILLING_CONFIGURATION_READ");
    const canUpdate = hasPermission(permissions, "MEMBERSHIP", "BILLING_CONFIGURATION_UPDATE");
    const canReadDefinitions = hasPermission(permissions, "BILLING", "CHARGE_DEFINITION_READ");
    const queryClient = useQueryClient();
    const [draftId, setDraftId] = useState<string | null>(null);
    const configuration = useQuery({ queryKey: configurationKey, queryFn: getMembershipBillingConfigurationAction, enabled: canRead, retry: false });
    const configuredId = configuration.data?.chargeDefinitionId;
    const selectedId = draftId ?? (configuredId ? String(configuredId) : "");
    const definitions = useInfiniteQuery({
        queryKey: ["billing", "charge-definitions", "membership-options"],
        queryFn: ({ pageParam }) => listChargeDefinitionsAction({ page: String(pageParam), size: "50", sort: "name,asc" }),
        initialPageParam: 0,
        getNextPageParam: last => last.last ? undefined : last.number + 1,
        enabled: canRead && canReadDefinitions && canUpdate,
        retry: false,
    });
    const configuredDefinition = useQuery({
        queryKey: ["billing", "charge-definitions", configuredId],
        queryFn: () => getChargeDefinitionAction(configuredId!),
        enabled: canRead && canReadDefinitions && Boolean(configuredId),
        retry: false,
    });
    const activeDefinitions = definitions.data?.pages.flatMap(page => page.content).filter(item => item.status === "ACTIVE") ?? [];
    const selectedDefinition = activeDefinitions.find(item => String(item.id) === selectedId);
    const mutation = useMutation({
        mutationFn: () => updateMembershipBillingConfigurationAction({ chargeDefinitionId: Number(selectedId) }),
        onSuccess: async saved => {
            queryClient.setQueryData(configurationKey, saved);
            setDraftId(null);
            toast.success("Cobrança de referência da associação salva.");
            await queryClient.invalidateQueries({ queryKey: configurationKey });
        },
    });
    const validSelection = Number.isSafeInteger(Number(selectedId)) && Number(selectedId) > 0 && (!canReadDefinitions || Boolean(selectedDefinition));
    const changed = Number(selectedId) !== configuredId;

    if (!canRead) return <p role="status">Você não tem permissão para consultar esta configuração.</p>;
    if (configuration.isPending) return <section aria-busy="true" aria-label="Carregando configuração de regularidade" className="rounded-2xl border border-j-gray-200 bg-j-white p-5"><span className="sr-only" role="status">Carregando configuração de regularidade.</span><div aria-hidden="true" className="flex animate-pulse flex-col gap-4"><div className="h-6 w-2/3 rounded bg-j-gray-100" /><div className="h-12 rounded bg-j-gray-100" /><div className="h-24 rounded bg-j-gray-100" /></div></section>;
    if (configuration.isError) return <section role="alert" className="rounded-2xl border border-j-gray-200 bg-j-white p-5"><p className="text-sm text-j-red-500">{configuration.error.message}</p><Button onClick={() => void configuration.refetch()} className={`mt-4 ${secondaryButton}`}><RefreshCw size={16} />Tentar novamente</Button></section>;

    return (
        <section className="rounded-2xl border border-j-gray-200 bg-j-white p-4 sm:p-6" aria-labelledby="membership-billing-title">
            <h2 id="membership-billing-title" className="text-lg font-extrabold text-j-blue-800">Cobrança de referência da associação</h2>
            <p className="mt-2 text-sm leading-relaxed text-j-gray-600">Escolha a cobrança usada para avaliar os débitos dos associados. Esta configuração é única para o clube e não cria cobranças automaticamente.</p>

            <div className="my-5 rounded-xl border border-j-gray-200 bg-j-gray-100 p-4" role="status">
                {configuration.data ? <>
                    <p className="flex items-center gap-2 font-bold text-j-blue-800"><CheckCircle2 size={18} aria-hidden="true" />{configuredDefinition.data?.name ?? `Cobrança #${configuredId}`}</p>
                    {configuredDefinition.data && <p className="mt-1 text-sm text-j-gray-600">{CHARGE_RECURRENCE_LABEL[configuredDefinition.data.recurrenceType]} · {formatCurrencyBRL(configuredDefinition.data.defaultAmount)} · {billingLabels[configuredDefinition.data.status]}</p>}
                    {configuredDefinition.isError && <p className="mt-2 text-sm text-j-red-500">Não foi possível carregar os detalhes da cobrança. <button type="button" className="cursor-pointer underline focus-visible:outline-2" onClick={() => void configuredDefinition.refetch()}>Tentar novamente</button></p>}
                    {configuredDefinition.data && configuredDefinition.data.status !== "ACTIVE" && <p className="mt-2 text-sm text-j-red-500">A cobrança configurada não está ativa. Escolha uma cobrança ativa antes de gerar novos ciclos.</p>}
                    <p className="mt-2 text-sm text-j-gray-600">{configuration.data.enforcementEnabled ? "O controle de acesso por pagamento já está ativo. Alterar a cobrança preserva essa configuração." : "O controle de acesso por pagamento está desativado. Salvar esta referência não ativa bloqueios de acesso."}</p>
                </> : <><p className="font-bold text-j-blue-800">Nenhuma cobrança de referência configurada</p><p className="mt-1 text-sm text-j-gray-600">Selecione uma cobrança ativa para começar a organizar a regularidade financeira dos associados.</p></>}
            </div>

            {canUpdate ? <form className="flex flex-col gap-3" onSubmit={event => { event.preventDefault(); if (validSelection && changed && !mutation.isPending && !configuration.isFetching) mutation.mutate(); }}>
                {canReadDefinitions ? <>
                    <Select.Unregister label="Cobrança de referência" name="membership-charge-definition" value={selectedId} disabled={mutation.isPending || definitions.isPending} onChange={event => { setDraftId(event.target.value); mutation.reset(); }}>
                        <option value="">Selecione uma cobrança ativa</option>
                        {configuredId && !activeDefinitions.some(item => item.id === configuredId) && <option value={String(configuredId)}>{configuredDefinition.data?.name ?? `Cobrança #${configuredId}`} (referência atual)</option>}
                        {activeDefinitions.map(item => <option key={item.id} value={String(item.id)}>{item.name} — {CHARGE_RECURRENCE_LABEL[item.recurrenceType]}</option>)}
                    </Select.Unregister>
                    {definitions.isPending && <p role="status" className="text-sm text-j-gray-500">Carregando cobranças…</p>}
                    {definitions.isError && <div role="alert" className="text-sm text-j-red-500"><p>{definitions.error.message}</p><button type="button" className="cursor-pointer underline focus-visible:outline-2" onClick={() => void definitions.refetch()}>Tentar carregar cobranças novamente</button></div>}
                    {!definitions.isPending && !definitions.isError && activeDefinitions.length === 0 && <p className="text-sm text-j-gray-600">Nenhuma cobrança ativa nas páginas carregadas. Crie ou ative uma definição em “Definições e atribuições”.</p>}
                    {definitions.hasNextPage && <Button type="button" className={`self-start ${secondaryButton}`} disabled={definitions.isFetchingNextPage} onClick={() => void definitions.fetchNextPage()}>{definitions.isFetchingNextPage ? "Carregando…" : "Carregar mais cobranças"}</Button>}
                </> : <>
                    <Input label="Código da cobrança de referência" name="membership-charge-definition-id" type="number" min={1} step={1} required value={selectedId} disabled={mutation.isPending} onChange={event => { setDraftId(event.target.value); mutation.reset(); }} aria-describedby="membership-definition-permission" />
                    <p id="membership-definition-permission" className="text-sm text-j-gray-600">Informe o código de uma definição ativa. Para escolher pelo nome, solicite a permissão de consultar definições de cobrança.</p>
                </>}
                {selectedDefinition && <p className="text-sm text-j-gray-600">Valor padrão: {formatCurrencyBRL(selectedDefinition.defaultAmount)}. A recorrência e os prazos permanecem definidos na própria cobrança.</p>}
                {changed && configuredId && <p className="text-sm text-j-gray-600">Ao salvar, esta cobrança substituirá a referência atual para todos os associados. Os débitos anteriores serão preservados.</p>}
                {mutation.isError && <p role="alert" className="text-sm text-j-red-500">{mutation.error.message}</p>}
                <Button type="submit" className="mt-1 w-full sm:w-auto sm:self-start" isLoading={mutation.isPending} disabled={!validSelection || !changed || configuration.isFetching}><Save size={16} aria-hidden="true" />{mutation.isPending ? "Salvando…" : "Salvar cobrança de referência"}</Button>
            </form> : <p className="text-sm text-j-gray-600">Você pode consultar esta configuração. Para alterá-la, solicite a permissão de configurar a cobrança da associação.</p>}
        </section>
    );
}
