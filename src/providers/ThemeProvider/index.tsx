"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { applyTheme, getThemePreference, parseTheme, THEME_CHANGE_EVENT, THEME_STORAGE_KEY, type ThemePreference } from '@/utils/theme';

interface ThemeContextValue {
    theme: ThemePreference;
    setTheme: (theme: ThemePreference) => void;
    saveTheme: () => void;
}
const ThemeContext = createContext<ThemeContextValue | null>(null);
const getServerSnapshot = (): ThemePreference => 'system';
function subscribe(listener: () => void) {
    window.addEventListener(THEME_CHANGE_EVENT, listener);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, listener);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useSyncExternalStore(subscribe, getThemePreference, getServerSnapshot);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onSystemChange = () => {
            if (getThemePreference() === 'system') applyTheme('system');
        };
        const onStorage = (event: StorageEvent) => {
            if (event.key === THEME_STORAGE_KEY || event.key === null) applyTheme(parseTheme(event.newValue));
        };
        media.addEventListener('change', onSystemChange);
        window.addEventListener('storage', onStorage);
        return () => {
            media.removeEventListener('change', onSystemChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const value = useMemo(() => ({
        theme,
        setTheme: applyTheme,
        saveTheme: () => localStorage.setItem(THEME_STORAGE_KEY, theme),
    }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme requires ThemeProvider');
    return context;
}
