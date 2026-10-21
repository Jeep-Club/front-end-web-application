import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Search } from "lucide-react";
import { Input } from "./index";

const meta = {
  title: "Componentes/Input",
  component: Input,
  argTypes: {
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
      <div className="max-w-md rounded-lg bg-j-blue-950 p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: { description: { component: "Modo register=false, sem React Hook Form. A superfície escura acompanha os estilos padrão do campo." } },
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
        className="pointer-events-none absolute left-3 text-j-transparent-white"
      />
    </Input>
  ),
};
export const ComErro: Story = {
  args: { required: true, error: "Informe o nome." },
};
export const Desabilitado: Story = { args: { disabled: true } };
export const SomenteLeitura: Story = {
  args: { value: "Anuidade de associados", readOnly: true },
};
