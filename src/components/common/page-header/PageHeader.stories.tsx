import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "../button";
import { PageHeader } from "./index";

const meta = {
  title: "Componentes/PageHeader",
  component: PageHeader,
  tags: ["!autodocs"],
  argTypes: { actions: { control: false } },
  args: {
    title: "Gestão de usuários",
    breadcrumbs: [
      { label: "Início", href: "/feed" },
      { label: "Usuários" },
    ],
  },
  decorators: [
    (Story) => <div className="rounded-lg bg-j-gray-100 p-4"><Story /></div>,
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComAcao: Story = {
  render: (args) => <PageHeader {...args} actions={<Button>Criar usuário</Button>} />,
};
export const ConteudoLongo: Story = {
  args: { title: "Definições de cobrança e acompanhamento financeiro dos associados" },
};
