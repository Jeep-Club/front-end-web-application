'use client';

import { useState } from "react";
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query";
import { mutationErrorHandler } from "./handlers/mutation/onError";
import { queryErrorHandler } from "./handlers/query/onError";


export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        mutationCache: new MutationCache({
            onError: (error, _variables, _context, mutation) => mutationErrorHandler(error, !!mutation.options.onError),
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