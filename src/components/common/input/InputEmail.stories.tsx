import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { z } from "zod";
import { Form } from "@/components/common/form";
import { InputEmail } from "./input-email";

const meta = {
  title: "Componentes/Input/InputEmail",
  component: InputEmail,
  tags: ["!autodocs"],
  args: { name: "email", label: "E-mail" },
  argTypes: {
    variant: { control: "radio", options: ["white", "gray"] },
    disabled: { control: "boolean" },
    
  },
  decorators: [(Story) => (
    <div className="w-full max-w-md p-4">
      <Form
        schema={z.object({ email: z.string().min(1, "Preencha o campo.") })}
        formOptions={{ defaultValues: { email: "" } }}
        onSubmit={() => undefined}
        onError={() => undefined}
      ><Story /><button type="submit" className="cursor-pointer rounded-md bg-j-blue-800 px-3 py-2 text-sm text-j-white">Validar campo</button></Form>
    </div>
  )],
} satisfies Meta<typeof InputEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvas, userEvent }) => {
      await userEvent.type(canvas.getByRole("textbox", { name: "E-mail" }), "ana@example.com");
      await expect(canvas.getByRole("textbox", { name: "E-mail" })).toHaveValue("ana@example.com");
  },
};
export const Gray: Story = { args: { variant: "gray" } };
export const Desabilitado: Story = { args: { disabled: true } };

