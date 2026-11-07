import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { z } from "zod";
import { Form } from "@/components/common/form";
import { Button } from "../button";
import { InputCheckbox } from "./input-checkbox";
import { InputRadioGroup } from "./input-radio-group";
import type { InputVariant } from "./input";

const options = [{ value: "email", label: "E-mail" }, { value: "phone", label: "Telefone" }];
const schema = z.object({ accepted: z.boolean(), contact: z.string() });

function Choices({ variant = "white" }: { variant?: InputVariant }) {
  const [result, setResult] = useState("");
  return (
    <Form schema={schema} formOptions={{ defaultValues: { accepted: false, contact: "email" } }}
      onSubmit={(values) => setResult(JSON.stringify(values))} onError={() => undefined}>
      <InputCheckbox name="accepted" label="Aceito receber avisos" variant={variant} />
      <fieldset className="w-full min-w-0">
        <legend className="mb-2 text-sm font-bold text-j-gray-700">Contato preferido</legend>
        <InputRadioGroup name="contact" options={options} variant={variant} />
      </fieldset>
      <Button type="submit">Confirmar preferências</Button>
      <output aria-label="Preferências confirmadas" className="max-w-full break-all text-sm text-j-gray-700">{result}</output>
    </Form>
  );
}

const meta = {
  title: "Componentes/Input/Checkbox e Radio",
  component: Choices,
  tags: ["!autodocs"],
  argTypes: { variant: { control: "radio", options: ["white", "gray"] } },
  decorators: [(Story) => <div className="w-full max-w-md p-4"><Story /></div>],
} satisfies Meta<typeof Choices>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Registrados: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("checkbox", { name: "Aceito receber avisos" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Telefone" }));
    await userEvent.click(canvas.getByRole("button", { name: "Confirmar preferências" }));
    await expect(canvas.getByRole("status", { name: "Preferências confirmadas" })).toHaveTextContent('"accepted":true,"contact":"phone"');
  },
};
export const Gray: Story = { args: { variant: "gray" } };

function IndependentRadio({ variant }: { variant?: InputVariant }) {
  const [value, setValue] = useState("email");
  return <fieldset><legend className="mb-2 font-bold text-j-gray-700">Contato preferido</legend>
    <InputRadioGroup register={false} name="contact" options={options} value={value} onChange={setValue} variant={variant} />
  </fieldset>;
}
export const RadioIsolado: Story = { render: (args) => <IndependentRadio {...args} /> };
