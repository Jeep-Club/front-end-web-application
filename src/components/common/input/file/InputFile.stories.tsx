import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent as userEventTools, waitFor } from "storybook/test";
import { z } from "zod";
import { Form } from "@/components/common/form";
import { InputFile } from "./index";

const meta = {
  title: "Componentes/Input/InputFile",
  component: InputFile,
  tags: ["!autodocs"],
  args: { name: "attachments", label: "Anexos", isFallback: true },
  argTypes: {
    name: { control: false },
    label: { control: "text" },
    required: { control: "boolean" },
    multiple: { control: "boolean" },
    maxFiles: { control: { type: "number", min: 0, step: 1 } },
    maxSizeMB: { control: { type: "number", min: 0.001 } },
    accept: { control: false, description: "Mapa MIME/extensões do react-dropzone; configurado por cenário." },
    cropShape: { control: false, description: "Sem efeito no InputFile base; usado pelas apresentações de imagem." },
    className: { control: false },
    isFallback: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl rounded-lg bg-j-blue-950 p-4">
        <Form
          schema={z.object({ attachments: z.array(z.instanceof(File)).optional() })}
          formOptions={{ defaultValues: { attachments: [] } }}
          onSubmit={() => undefined}
          onError={() => undefined}
        ><Story /></Form>
      </div>
    ),
  ],
} satisfies Meta<typeof InputFile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = {};

export const SelecionarERemover: Story = {
  args: { accept: { "application/pdf": [".pdf"] } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvasElement.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("Input de arquivo ausente.");
    await userEvent.upload(input, new File(["Documento de exemplo"], "comprovante.pdf", { type: "application/pdf" }));
    await expect(await canvas.findByText("comprovante.pdf")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Remover arquivo" }));
    await waitFor(() => expect(canvas.queryByText("comprovante.pdf")).not.toBeInTheDocument());
    await expect(canvas.getByText("Nenhum arquivo enviado.")).toBeVisible();
  },
};

export const Multiplos: Story = {
  args: { multiple: true, maxFiles: 2 },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvasElement.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("Input de arquivo ausente.");
    const files = ["documento.pdf", "recibo.pdf"].map((name) => new File(["Exemplo"], name, { type: "application/pdf" }));
    await userEvent.upload(input, files);
    await expect(await canvas.findByText("recibo.pdf")).toBeVisible();
    await expect(canvas.getAllByRole("button", { name: "Remover arquivo" })).toHaveLength(2);
    await userEvent.upload(input, new File(["Outro"], "extra.pdf", { type: "application/pdf" }));
    await expect(await canvas.findByText("Máximo de 2 arquivo(s) permitido.")).toBeVisible();
    await expect(canvas.queryByText("extra.pdf")).not.toBeInTheDocument();
  },
};

export const Rejeicoes: Story = {
  args: { accept: { "application/pdf": [".pdf"] }, maxSizeMB: 0.001 },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvasElement.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("Input de arquivo ausente.");
    await userEventTools.setup({ applyAccept: false }).upload(input, new File(["Texto"], "invalido.txt", { type: "text/plain" }));
    await expect(await canvas.findByText("Formato de arquivo não suportado.")).toBeVisible();
    await userEvent.upload(input, new File([new Uint8Array(2048)], "grande.pdf", { type: "application/pdf" }));
    await expect(await canvas.findByText("O arquivo excedeu o limite de 0.001MB.")).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Remover arquivo" })).not.toBeInTheDocument();
  },
};
