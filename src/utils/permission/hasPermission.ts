/**
 * Checa se o usuário tem UMA permissão específica — pra controlar o
 * que aparece DENTRO de uma tela já liberada (botão de criar, editar,
 * excluir etc), diferente da visibilityPermission em adminModules.ts,
 * que decide se a tela/card existe pro usuário.
 *
 * Isso é só UX: esconder/desabilitar um botão evita clique confuso,
 * mas não é a camada de segurança. A action/endpoint chamado pelo
 * botão precisa validar a mesma permissão de novo, do lado do
 * servidor — front nenhum substitui isso.
 *
 * Exemplo:
 * const permissions = useUserStore((state) => state.permissions);
 * const canCreateRole = hasPermission(permissions, "AUTHORIZATION", "ROLE_CREATE");
 * {canCreateRole && <Button onClick={openCreateRoleModal}>Criar role</Button>}
 */
export function hasPermission(
    userPermissions: PermissionModule[],
    module: string,
    action: string,
): boolean {
    const userModule = userPermissions.find(
        (permissionModule) => permissionModule.module === module,
    );

    return userModule?.actions.includes(action) ?? false;
}
