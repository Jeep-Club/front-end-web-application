"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export const AdminUserIdContext = createContext<string | number>("unknown");
export const useAdminUserId = () => useContext(AdminUserIdContext);

const eventName = "admin:favorites-changed";

function storageKey(userId: string | number) {
    return `admin-favorites:${userId}`;
}

export function useAdminFavorites(userId: string | number) {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const key = storageKey(userId);
        const read = () => {
            try {
                const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
                setFavorites(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
            } catch {
                setFavorites([]);
            }
        };
        read();
        window.addEventListener(eventName, read);
        window.addEventListener("storage", read);
        return () => {
            window.removeEventListener(eventName, read);
            window.removeEventListener("storage", read);
        };
    }, [userId]);

    const toggleFavorite = useCallback((moduleKey: string) => {
        const key = storageKey(userId);
        let next: string[] = [];
        try {
            const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
            const current = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
            next = current.includes(moduleKey) ? current.filter((item) => item !== moduleKey) : [...current, moduleKey];
            localStorage.setItem(key, JSON.stringify(next));
        } catch {
            return;
        }
        setFavorites(next);
        window.dispatchEvent(new Event(eventName));
    }, [userId]);

    return { favorites, toggleFavorite };
}
