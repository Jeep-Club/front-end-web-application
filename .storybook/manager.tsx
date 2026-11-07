import { useEffect } from "react";
import { addons, types, useGlobals, useStorybookApi } from "storybook/manager-api";
import { themes } from "storybook/theming";
import { useResolvedTheme } from "./useResolvedTheme";

function StorybookTheme() {
  const [globals] = useGlobals();
  const api = useStorybookApi();
  const theme = useResolvedTheme(globals.storybookTheme ?? "light");

  useEffect(() => {
    api.setOptions({ theme: themes[theme] });
    document.documentElement.dataset.storybookTheme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [api, theme]);

  return null;
}

// Os dois seletores são fornecidos por globalTypes; esta ferramenta só sincroniza o manager.
addons.register("jeep-club/storybook-theme", () => {
  addons.add("jeep-club/storybook-theme/sync", {
    type: types.TOOL,
    title: "Sincronização do tema",
    render: StorybookTheme,
  });
});
