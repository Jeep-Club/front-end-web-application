import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, fn } from "storybook/test";
import { PaymentReceiptSubmission } from "./PaymentReceiptSubmission";

const meta = {
    title: "Páginas/Financeiro/Envio de comprovante",
    component: PaymentReceiptSubmission,
    args: {
        charge: { id: 42, finalAmount: 250, effectiveStatus: "PENDING" },
        submitAction: fn(async () => ({ id: 100, status: "PENDING_VALIDATION" })),
    },
    argTypes: { charge: { control: false }, submitAction: { control: false } },
    parameters: { docs: { description: { component: "Envio de comprovante próprio pela gestão de débitos, inclusive durante o bloqueio por membritude. Aceita PDF, JPEG, PNG ou WebP de até 10 MiB. O valor é o total da cobrança. O backend decide propriedade, prazo e duplicidade; enviar não confirma o pagamento. Nesta story a operação é simulada, sem cadastro na API ou envio à gestão." } } },
    decorators: [(Story) => {
        const [client] = useState(() => new QueryClient({ defaultOptions: { mutations: { retry: false } } }));
        return <QueryClientProvider client={client}><div className="max-w-2xl p-4"><Story /></div></QueryClientProvider>;
    }],
} satisfies Meta<typeof PaymentReceiptSubmission>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enviar: Story = {
    play: async ({ canvas, canvasElement, userEvent, args }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Enviar comprovante" }));
        const input = canvas.getByLabelText(/^Comprovante/);
        if (!(input instanceof canvasElement.ownerDocument.defaultView!.HTMLInputElement)) throw new Error("Campo de arquivo não encontrado");
        await userEvent.upload(input, new File(["%PDF-1.4\ncomprovante de teste"], "comprovante.pdf", { type: "application/pdf" }));
        await userEvent.click(canvas.getByRole("button", { name: "Enviar para análise" }));
        await expect(args.submitAction).toHaveBeenCalledWith(42, expect.any(FormData));
        await expect(await canvas.findByRole("status")).toHaveTextContent("Aguardando validação da gestão");
    },
};

export const Expirada: Story = { args: { charge: { id: 43, finalAmount: 250, effectiveStatus: "EXPIRED" } } };
export const Cancelada: Story = { args: { charge: { id: 44, finalAmount: 250, effectiveStatus: "CANCELED" } } };
export const ErroDeEnvio: Story = {
    args: { submitAction: fn(async () => { throw new Error("Não foi possível enviar. Tente novamente."); }) },
};
