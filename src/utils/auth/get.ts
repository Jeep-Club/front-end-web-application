export const getAuthCookies = {
    SERVER: async () => {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token = cookieStore.get("AuthAccessToken")?.value;
        const refreshToken = cookieStore.get("AuthRefreshToken")?.value;
        const accessExpiration = cookieStore.get("AccessTokenExpiration")?.value;
        if (!token || !refreshToken || !accessExpiration) {
            return null;
        }
        return {
            AuthAccessToken: token,
            AuthRefreshToken: refreshToken,
            AccessTokenExpiration: accessExpiration,
        }
    },
    CLIENT: async () => {
        const { default: Cookies } = await import("js-cookie");
        const token = Cookies.get("AuthAccessToken");
        const accessExpiration = Cookies.get("AccessTokenExpiration");
        if (!token || !accessExpiration) {
            return null;
        }
        return {
            AuthAccessToken: token,
            AccessTokenExpiration: accessExpiration,
        }
    }

}