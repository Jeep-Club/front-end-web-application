import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "@/components/common/button";
import { HeartPulse, Plus } from "lucide-react";
import { ProfileTabEmptyState } from "./ProfileTabEmptyState";

const meta = {
    title: "Páginas/Perfil/Estado vazio das abas",
    component: ProfileTabEmptyState,
    args: {
        icon: HeartPulse,
        title: "Meu perfil de saúde",
        description: "Informações úteis para seu cuidado e em caso de emergência.",
        emptyTitle: "Você ainda não cadastrou informações médicas",
        emptyDescription: "Inclua as informações de saúde e contatos de emergência no seu perfil.",
        action: <Button className="w-full"><Plus size={16} />Incluir informações</Button>,
    },
} satisfies Meta<typeof ProfileTabEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PerfilMedicoVazio: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("heading", { name: "Meu perfil de saúde" })).toBeVisible();
        await expect(canvas.getByText("Você ainda não cadastrou informações médicas")).toBeVisible();
        await expect(canvas.getByRole("button", { name: "Incluir informações" })).toBeVisible();
    },
};
