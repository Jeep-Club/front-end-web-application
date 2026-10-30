import { useSyncExternalStore } from "react";
import { parseTheme, resolveTheme } from "../src/utils/theme";

const query = "(prefers-color-scheme: dark)";
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

/** Resolve a preferência também quando o tema do sistema muda com o catálogo aberto. */
export function useResolvedTheme(preference: unknown) {
  const prefersDark = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  return resolveTheme(parseTheme(preference), prefersDark);
}
