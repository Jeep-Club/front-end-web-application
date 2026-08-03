

export const getPathname = {
    SERVER: async (): Promise<string | null> => {
        const { headers } = await import("next/headers");
        const headerStore = await headers();

        const pathname = headerStore.get('x-route-pathname');
        return pathname;
    },
    CLIENT: async (): Promise<string | null> => {
        return window.location.pathname;
    }
}