"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { useQueryClient } from '@tanstack/react-query';

interface UserProviderProps {
    permissions: PermissionModule[];
    children: React.ReactNode;
}

export default function UserProvider({
    permissions,
    children,
}: UserProviderProps) {
    const queryClient = useQueryClient();
    useEffect(() => () => {
        // Menu logout uses soft navigation: personalized likedByMe/cache must not
        // survive this authenticated boundary into another user's session.
        queryClient.removeQueries({ queryKey: ['publications'] });
    }, [queryClient]);
    const setPermissions = useUserStore(
        (state) => state.setPermissions,
    );

    useEffect(() => {
        setPermissions(permissions);

        return () => {
            setPermissions([]);
        };
    }, [permissions, setPermissions]);

    return children;
}
