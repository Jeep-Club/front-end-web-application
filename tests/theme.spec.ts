import { runInNewContext } from 'node:vm';
import { parseTheme, resolveTheme, THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from '@/utils/theme';

it.each([
    ['light', false, 'light'], ['light', true, 'light'], ['dark', false, 'dark'], ['dark', true, 'dark'],
    ['system', false, 'light'], ['system', true, 'dark'],
] as const)('resolves %s with system dark=%s to %s', (preference, systemDark, expected) => {
    expect(resolveTheme(preference, systemDark)).toBe(expected);
});

it.each([undefined, null, 'invalid', 'system', {}])('falls back to system for %s', (value) => {
    expect(parseTheme(value)).toBe('system');
});

it.each([
    ['light', true, 'light'], ['dark', false, 'dark'], ['system', true, 'dark'], [null, false, 'light'], ['invalid', true, 'dark'],
] as const)('initializes appearance before hydration: %s', (stored, systemDark, expected) => {
    const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
    const getItem = jest.fn(() => stored);
    runInNewContext(THEME_INIT_SCRIPT, { document: { documentElement: root }, localStorage: { getItem }, matchMedia: () => ({ matches: systemDark }) });
    expect(getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
    expect(root.dataset.theme).toBe(expected);
    expect(root.style.colorScheme).toBe(expected);
});

it('still applies system appearance if browser storage is blocked', () => {
    const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
    runInNewContext(THEME_INIT_SCRIPT, { document: { documentElement: root }, localStorage: { getItem: () => { throw new Error('Blocked'); } }, matchMedia: () => ({ matches: true }) });
    expect(root.dataset).toEqual({ themePreference: 'system', theme: 'dark' });
});
