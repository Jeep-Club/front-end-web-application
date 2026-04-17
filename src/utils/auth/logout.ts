import { cookies } from "next/headers";

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('AuthAccessToken');
    cookieStore.delete('AuthRefreshToken');
    cookieStore.delete('AccessTokenExpiration');
}