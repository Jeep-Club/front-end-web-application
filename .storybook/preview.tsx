/// <reference types="vite/client" />

import type { Preview } from "@storybook/nextjs-vite";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import { ThemePreview } from "./ThemePreview";
import { ThemeDocsContainer } from "./ThemeDocsContainer";
import "../src/app/globals.css";
import "./preview.css";

// font-sans follows the app's current CSS mapping. Unmapped Google font variables
// add a remote request during preview compilation without changing that font stack.


const preview: Preview = {
  tags: ["autodocs"],
  initialGlobals: { theme: "light", storybookTheme: "light" },
  globalTypes: {
    storybookTheme: {
      description: "Tema do Storybook",
      toolbar: {
        title: "Storybook",
        icon: "browser",
        dynamicTitle: false,
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Escuro" },
          { value: "system", title: "Sistema" },
        ],
      },
    },
    theme: {
      description: "Tema dos componentes",
      toolbar: {
        title: "Componentes",
        icon: "circlehollow",
        dynamicTitle: false,
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Escuro" },
          { value: "system", title: "Sistema" },
          { value: "storybook", title: "Storybook" },
        ],
      },
    },
  },
  parameters: {
    docs: { container: ThemeDocsContainer },
    options: {
      storySort: { order: ["Introdução", "Documentação", "Componentes", "Páginas"] },
    },
    nextjs: { appDirectory: true },
    viewport: { options: MINIMAL_VIEWPORTS },
    layout: "padded",
  },
  decorators: [
    (Story, context) => <ThemePreview theme={context.globals.theme} storybookTheme={context.globals.storybookTheme}><Story /></ThemePreview>,
  ],
};

export default preview;
