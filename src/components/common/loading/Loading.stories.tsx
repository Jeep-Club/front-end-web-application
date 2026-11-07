import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import Loading from "./index";

const meta = {
    title: "Componentes/Loading",
    component: Loading,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Carregando: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("status")).toHaveTextContent("Carregando...");
    },
};
