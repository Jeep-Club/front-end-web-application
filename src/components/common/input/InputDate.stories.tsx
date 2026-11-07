import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { z } from "zod";
import { Form } from "@/components/common/form";
import { InputDate } from "./input-date";

const meta = {
  title: "Componentes/Input/InputDate",
  component: InputDate,
  tags: ["!autodocs"],
  args: { name: "birthDate", label: "Data de nascimento" },
  argTypes: {
    variant: { control: "radio", options: ["white", "gray"] },
    disabled: { control: "boolean" },
    
  },
  decorators: [(Story) => (
    <div className="w-full max-w-md p-4">
      <Form
        schema={z.object({ birthDate: z.string().min(1, "Preencha o campo.") })}
        formOptions={{ defaultValues: { birthDate: "" } }}
        onSubmit={() => undefined}
        onError={() => undefined}
      ><Story /><button type="submit" className="cursor-pointer rounded-md bg-j-blue-800 px-3 py-2 text-sm text-j-white">Validar campo</button></Form>
    </div>
  )],
} satisfies Meta<typeof InputDate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvas }) => {
      const input = canvas.getByLabelText("Data de nascimento", { exact: true });
      await expect(input).toHaveAttribute("type", "date");
  },
};
export const Gray: Story = { args: { variant: "gray" } };
export const Desabilitado: Story = { args: { disabled: true } };

