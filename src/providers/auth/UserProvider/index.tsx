'use client';

import { useUserStore } from "@/stores/userStore";


interface UserProviderProps {
    permissions: PermissionModule[];
    children: React.ReactNode;
}
export default function UserProvider({ permissions, children }: UserProviderProps) {
    const setPermissions = useUserStore((state) => state.setPermissions);
    setPermissions(permissions);

    console.log('UserProvider permissions:', permissions);
    return (
        <>
            {children}
        </>
    );
}