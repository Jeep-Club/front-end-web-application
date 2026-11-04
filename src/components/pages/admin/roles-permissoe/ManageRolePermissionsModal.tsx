'use client';

import { ButtonIcon } from '@/components/common/button';
import { useModal } from '@/providers/ModalProvider';
import { assignPermissionToRoleAction } from '@/server/actions/authorization/assign-role-permission';
import { listPermissionsAction } from '@/server/actions/authorization/list-permissions';
import { listRolePermissionsAction } from '@/server/actions/authorization/list-role-permissions';
import { revokePermissionFromRoleAction } from '@/server/actions/authorization/revoke-role-permission';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { Check,CheckCheck,ListChecks,LoaderCircle,Save,Search,X,XCircle } from 'lucide-react';
import { useMemo,useState } from 'react';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { getModuleLabel,getPermissionDescription,getPermissionName } from './permissionLabels';

interface Props { roleId: number; roleName: string; roleKind: RoleKind }

function PermissionRow({ permission, checked, disabled, isSaving, onToggle }: {
  permission: PermissionResponse; checked: boolean; disabled: boolean; isSaving: boolean; onToggle: (checked: boolean) => void;
}) {
  return <label className={twMerge('flex w-full items-start gap-3 rounded-xl border p-3 transition-colors', checked ? 'border-j-blue-200 bg-blue-50/60' : 'border-j-gray-200 bg-j-white', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-j-blue-300 hover:bg-j-gray-100/60')}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onToggle(event.target.checked)} className="peer sr-only" />
    <span className={twMerge('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors', checked ? 'border-j-blue-800 bg-j-blue-800 text-j-yellow-300' : 'border-j-gray-300 bg-j-white text-transparent')}>
      {isSaving ? <LoaderCircle size={12} className="animate-spin text-j-gray-400" /> : <Check size={14} strokeWidth={3} />}
    </span>
    <span className="min-w-0"><span className="block text-sm font-black text-j-blue-800">{getPermissionName(permission)}</span><span className="mt-0.5 block text-xs text-j-gray-600">{getPermissionDescription(permission)}</span></span>
  </label>;
}

export function ManageRolePermissionsModal({ roleId, roleName, roleKind }: Props) {
  const { setClose } = useModal();
  const queryClient = useQueryClient();
  const userPermissions = useUserStore((state) => state.permissions);
  const canAssign = hasPermission(userPermissions, 'AUTHORIZATION', 'PERMISSION_ASSIGN');
  const canRevoke = hasPermission(userPermissions, 'AUTHORIZATION', 'PERMISSION_REVOKE');
  const isProtected = roleKind === 'ROOT';
  const [draftIds, setDraftIds] = useState<Set<number> | null>(null);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const rolePermissionsQueryKey = ['authorization', 'roles', roleId, 'permissions'];

  const { data: catalog, isLoading: isLoadingCatalog, isError: isCatalogError, refetch: reloadCatalog } = useQuery({ queryKey: ['authorization', 'permissions'], queryFn: listPermissionsAction });
  const { data: rolePermissions, isLoading: isLoadingRolePermissions, isError: isRolePermissionsError, refetch: reloadRolePermissions } = useQuery({ queryKey: rolePermissionsQueryKey, queryFn: () => listRolePermissionsAction(roleId) });
  const assignedIds = new Set((rolePermissions ?? []).map((permission) => permission.id));
  const selectedIds = draftIds ?? assignedIds;
  const modules = useMemo(
    () => [...new Set((catalog ?? []).map((permission) => permission.module))]
      .sort((left, right) => getModuleLabel(left).localeCompare(getModuleLabel(right), "pt-BR")),
    [catalog],
  );
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return (catalog ?? []).filter((permission) => (moduleFilter === 'all' || permission.module === moduleFilter)
      && (!query || `${getPermissionName(permission)} ${getPermissionDescription(permission)} ${getModuleLabel(permission.module)}`.toLocaleLowerCase().includes(query)));
  }, [catalog, moduleFilter, search]);
  const grouped = useMemo(() => filtered.reduce<Record<string, PermissionResponse[]>>((groups, permission) => {
    (groups[permission.module] ??= []).push(permission);
    return groups;
  }, {}), [filtered]);
  const changes = (catalog ?? []).filter((permission) => assignedIds.has(permission.id) !== selectedIds.has(permission.id));
  const isLoading = isLoadingCatalog || isLoadingRolePermissions;
  const isError = isCatalogError || isRolePermissionsError;

  const setFiltered = (checked: boolean) => setDraftIds((previous) => {
    const next = new Set(previous ?? assignedIds);
    filtered.forEach((permission) => {
      if (checked && canAssign) next.add(permission.id);
      if (!checked && canRevoke) next.delete(permission.id);
    });
    return next;
  });

  const saveChanges = async () => {
    if (!draftIds || !changes.length || isSaving) return;
    const desired = new Set(draftIds);
    setIsSaving(true);
    setPendingCount(changes.length);
    let cursor = 0;
    const succeeded: PermissionResponse[] = [];
    const failed: PermissionResponse[] = [];
    await Promise.all(Array.from({ length: Math.min(16, changes.length) }, async () => {
      while (cursor < changes.length) {
        const permission = changes[cursor++];
        try {
          if (desired.has(permission.id)) await assignPermissionToRoleAction(roleId, permission.id);
          else await revokePermissionFromRoleAction(roleId, permission.id);
          succeeded.push(permission);
        } catch { failed.push(permission); }
        setPendingCount((count) => Math.max(0, count - 1));
      }
    }));

    const actualIds = new Set(assignedIds);
    succeeded.forEach((permission) => desired.has(permission.id) ? actualIds.add(permission.id) : actualIds.delete(permission.id));
    if (catalog) queryClient.setQueryData(rolePermissionsQueryKey, catalog.filter((permission) => actualIds.has(permission.id)));
    void queryClient.invalidateQueries({ queryKey: rolePermissionsQueryKey });
    setPendingCount(0);
    if (failed.length) {
      toast.error(`${succeeded.length} salva(s); ${failed.length} falhou(ram). Confira suas permissões e tente novamente.`);
      setDraftIds(desired);
    } else {
      toast.success(`${succeeded.length} permissão(ões) atualizada(s) com sucesso.`);
      setDraftIds(null);
    }
    setIsSaving(false);
  };

  return <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-j-white shadow-2xl">
    <ButtonIcon type="button" onClick={setClose} disabled={isSaving} aria-label="Fechar" className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800"><X className="h-5 w-5 md:h-[22px] md:w-[22px]" /></ButtonIcon>
    <header className="shrink-0 border-b border-j-gray-200 px-5 pb-4 pr-16 pt-5 md:px-8 md:pb-5 md:pr-20 md:pt-6"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300"><ListChecks size={20} /></span><div><h2 className="text-xl font-extrabold text-j-blue-800 md:text-2xl">Gerenciar permissões</h2><p className="mt-1 max-w-lg text-xs leading-relaxed text-j-gray-500 md:text-sm">Escolha o que <strong className="text-j-blue-800">{roleName}</strong> pode acessar. Salve as alterações de uma vez.</p></div></div></header>
    <section className="shrink-0 space-y-3 border-b border-j-gray-100 bg-j-white px-5 py-4 md:px-8">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]"><label className="relative block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-j-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou descrição" aria-label="Buscar permissão" className="h-11 w-full rounded-xl border border-j-gray-200 bg-j-gray-100 pl-10 pr-3 text-sm text-j-gray-700 outline-none focus:border-j-blue-400 focus:bg-j-white" /></label><select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} aria-label="Filtrar por módulo" className="h-11 rounded-xl border border-j-gray-200 bg-j-gray-100 px-3 text-sm text-j-gray-700 outline-none focus:border-j-blue-400 focus:bg-j-white"><option value="all">Todos os módulos</option>{modules.map((module) => <option key={module} value={module}>{getModuleLabel(module)}</option>)}</select></div>
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-j-gray-500">{selectedIds.size} selecionada(s) · {changes.length} alteração(ões) pendente(s)</p><div className="flex gap-2"><button type="button" disabled={!canAssign || isProtected || isSaving || !filtered.length} onClick={() => setFiltered(true)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-j-gray-200 px-3 text-xs font-bold text-j-blue-800 disabled:opacity-40"><CheckCheck size={15} />Selecionar filtradas</button><button type="button" disabled={!canRevoke || isProtected || isSaving || !filtered.length} onClick={() => setFiltered(false)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-j-gray-200 px-3 text-xs font-bold text-j-gray-600 disabled:opacity-40"><XCircle size={15} />Limpar filtradas</button></div></div>
    </section>
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-8 md:py-5">
      {isLoading && <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500"><LoaderCircle size={20} className="animate-spin" />Carregando permissões...</div>}
      {isError && <div className="flex flex-col items-center gap-3 py-8 text-center"><p className="text-sm text-red-600">Não foi possível carregar o catálogo ou as permissões do cargo.</p><button type="button" onClick={() => { void reloadCatalog(); void reloadRolePermissions(); }} className="rounded-lg border border-j-gray-200 px-4 py-2 text-sm font-bold text-j-blue-800">Tentar novamente</button></div>}
      {!isLoading && !isError && filtered.length === 0 && <p className="py-10 text-center text-sm text-j-gray-500">Nenhuma permissão corresponde aos filtros.</p>}
      {!isLoading && !isError && <div className="flex flex-col gap-5">{Object.entries(grouped).map(([module, permissions]) => <section key={module}><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-black text-j-blue-800">{getModuleLabel(module)}</h3><span className="text-xs text-j-gray-400">{permissions.filter((permission) => selectedIds.has(permission.id)).length}/{permissions.length}</span></div><div className="grid grid-cols-1 gap-2.5">{permissions.map((permission) => {
        const checked = selectedIds.has(permission.id);
        const missingPermission = checked ? !canRevoke : !canAssign;
        return <PermissionRow key={permission.id} permission={permission} checked={checked} disabled={isProtected || missingPermission || isSaving} isSaving={isSaving} onToggle={(next) => setDraftIds((previous) => { const updated = new Set(previous ?? assignedIds); next ? updated.add(permission.id) : updated.delete(permission.id); return updated; })} />;
      })}</div></section>)}</div>}
    </div>
    <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-j-gray-200 bg-j-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between md:px-8"><button type="button" onClick={() => setDraftIds(null)} disabled={!changes.length || isSaving} className="min-h-11 rounded-xl border border-j-gray-200 px-4 text-sm font-bold text-j-gray-600 disabled:opacity-40">Descartar alterações</button><button type="button" onClick={() => void saveChanges()} disabled={!changes.length || isSaving || isProtected} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-j-blue-800 px-5 text-sm font-extrabold text-j-white hover:bg-j-blue-900 disabled:opacity-45">{isSaving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}{isSaving ? `Salvando ${pendingCount} alteração(ões)...` : `Salvar ${changes.length} alteração(ões)`}</button></footer>
  </div>;
}

export default ManageRolePermissionsModal;
