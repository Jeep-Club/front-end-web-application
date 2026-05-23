import { meAction } from "@/actions/me";
import serverFetchWrapper from "@/services/fetchWrapper/serverFetchWrapper";
import { HttpAPIRoutes } from "@/utils/http/api";
import z from "zod";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const response = await serverFetchWrapper({
    url: HttpAPIRoutes.ME,
    method: 'GET',
    schema: z.any()
  });
  console.log('Me action response:', response);
  return (
    <>
      {children}
    </>
  )
}

