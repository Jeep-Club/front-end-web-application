import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Componentes/Button",
  component: Button,
  tags: ["!autodocs"],
  argTypes: {
    children: { control: "text" },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    tabIndex: { control: "number" },
  },
  args: {
    children: "Salvar alterações",
    type: "button",
    tabIndex: 0,
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Salvar alterações" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const Desabilitado: Story = { args: { disabled: true } };
export const TextoLongo: Story = {
  args: { children: "Salvar alterações da definição de cobrança" },
};
