import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Users } from "lucide-react";
import AdminModuleCard from "./AdminModuleCard";

const meta = {
    title: "Páginas/Administração/Card de módulo",
    component: AdminModuleCard,
    args: {
        title: "Gestão de usuários",
        description: "Visualize, ative e desative usuários do sistema.",
        href: "/admin/usuarios",
        icon: Users,
        moduleKey: "users-story",
    },
} satisfies Meta<typeof AdminModuleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
