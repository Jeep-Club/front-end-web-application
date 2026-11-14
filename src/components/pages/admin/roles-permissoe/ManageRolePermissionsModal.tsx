'use client';

import { ButtonIcon } from '@/components/common/button';
import { Select } from '@/components/common/select';
import { useModal } from '@/providers/ModalProvider';
import { assignPermissionToRoleAction } from '@/server/actions/authorization/assign-role-permission';
import { listPermissionsAction } from '@/server/actions/authorization/list-permissions';
import { listRolePermissionsAction } from '@/server/actions/authorization/list-role-permissions';
import { revokePermissionFromRoleAction } from '@/server/actions/authorization/revoke-role-permission';
import { useUserStore } from '@/stores/userStore';
import { hasPermission } from '@/utils/permission/hasPermission';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, ListChecks, LoaderCircle, Save, Search, X, XCircle } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { getAdministrativePermissions, getModuleLabel, getPermissionDescription, getPermissionName } from './permissionLabels';
import styles from './ManageRolePermissionsModal.module.css';

interface Props { roleId: number; roleName: string; roleKind: RoleKind }

function PermissionRow({ permission, checked, disabled, isSaving, onToggle }: {
    permission: PermissionResponse; checked: boolean; disabled: boolean; isSaving: boolean; onToggle: (checked: boolean) => void;
}) {
    return <label className={twMerge(styles.permission, 'flex w-full items-start gap-3 rounded-xl border p-3 transition-colors', checked ? 'border-j-blue-200 bg-j-blue-50' : 'border-j-gray-200 bg-j-white', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-j-blue-300 hover:bg-j-gray-100/60')}>
        <input type="checkbox" checked={checked} disabled={disabled || isSaving} onChange={(event) => onToggle(event.target.checked)} className={styles.checkbox} />
        <span className="min-w-0">
            <span className="block text-sm font-black text-j-blue-800">{getPermissionName(permission)}</span>
            <span className="mt-0.5 block text-xs text-j-gray-600">{getPermissionDescription(permission)}</span>
        </span>
    </label>;
}

export function ManageRolePermissionsModal({ roleId, roleName, roleKind }: Props) {
    const titleId = useId();
    const savingRef = useRef(false);
    const { setClose } = useModal();
    const queryClient = useQueryClient();
    const userPermissions = useUserStore((state) => state.permissions);
    const canAssign = hasPermission(userPermissions, 'AUTHORIZATION', 'PERMISSION_ASSIGN');
    const canRevoke = hasPermission(userPermissions, 'AUTHORIZATION', 'PERMISSION_REVOKE');
    const isProtected = roleKind === 'ROOT';
    const [draftIds, setDraftIds] = useState<Set<number> | null>(null);
    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [saveError, setSaveError] = useState('');
    const rolePermissionsQueryKey = ['authorization', 'roles', roleId, 'permissions'];

    const { data: catalog, isLoading: isLoadingCatalog, isError: isCatalogError, refetch: reloadCatalog } = useQuery({ queryKey: ['authorization', 'permissions'], queryFn: listPermissionsAction });
    const { data: rolePermissions, isLoading: isLoadingRolePermissions, isError: isRolePermissionsError, refetch: reloadRolePermissions } = useQuery({ queryKey: rolePermissionsQueryKey, queryFn: () => listRolePermissionsAction(roleId) });
    const administrativeCatalog = useMemo(() => getAdministrativePermissions(catalog ?? []), [catalog]);
    const assignedIds = useMemo(() => new Set(getAdministrativePermissions(rolePermissions ?? []).map((permission) => permission.id)), [rolePermissions]);
    const selectedIds = draftIds ?? assignedIds;
    const modules = useMemo(
        () => [...new Set(administrativeCatalog.map((permission) => permission.module))]
            .sort((left, right) => getModuleLabel(left).localeCompare(getModuleLabel(right), "pt-BR")),
        [administrativeCatalog],
    );
    const filtered = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();
        return administrativeCatalog.filter((permission) => (!moduleFilter.length || moduleFilter.includes(permission.module))
            && (!query || `${getPermissionName(permission)} ${getPermissionDescription(permission)} ${getModuleLabel(permission.module)}`.toLocaleLowerCase().includes(query)));
    }, [administrativeCatalog, moduleFilter, search]);
    const grouped = useMemo(() => filtered.reduce<Record<string, PermissionResponse[]>>((groups, permission) => {
        (groups[permission.module] ??= []).push(permission);
        return groups;
    }, {}), [filtered]);
    const changes = administrativeCatalog.filter((permission) => assignedIds.has(permission.id) !== selectedIds.has(permission.id));
    const isLoading = isLoadingCatalog || isLoadingRolePermissions;
    const isError = isCatalogError || isRolePermissionsError;

    const togglePermission = (permissionId: number, checked: boolean) => {
        if (savingRef.current || isProtected || isLoading || isError) return;
        if (assignedIds.has(permissionId) ? !canRevoke : !canAssign) return;
        setSaveError('');
        setDraftIds(previous => {
            const next = new Set(previous ?? assignedIds);
            if (checked) next.add(permissionId);
            else next.delete(permissionId);
            return next;
        });
    };

    const setPermissionSelection = (permissions: PermissionResponse[], checked: boolean) => {
        if (savingRef.current || isProtected || isLoading || isError) return;
        setSaveError('');
        setDraftIds((previous) => {
            const next = new Set(previous ?? assignedIds);
            permissions.forEach((permission) => {
                if (checked && canAssign) next.add(permission.id);
                if (!checked && canRevoke) next.delete(permission.id);
            });
            return next;
        });
    };

    const saveChanges = async () => {
        if (!draftIds || !changes.length || savingRef.current || isProtected || isLoading || isError) return;
        if (changes.some(permission => selectedIds.has(permission.id) ? !canAssign : !canRevoke)) return;
        savingRef.current = true;
        setSaveError('');
        const desired = new Set(draftIds);
        setIsSaving(true);
        setPendingCount(changes.length);
        let cursor = 0;
        const succeeded: PermissionResponse[] = [];
        const failed: PermissionResponse[] = [];
        let firstError = '';
        await Promise.all(Array.from({ length: Math.min(4, changes.length) }, async () => {
            while (cursor < changes.length) {
                const permission = changes[cursor++];
                try {
                    if (desired.has(permission.id)) await assignPermissionToRoleAction(roleId, permission.id);
                    else await revokePermissionFromRoleAction(roleId, permission.id);
                    succeeded.push(permission);
                } catch (error) {
                    failed.push(permission);
                    if (!firstError) firstError = error instanceof Error ? error.message : 'Tente novamente.';
                }
                setPendingCount((count) => Math.max(0, count - 1));
            }
        }));

        const actualIds = new Set((rolePermissions ?? []).map((permission) => permission.id));
        succeeded.forEach((permission) => desired.has(permission.id) ? actualIds.add(permission.id) : actualIds.delete(permission.id));
        if (catalog) queryClient.setQueryData(rolePermissionsQueryKey, catalog.filter((permission) => actualIds.has(permission.id)));
        void queryClient.invalidateQueries({ queryKey: rolePermissionsQueryKey });
        setPendingCount(0);
        if (failed.length) {
            setSaveError(`${failed.length} alterações não foram salvas. ${firstError} As seleções pendentes foram mantidas para tentar novamente.`);
            setDraftIds(desired);
        } else {
            toast.success(`${succeeded.length} permissão(ões) atualizada(s) com sucesso.`);
            setClose();
        }
        setIsSaving(false);
        savingRef.current = false;
    };

    return <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <ButtonIcon type="button" onClick={setClose} disabled={isSaving} aria-label="Fechar" className="absolute right-4 top-4 z-10 rounded-full bg-j-gray-100 p-2 text-j-gray-600 hover:bg-j-gray-200 hover:text-j-blue-800">
            <X className="h-5 w-5 md:h-[22px] md:w-[22px]" />
        </ButtonIcon>
        <header className={styles.header}>
            <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-j-blue-800 text-j-yellow-300">
                    <ListChecks size={20} />
                </span>
                <div className="min-w-0">
                    <h2 id={titleId} className="text-xl font-extrabold text-j-blue-800 md:text-2xl">Gerenciar permissões</h2>
                    <p className="mt-1 max-w-lg break-words text-xs leading-relaxed text-j-gray-500 md:text-sm">Selecione o que o cargo <strong className="text-j-blue-800">{roleName}</strong> pode acessar.</p>
                </div>
            </div>{isProtected && <p className="mt-2 text-xs">Este cargo é protegido e não pode ser alterado.</p>}</header>
        <section className="shrink-0 space-y-3 border-b border-j-gray-100 bg-j-white px-5 py-4 md:px-8">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
                <label className="relative block">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-j-gray-400" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou descrição" aria-label="Buscar permissão" className="h-11 w-full rounded-xl border border-input-border bg-background-secondary pl-10 pr-3 text-sm text-input-text outline-none placeholder:text-input-placeholder focus:border-input-border-focus focus:bg-input-bg-focus" />
                </label>
                <Select.Unregister
                    label="Filtrar por módulos"
                    labelClassName="sr-only"
                    name="permission-modules"
                    multiple
                    searchable
                    placeholder="Todos os módulos"
                    value={moduleFilter}
                    onValueChange={(value) => setModuleFilter(Array.isArray(value) ? value : [])}
                    options={modules.map((module) => ({ value: module, label: getModuleLabel(module) }))}
                    className="h-11 rounded-xl bg-background-secondary px-3 py-0 text-sm"
                />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold text-j-gray-500">{selectedIds.size} {selectedIds.size === 1 ? 'permissão selecionada' : 'permissões selecionadas'}</p>
                <div className="flex flex-wrap gap-1">
                    <button type="button" aria-label="Selecionar permissões filtradas" disabled={!canAssign || isProtected || isSaving || !filtered.length} onClick={() => setPermissionSelection(filtered, true)} className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-primary enabled:hover:bg-background-secondary disabled:opacity-40">
                        <CheckCheck size={14} aria-hidden="true" />Selecionar</button>
                    <button type="button" aria-label="Limpar permissões filtradas" disabled={!canRevoke || isProtected || isSaving || !filtered.length} onClick={() => setPermissionSelection(filtered, false)} className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-primary enabled:hover:bg-background-secondary disabled:opacity-40">
                        <XCircle size={14} aria-hidden="true" />Limpar</button>
                </div>
            </div>
        </section>
        <div className={styles.list} aria-busy={isLoading || isSaving}>
            {isLoading && <div className="flex items-center justify-center gap-2 py-10 text-j-gray-500">
                <LoaderCircle size={20} className="animate-spin" />Carregando permissões...</div>}
            {isError && <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-input-error-text">Não foi possível carregar o catálogo ou as permissões do cargo.</p>
                <button type="button" onClick={() => { void reloadCatalog(); void reloadRolePermissions(); }} className="rounded-lg border border-j-gray-200 px-4 py-2 text-sm font-bold text-j-blue-800">Tentar novamente</button>
            </div>}
            {!isLoading && !isError && filtered.length === 0 && <p className="py-10 text-center text-sm text-j-gray-500">Nenhuma permissão corresponde aos filtros.</p>}
            {!isLoading && !isError && <div className="flex flex-col gap-5">{Object.entries(grouped).map(([module, permissions]) => <section key={module}>
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-j-blue-800">{getModuleLabel(module)}</h3>
                    <span className="text-xs text-j-gray-400">{permissions.filter((permission) => selectedIds.has(permission.id)).length}/{permissions.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">{permissions.map((permission) => {
                    const checked = selectedIds.has(permission.id);
                    const missingPermission = assignedIds.has(permission.id) ? !canRevoke : !canAssign;
                    return <PermissionRow key={permission.id} permission={permission} checked={checked} disabled={isProtected || missingPermission || isSaving} isSaving={isSaving} onToggle={(next) => togglePermission(permission.id, next)} />;
                })}</div>
            </section>)}</div>}
        </div>
        <footer className={styles.footer}>
            {saveError && <p role="alert" className={styles.error}>{saveError}</p>}
            <p role="status" className="mb-2 text-xs text-j-gray-500">{isSaving ? `Salvando… ${pendingCount} pendentes` : changes.length ? `${changes.length} ${changes.length === 1 ? 'alteração pendente' : 'alterações pendentes'}` : 'Nenhuma alteração pendente'}</p>
            <div className={styles.actions}>
                <button type="button" onClick={() => { setDraftIds(null); setSaveError(''); }} disabled={!changes.length || isSaving}>Descartar alterações</button>
                <button type="button" onClick={() => void saveChanges()} disabled={isLoading || isError || !changes.length || isSaving || isProtected} className={styles.save}>{isSaving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />} {isSaving ? 'Salvando…' : 'Salvar alterações'}</button>
            </div>
        </footer>
    </section>;
}

export default ManageRolePermissionsModal;
