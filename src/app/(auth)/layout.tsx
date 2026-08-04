import UserProvider from "@/providers/auth/UserProvider";
import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import { verifyWithSchema } from "@/services/token/verify";
import { getAuthCookies } from "@/utils/auth/get";
import { haveRoutePermissions } from "@/utils/permission/routePermissions";
import { hasAnyAdminAccess } from "@/config/adminModules";

import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const pathname = headerStore.get("x-route-pathname");

  if (!pathname) {
    notFound();
  }

  const permissionsToken =
    cookieStore.get("Permissions")?.value ?? "";

  const authCookies = await getAuthCookies.SERVER();

  if (
    !authCookies?.AuthAccessToken ||
    !authCookies?.AuthRefreshToken
  ) {
    redirect("/login");
  }

  const permissions =
    await verifyWithSchema<PermissionModule[]>(
      permissionsToken,
      permissionModuleSchema.array(),
    ).catch(() => {
      redirect("/api/auth/logout");
    });

  const isAdminHome = pathname === "/admin";

  const userHasPermission = isAdminHome
    ? hasAnyAdminAccess(permissions)
    : await haveRoutePermissions({
        pathname,
        permissionsToken,
        onCatch: () => redirect("/api/auth/logout"),
      });

  if (!userHasPermission) {
    console.log(
      "Usuário sem permissão para acessar:",
      pathname,
    );

    notFound();
  }

  return (
    <UserProvider permissions={permissions}>
      {children}
    </UserProvider>
  );
}