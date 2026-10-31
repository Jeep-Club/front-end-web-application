import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { z } from "zod";
import { Form } from "@/components/common/form";
import { InputPassword } from "./input-password";

const meta = {
  title: "Componentes/Input/InputPassword",
  component: InputPassword,
  tags: ["!autodocs"],
  args: { name: "password", label: "Senha" },
  argTypes: {
    variant: { control: "radio", options: ["white", "gray"] },
    disabled: { control: "boolean" },
    stepErrors: { control: "boolean" }, notSeePassword: { control: "boolean" },
  },
  decorators: [(Story) => (
    <div className="w-full max-w-md p-4">
      <Form
        schema={z.object({ password: z.string().min(1, "Preencha o campo.") })}
        formOptions={{ defaultValues: { password: "" } }}
        onSubmit={() => undefined}
        onError={() => undefined}
      ><Story /><button type="submit" className="cursor-pointer rounded-md bg-j-blue-800 px-3 py-2 text-sm text-j-white">Validar campo</button></Form>
    </div>
  )],
} satisfies Meta<typeof InputPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvas, userEvent }) => {
      const input = canvas.getByLabelText("Senha");
      await userEvent.type(input, "Senha-1#");
      await userEvent.click(canvas.getByRole("button", { name: "Mostrar senha" }));
      await expect(input).toHaveAttribute("type", "text");
      await userEvent.click(canvas.getByRole("button", { name: "Ocultar senha" }));
      await expect(input).toHaveAttribute("type", "password");
  },
};
export const Gray: Story = { args: { variant: "gray" } };
export const Desabilitado: Story = { args: { disabled: true } };

export const ComRequisitos: Story = { args: { stepErrors: true } };
export const SemVisibilidade: Story = { args: { notSeePassword: true } };

