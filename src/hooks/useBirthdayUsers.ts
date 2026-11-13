"use client";

import { useQuery } from "@tanstack/react-query";
import { listBirthdayUsersAction } from "@/server/actions/identity/birthdays";

export function useBirthdayUsers(month: number) {
    return useQuery({
        queryKey: ["identity", "birthdays", month],
        queryFn: () => listBirthdayUsersAction({ month }),
        staleTime: 5 * 60_000,
    });
}
