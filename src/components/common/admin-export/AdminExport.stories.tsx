import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";
import { AdminExport } from "./AdminExport";

const meta = {
    title: "Componentes/AdminExport",
    component: AdminExport,
    tags: ["autodocs"],
    args: { onExport: fn(async () => undefined) },
    argTypes: {
        formats: { control: "check", options: ["CSV", "PDF"] },
        onExport: { control: false },
    },
} satisfies Meta<typeof AdminExport>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        await userEvent.click(canvas.getByRole("button", { name: /^Exportar$/ }));
        const page = within(canvasElement.ownerDocument.body);
        await userEvent.click(await page.findByRole("menuitem", { name: "Planilha CSV" }));
        await expect(args.onExport).toHaveBeenCalledWith("CSV");
        await expect(await canvas.findByRole("status")).toHaveTextContent("download iniciado");
    },
};

export const PDF: Story = {
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        await userEvent.click(canvas.getByRole("button", { name: /^Exportar$/ }));
        const page = within(canvasElement.ownerDocument.body);
        await userEvent.click(await page.findByRole("menuitem", { name: /^PDF$/ }));
        await expect(args.onExport).toHaveBeenCalledWith("PDF");
        await expect(await canvas.findByRole("status")).toHaveTextContent("Arquivo PDF gerado");
    },
};

export const SomenteCSV: Story = { args: { formats: ["CSV"] } };
export const Indisponivel: Story = { args: { disabled: true } };


export const LarguraEstreita: Story = {
    args: { label: "Exportar relatório de usuários", className: "max-w-[320px]" },
};
