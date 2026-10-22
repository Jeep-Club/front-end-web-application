export type ThemePreference = 'light' | 'dark' | 'system';
export const THEME_STORAGE_KEY = 'jeep-clube-theme';
export const THEME_CHANGE_EVENT = 'jeep-clube-theme-change';

export function parseTheme(value: unknown): ThemePreference {
    return value === 'light' || value === 'dark' ? value : 'system';
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): 'light' | 'dark' {
    return preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference;
}

export function getThemePreference(): ThemePreference {
    return parseTheme(document.documentElement.dataset.themePreference);
}

export function applyTheme(preference: ThemePreference) {
    const root = document.documentElement;
    const resolved = resolveTheme(preference, window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.themePreference = preference;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

// Runs before paint, including when storage access is unavailable.
export const THEME_INIT_SCRIPT = `(() => {
    let preference = 'system';
    try {
        const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
        if (stored === 'light' || stored === 'dark') preference = stored;
    } catch {}
    const theme = preference === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
    const root = document.documentElement;
    root.dataset.themePreference = preference;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
})();`;
