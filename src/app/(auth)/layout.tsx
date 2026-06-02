import UserProvider from "@/providers/auth/UserProvider";
import { meResponseSchema } from "@/schemas/auth/me/meResponse";
import { permissionModuleSchema } from "@/schemas/auth/permission/permissionModule";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { verifyWithSchema } from "@/services/token/verify";
import { HttpAPIRoutes } from "@/utils/http/api";
import { mapMePermissionToModule } from "@/utils/permission/userPermission";
import { verify } from "crypto";

import { cookies } from "next/headers";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const permissionsToken = cookieStore.get("Permissions")?.value || '';

  const permissions = await verifyWithSchema<PermissionModule[]>(permissionsToken, permissionModuleSchema.array());



  // const responsePermissions = await serverFetchWrapper<GetPermissionResponse>({
  //   url: HttpAPIRoutes.PERMISSIONS,
  //   method: 'GET',
  //   schema: permissionResponseSchema
  // });


  return (
    <>
    <UserProvider permissions={permissions}>
      {children}
    </UserProvider>
    </>
  )
}

