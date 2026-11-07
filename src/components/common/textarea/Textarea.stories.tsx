import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "Componentes/Textarea",
  component: Textarea,
  tags: ["!autodocs"],
  args: { label: "Observações", name: "notes", placeholder: "Descreva os detalhes" },
  decorators: [(Story) => <div className="w-full max-w-md p-4"><Story /></div>],
} satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {};
export const ComErroEAjuda: Story = {
  args: { id: "notes", "aria-describedby": "notes-help", error: "Descreva o motivo." },
  render: (args) => <div><p id="notes-help">Não inclua dados sensíveis.</p><Textarea {...args} /></div>,
};
export const Desabilitado: Story = { args: { disabled: true } };
export const SomenteLeitura: Story = { args: { readOnly: true, value: "Detalhes preservados." } };
