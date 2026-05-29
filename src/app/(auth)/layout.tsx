import { meResponseSchema } from "@/schemas/auth/me/meResponse";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import z from "zod";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const response = await serverFetchWrapper<MeResponse>({
    url: HttpAPIRoutes.ME,
    method: 'GET',
    schema: meResponseSchema
  });
  console.log('Me action response:', response);
  return (
    <>
      {children}
    </>
  )
}

