import UserProvider from "@/providers/auth/UserProvider";
import { meCookieSchema, meResponseSchema } from "@/schemas/auth/me/me";
import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { verifyWithSchema } from "@/services/token/verify";
import { HttpAPIRoutes } from "@/utils/http/api";
import { getAuthCookies } from "@/utils/auth/get";
import { haveRoutePermissions, routePermissions } from "@/utils/permission/routePermissions";

import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import z from "zod";


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
    // if (routePermissions[pathname]) {
    //   const requiredPermissions = routePermissions[pathname];
    //   const hasRequiredPermissions = requiredPermissions.every(module => {
    //     const userModule = permissions.find(userModule => userModule.module === module.module);
    //     if (!userModule) {
    //       return false;
    //     }
    //     const hasRequiredActions = module.actions.every(action => userModule.actions.includes(action));
    //     if (!hasRequiredActions) {
    //       return false;
    //     }
    //     return true;
    //   });
    //   if (!hasRequiredPermissions) {
    //     throw notFound();
    //   }
    // }

    const havePermissions = await haveRoutePermissions({ pathname, permissionsToken, onCatch: () => redirect('api/auth/logout') });

    if (!havePermissions) {
      console.log('User does not have required permissions for this route.', pathname);
      throw notFound();
    }

    const response = await serverFetchWrapper({
      url: HttpAPIRoutes.PERMISSIONS,
      method: 'GET',
      schema: z.any()
    })
    console.log(response.data);

    return (
      <>
        <UserProvider permissions={permissions}>
          {children}
        </UserProvider>
      </>
    )

}

