'use client';

import { MutationCache,QueryCache,QueryClient,QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { mutationErrorHandler } from "./handlers/mutation/onError";
import { queryErrorHandler } from "./handlers/query/onError";
import { restoreActionError } from "@/utils/http/ActionError";
import { SESSION_EXPIRED_MESSAGE } from "@/utils/http/apiError";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        mutationCache: new MutationCache({
            onError: mutationErrorHandler,
        }),
        queryCache: new QueryCache({
            onError: (error, query) => {
                restoreActionError(error);
                // Inline recovery owns ordinary errors; session expiry always logs out.
                if (!query.meta?.handlesError || error.message === SESSION_EXPIRED_MESSAGE) queryErrorHandler(error);
            },
        }),

    }));
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
