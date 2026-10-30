import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { DatePicker, type DatePickerSingleProps } from "./index";

function SingleDatePickerStory(props: DatePickerSingleProps) {
    const [value, setValue] = useState(props.value);
    return <DatePicker {...props} value={value} onChange={(next: DatePickerSingleProps["value"]) => { setValue(next); props.onChange(next); } } />;
}

const meta = {
    title: "Componentes/DatePicker/Data única",
    component: SingleDatePickerStory,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "Seleciona uma data civil por digitação dd/mm/aaaa ou calendário. O valor aplicado usa YYYY-MM-DD, ou YYYY-MM-DDTHH:mm[:ss] sem fuso quando um horário é adicionado. A conversão para timestamps pertence à camada consumidora.",
            },
        },
    },
    decorators: [(Story) => <div className="w-full max-w-lg p-4"><Story /></div>],
} satisfies Meta<typeof SingleDatePickerStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DataUnica: Story = {
    args: { mode: "single", label: "Data de publicação", value: null, onChange: fn() },
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        const page = within(canvasElement.ownerDocument.body);
        const input = canvas.getByLabelText("Data de publicação");
        await userEvent.type(input, "30102026");
        await expect(input).toHaveValue("30/10/2026");
        await userEvent.click(canvas.getByRole("button", { name: "Abrir calendário: Data de publicação" }));
        await userEvent.click(page.getByRole("button", { name: "Aplicar" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("2026-10-30"));
    },
};

export const Preenchida: Story = { args: { mode: "single", label: "Data", value: "2026-10-30", onChange: fn() } };
export const Desabilitada: Story = { args: { mode: "single", label: "Data", value: null, onChange: fn(), disabled: true } };
