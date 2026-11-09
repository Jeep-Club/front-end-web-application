import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AdminMemberReportExport } from "./AdminMemberReportExport";

const meta = {
    title: "Páginas/Gestão administrativa/Usuários/Exportação da ficha",
    component: AdminMemberReportExport,
    args: {
        user: {
            id: 42,
            name: "Marina da Silva",
            birthDate: "1990-05-10",
            cpf: "12345678909",
            email: "marina@example.test",
            membershipNumber: "27",
            rg: "123456789",
            phoneNumber: "12999999999",
            profilePhotoUrl: null,
            status: "ACTIVE",
            createdAt: "2025-01-10T12:00:00Z",
        },
    },
} satisfies Meta<typeof AdminMemberReportExport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
