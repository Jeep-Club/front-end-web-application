import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { UserMembershipNumberModal } from "./UserMembershipNumberModal";

const user: AdminUser = {
    id: 42,
    name: "Marina da Silva",
    birthDate: null,
    cpf: "12345678909",
    email: "marina@example.test",
    membershipNumber: "27",
    rg: null,
    phoneNumber: null,
    status: "ACTIVE",
    createdAt: "2025-01-10T12:00:00Z",
    disabledAt: null,
    updatedAt: null,
};

const registration: AdminMemberRegistration = {
    id: 18,
    identityUserId: user.id,
    membershipNumber: "27",
    createdAt: "2025-01-10T12:00:00Z",
    updatedAt: "2025-01-10T12:00:00Z",
    version: 3,
};

const meta = {
    title: "Páginas/Gestão administrativa/Usuários/Matrícula",
    component: UserMembershipNumberModal,
    parameters: { layout: "centered" },
    argTypes: {
        user: { control: false },
        onLoad: { control: false },
        onSave: { control: false },
        onSuccess: { control: false },
    },
} satisfies Meta<typeof UserMembershipNumberModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RetificarMatricula: Story = {
    args: {
        user,
        onLoad: fn(async () => registration),
        onSave: fn(async (input) => ({ ...registration, membershipNumber: input.membershipNumber })),
        onSuccess: fn(),
    },
};

export const AtribuirMatricula: Story = {
    args: {
        user: { ...user, membershipNumber: null },
        onLoad: fn(async () => null),
        onSave: fn(async () => registration),
        onSuccess: fn(),
    },
};
