import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { Select } from "./select";

const OPTIONS = [
    { value: "trilhas", label: "Trilhas" },
    { value: "eventos", label: "Eventos" },
    { value: "passeios", label: "Passeios familiares" },
    { value: "oficinas", label: "Oficinas mecânicas" },
];

const meta = {
    title: "Componentes/Select",
    component: Select,
    tags: ["autodocs"],
    args: {
        label: "Categoria",
        name: "category",
        labelClassName: "text-j-gray-700",
        options: OPTIONS,
        onChange: fn(),
    },
    argTypes: {
        multiple: { control: "boolean" },
        searchable: { control: "boolean" },
        variant: { control: "radio", options: ["white", "gray"] },
        required: { control: "boolean" },
        disabled: { control: "boolean" },
        maxWidth: { control: "text" },
        maxHeight: { control: "text" },
        error: { control: "text" },
        options: { control: "object" },
    },
    parameters: {
        controls: { include: ["label", "options", "multiple", "searchable", "variant", "required", "disabled", "maxWidth", "maxHeight", "error"] },
    },
    decorators: [
        (Story) => <div className="w-full max-w-md p-4"><Story /></div>,
    ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        await userEvent.click(canvas.getByRole("combobox", { name: "Categoria" }));
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(body.getByRole("option", { name: "Trilhas" }));
        await expect(canvas.getByRole("combobox", { name: "Categoria" })).toContain("Trilhas");
        await expect(args.onChange).toHaveBeenCalled();
    },
};

export const MultiplasComBusca: Story = {
    args: { multiple: true, searchable: true },
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        await userEvent.click(canvas.getByRole("combobox", { name: "Categoria" }));
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(body.getByRole("searchbox", { name: "Pesquisar Categoria" }), "passeio");
        const option = body.getByRole("option", { name: "Passeios familiares" });
        await expect(option).toBeVisible();
        await userEvent.click(option);
        await expect(option).toHaveAttribute("aria-selected", "true");
        await expect(args.onChange).toHaveBeenCalled();
    },
};

export const SemResultados: Story = {
    args: { searchable: true },
    play: async ({ canvas, canvasElement, userEvent }) => {
        await userEvent.click(canvas.getByRole("combobox", { name: "Categoria" }));
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(body.getByRole("searchbox", { name: "Pesquisar Categoria" }), "inexistente");
        await expect(body.getByRole("status")).toHaveTextContent("Nenhuma opção encontrada.");
    },
};

export const ComErro: Story = {
    args: { error: "Escolha uma categoria." },
};

export const Desabilitado: Story = {
    args: { disabled: true },
};

export const White: Story = {
    args: { variant: "white", defaultValue: "eventos" },
};

export const Gray: Story = {
    args: { variant: "gray" },
};
