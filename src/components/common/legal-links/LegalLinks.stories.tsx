import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import LegalLinks from "./index";

const meta = {
    title: "Componentes/Navegação/Links legais",
    component: LegalLinks,
} satisfies Meta<typeof LegalLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
