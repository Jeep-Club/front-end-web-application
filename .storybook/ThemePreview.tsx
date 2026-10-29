import { useEffect, type ReactNode } from "react";
import { applyTheme, parseTheme } from "../src/utils/theme";

/** Uses the app's document theme so body and portalled menus share the canvas appearance. */
export function ThemePreview({ theme, children }: { theme: unknown; children: ReactNode }) {
  useEffect(() => {
    const preference = parseTheme(theme);
    const update = () => applyTheme(preference);
    update();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    if (preference === "system") media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [theme]);

  return <div lang="pt-BR" className="bg-background text-primary antialiased font-sans">{children}</div>;
}
