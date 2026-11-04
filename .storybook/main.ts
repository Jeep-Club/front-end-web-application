import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["./Introduction.mdx", "./docs/*.mdx", "../src/components/**/*.mdx", "../src/components/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
};

export default config;
