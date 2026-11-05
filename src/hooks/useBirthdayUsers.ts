"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { BirthdayUser } from "@/schemas/admin/birthdays";
import { listBirthdayUsersAction } from "@/server/actions/admin/users/birthdays";

const PAGE_SIZE = 50;

export function useBirthdayUsers() {
    const query = useInfiniteQuery({
        queryKey: ["users", "birthdays"],
        queryFn: ({ pageParam }) => listBirthdayUsersAction({ page: pageParam, size: PAGE_SIZE }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
        staleTime: 5 * 60_000,
    });
    const { hasNextPage, isFetchingNextPage, isError, fetchNextPage } = query;

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage && !isError) {
            void fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

    const users: BirthdayUser[] = (query.data?.pages ?? [])
        .flatMap((page) => page.content)
        .filter((user) => user.birthMonth !== null && user.birthDay !== null);

    return { ...query, users };
}
