"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";

interface UserProviderProps {
    permissions: PermissionModule[];
    children: React.ReactNode;
}

export default function UserProvider({
    permissions,
    children,
}: UserProviderProps) {
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