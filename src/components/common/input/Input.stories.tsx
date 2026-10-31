import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Search } from "lucide-react";
import { Input } from "./index";

const meta = {
  title: "Componentes/Input/Input",
  component: Input,
  tags: ["!autodocs"],
  argTypes: {
    variant: { control: "radio", options: ["white", "gray"], description: "Compatibilidade de superfície; o tema é escolhido na toolbar.", table: { category: "Compatibilidade" } },
    register: { control: false, table: { disable: true } },
    children: {
      control: false,
    },
  },
  args: {
    register: false,
    label: "Nome",
    name: "name",
    placeholder: "Informe o nome",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: { description: { component: "Modo register=false, sem React Hook Form. A aparência padrão acompanha data-theme; variantes antigas continuam compatíveis." } },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComIcone: Story = {
  args: {
    label: "Buscar",
    name: "search",
    placeholder: "Buscar...",
    className: "pl-10",
  },
  render: (args) => (
    <Input {...args}>
      <Search
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute left-3 text-j-gray-500"
      />
    </Input>
  ),
};
export const ComErro: Story = {
  args: { required: true, error: "Informe o nome." },
};
export const Desabilitado: Story = { args: { disabled: true } };
export const Gray: Story = { args: { variant: "gray" } };
export const SomenteLeitura: Story = {
  args: { value: "Anuidade de associados", readOnly: true },
};

export const IdEAjuda: Story = {
  args: { id: "member-name", "aria-describedby": "member-name-help", error: "Informe o nome." },
  render: (args) => <div><p id="member-name-help">Use o nome completo.</p><Input {...args} /></div>,
};
