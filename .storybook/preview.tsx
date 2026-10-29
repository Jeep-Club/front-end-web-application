/// <reference types="vite/client" />

import type { Preview } from "@storybook/nextjs-vite";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import { ThemePreview } from "./ThemePreview";
import "../src/app/globals.css";

// font-sans follows the app's current CSS mapping. Unmapped Google font variables
// add a remote request during preview compilation without changing that font stack.


const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: { theme: "light" },
  globalTypes: {
    theme: {
      description: "Aparência da aplicação",
      toolbar: {
        title: "Tema",
        icon: "circlehollow",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Escuro" },
          { value: "system", title: "Sistema" },
        ],
      },
    },
  },
  parameters: {
    options: {
      storySort: { order: ["Introdução", "Documentação", "Componentes", "Páginas"] },
    },
    nextjs: { appDirectory: true },
    viewport: { options: MINIMAL_VIEWPORTS },
    layout: "padded",
  },
  decorators: [
    (Story, context) => <ThemePreview theme={context.globals.theme}><Story /></ThemePreview>,
  ],
};

export default preview;
