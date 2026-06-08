import UserProvider from "@/providers/auth/UserProvider";
import { meCookieSchema, meResponseSchema } from "@/schemas/auth/me/me";
import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { verifyWithSchema } from "@/services/token/verify";
import { HttpAPIRoutes } from "@/utils/http/api";
import { getAuthCookies } from "@/utils/auth/get";
import { routePermissions } from "@/utils/permission/routePermissions";

import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";


export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const pathname = headerStore.get('x-route-pathname');
  if (!pathname) {
    throw notFound();
  }

  const meToken = cookieStore.get("Me")?.value || '';
  const permissionsToken = cookieStore.get("Permissions")?.value || '';


  const authCookies = await getAuthCookies.SERVER();
  if (!authCookies || !authCookies?.AuthAccessToken || !authCookies?.AuthRefreshToken) {
    throw notFound();
  }

    const permissions = await verifyWithSchema<PermissionModule[]>(permissionsToken, permissionModuleSchema.array())
      .catch(() => {
        throw redirect('api/auth/logout');
      });
    if (routePermissions[pathname]) {
      const requiredPermissions = routePermissions[pathname];
      const hasRequiredPermissions = requiredPermissions.every(module => {
        const userModule = permissions.find(userModule => userModule.module === module.module);
        if (!userModule) {
          return false;
        }
        const hasRequiredActions = module.actions.every(action => userModule.actions.includes(action));
        if (!hasRequiredActions) {
          return false;
        }
        return true;
      });
      if (!hasRequiredPermissions) {
        throw notFound();
      }
    }

    return (
      <>
        <UserProvider permissions={permissions}>
          {children}
        </UserProvider>
      </>
    )

}

