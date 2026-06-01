import { meResponseSchema } from "@/schemas/auth/me/meResponse";
import { permissionResponseSchema } from "@/schemas/auth/permission/permissionResponse";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import z from "zod";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const responseMe = await serverFetchWrapper<MeResponse>({
    url: HttpAPIRoutes.ME,
    method: 'GET',
    schema: meResponseSchema
  });
  console.log('Me action response:', responseMe);

  const responsePermissions = await serverFetchWrapper<GetPermissionResponse>({
    url: HttpAPIRoutes.PERMISSIONS,
    method: 'GET',
    schema: permissionResponseSchema
  });
  console.log('Permissions response:', responsePermissions);

  return (
    <>
      {children}
    </>
  )
}

