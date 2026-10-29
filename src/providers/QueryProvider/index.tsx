'use client';

import { MutationCache,QueryCache,QueryClient,QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { mutationErrorHandler } from "./handlers/mutation/onError";
import { queryErrorHandler } from "./handlers/query/onError";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        mutationCache: new MutationCache({
            onError: mutationErrorHandler,
        }),
        queryCache: new QueryCache({
            onError: (error) => queryErrorHandler(error),
        }),

    }));
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
