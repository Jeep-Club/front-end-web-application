/// <reference types="vite/client" />

import type { Preview } from "@storybook/nextjs-vite";
import { Geist, Geist_Mono } from "next/font/google";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";
import "../src/app/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
    viewport: { options: MINIMAL_VIEWPORTS },
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
