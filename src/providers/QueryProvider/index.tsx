'use client';

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { mutationErrorHandler } from "./handlers/mutation/onError";
import { queryErrorHandler } from "./handlers/query/onError";


export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        mutationCache: new MutationCache({
            onError: (error: any) => mutationErrorHandler(error),
        }),
        queryCache: new QueryCache({
            onError: (error: any) => queryErrorHandler(error),
        }),

    });
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}