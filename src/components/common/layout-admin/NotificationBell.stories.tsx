import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import NotificationBell from "./NotificationBell";

const meta = {
    title: "Componentes/NotificationBell",
    component: NotificationBell,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component: "Sininho do header desktop. Clique para abrir o estado vazio das notificações e use ‘Ver todos’ para acessar a página completa.",
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="flex min-h-24 justify-end bg-j-blue-800 p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotificacoesVazias: Story = {};
