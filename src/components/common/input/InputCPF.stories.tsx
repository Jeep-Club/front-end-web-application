import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { z } from "zod";
import { Form } from "@/components/common/form";
import { InputCPF } from "./input-cpf";

const meta = {
  title: "Componentes/Input/InputCPF",
  component: InputCPF,
  tags: ["!autodocs"],
  args: { name: "cpf", label: "CPF" },
  argTypes: {
    variant: { control: "radio", options: ["white", "gray"] },
    disabled: { control: "boolean" },
    
  },
  decorators: [(Story) => (
    <div className="w-full max-w-md p-4">
      <Form
        schema={z.object({ cpf: z.string().min(1, "Preencha o campo.") })}
        formOptions={{ defaultValues: { cpf: "" } }}
        onSubmit={() => undefined}
        onError={() => undefined}
      ><Story /><button type="submit" className="cursor-pointer rounded-md bg-j-blue-800 px-3 py-2 text-sm text-j-white">Validar campo</button></Form>
    </div>
  )],
} satisfies Meta<typeof InputCPF>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvas, userEvent }) => {
      await userEvent.type(canvas.getByRole("textbox", { name: "CPF" }), "12345678909");
      await expect(canvas.getByRole("textbox", { name: "CPF" })).toHaveValue("123.456.789-09");
  },
};
export const Gray: Story = { args: { variant: "gray" } };
export const Desabilitado: Story = { args: { disabled: true } };

