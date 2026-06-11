import { getAuthCookies } from "@/utils/auth/get";
import {redirect} from "next/navigation";


export default async function NoAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const cookies = await getAuthCookies.SERVER();
    if (cookies?.AuthAccessToken || cookies?.AuthRefreshToken) {
        throw redirect('/home');
    }

    return (
        <>
            {children}
        </>
    );
}