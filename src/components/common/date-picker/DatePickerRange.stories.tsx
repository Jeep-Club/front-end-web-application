import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { DatePicker, type DatePickerRangeProps } from "./index";

function RangeDatePickerStory(props: DatePickerRangeProps) {
    const [value, setValue] = useState(props.value);
    return <DatePicker {...props} value={value} onChange={(next: DatePickerRangeProps["value"]) => { setValue(next); props.onChange(next); } } />;
}

const meta = {
    title: "Componentes/DatePicker/Intervalo",
    component: RangeDatePickerStory,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: "Seleciona limites civis independentes, permitindo início ou término aberto. Cada extremo pode ter seu próprio horário. Use YYYY-MM-DD ou YYYY-MM-DDTHH:mm[:ss] sem fuso; conversões para timestamps pertencem à camada consumidora.",
            },
        },
    },
    decorators: [(Story) => <div className="w-full max-w-lg p-4"><Story /></div>],
} satisfies Meta<typeof RangeDatePickerStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IntervaloAbertoComHorario: Story = {
    args: { mode: "range", label: "Período de publicação", value: { start: null, end: null }, onChange: fn() },
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        const page = within(canvasElement.ownerDocument.body);
        await userEvent.type(canvas.getByLabelText("Período de publicação — data inicial"), "15112026");
        await userEvent.click(canvas.getByRole("button", { name: "Abrir calendário: Período de publicação" }));
        await userEvent.click(page.getByRole("button", { name: "Adicionar horário" }));
        const time = page.getByLabelText("Horário data");
        await userEvent.clear(time);
        await userEvent.type(time, "14:30:00");
        await userEvent.click(page.getByRole("button", { name: "Aplicar" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ start: "2026-11-15T14:30:00", end: null }));
    },
};

export const TimestampsPreservados: Story = {
    args: {
        mode: "range",
        label: "Período de publicação",
        value: { start: "2026-11-15T14:30:00.123456789", end: "2026-11-16T18:45:30.25" },
        onChange: fn(),
    },
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        const page = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole("button", { name: "Abrir calendário: Período de publicação" }));
        await userEvent.click(page.getByRole("button", { name: "Aplicar" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({
            start: "2026-11-15T14:30:00.123456789",
            end: "2026-11-16T18:45:30.25",
        }));
    },
};

export const IntervaloVazio: Story = { args: { mode: "range", label: "Período", value: { start: null, end: null }, onChange: fn() } };
export const IntervaloPreenchido: Story = { args: { mode: "range", label: "Período", value: { start: "2026-10-01", end: "2026-10-31" }, onChange: fn() } };
