import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ProfileTabLoading } from "./ProfileTabLoading";

const meta = {
    title: "Páginas/Perfil/Carregamento das abas",
    component: ProfileTabLoading,
    args: { label: "Carregando perfil médico...", layout: "medical" },
    argTypes: { layout: { control: "select", options: ["medical", "cards", "rows"] } },
    parameters: { docs: { description: { component: "Estado de carregamento inicial das abas de dados médicos, veículos, dependentes e ferramentas. O texto anuncia o progresso; as formas são decorativas." } } },
} satisfies Meta<typeof ProfileTabLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DadosMedicos: Story = {
    play: async ({ canvas }) => { await expect(canvas.getByRole("status")).toHaveTextContent("Carregando perfil médico..."); },
};
export const Veiculos: Story = { args: { label: "Carregando veículos...", layout: "cards" } };
export const DependentesEFerramentas: Story = { args: { label: "Carregando dependentes...", layout: "rows" } };
