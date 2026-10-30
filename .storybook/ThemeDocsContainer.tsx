import { useCallback, useSyncExternalStore, type PropsWithChildren } from "react";
import { DocsContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { themes } from "storybook/theming";
import { useResolvedTheme } from "./useResolvedTheme";

/** Docs acompanha a interface do Storybook, independentemente do tema das stories. */
export function ThemeDocsContainer({ context, children }: PropsWithChildren<DocsContainerProps>) {
  const { channel } = context;
  const subscribe = useCallback((notify: () => void) => {
    channel.on(GLOBALS_UPDATED, notify);
    channel.on(SET_GLOBALS, notify);
    return () => {
      channel.off(GLOBALS_UPDATED, notify);
      channel.off(SET_GLOBALS, notify);
    };
  }, [channel]);
  const preference = useSyncExternalStore(subscribe, () => {
    const payload = channel.last(GLOBALS_UPDATED)?.[0] ?? channel.last(SET_GLOBALS)?.[0];
    return payload?.globals?.storybookTheme ?? "light";
  }, () => "light");
  const theme = useResolvedTheme(preference);

  return <DocsContainer context={context} theme={themes[theme]}>{children}</DocsContainer>;
}
