"use client";

import { useQuery } from "@tanstack/react-query";
import { listBirthdayUsersAction } from "@/server/actions/identity/birthdays";

export function useBirthdayUsers(month: number) {
    return useQuery({
        queryKey: ["identity", "birthdays", month],
        queryFn: () => listBirthdayUsersAction({ month }),
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
    });
}
