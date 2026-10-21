import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent as userEventTools, waitFor } from "storybook/test";
import { z } from "zod";
import type { Accept } from "react-dropzone";
import { Form } from "@/components/common/form";
import { InputFile } from "./index";
import type { InputFileProps } from "./input-file";

const acceptPresets = {
  images: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
  pdf: { "application/pdf": [".pdf"] },
  xml: { "application/xml": [".xml"], "text/xml": [".xml"] },
  csv: { "text/csv": [".csv"] },
  all: undefined,
} satisfies Record<string, Accept | undefined>;

type StoryArgs = InputFileProps & { acceptPreset: keyof typeof acceptPresets | InputFileProps["accept"] };

const meta = {
  title: "Componentes/Input/InputFile",
  component: InputFile,
  tags: ["!autodocs"],
  args: { name: "attachments", label: "Anexos", isFallback: false, acceptPreset: "all" },
  render: ({ acceptPreset, ...args }) => (
    <InputFile {...args} accept={typeof acceptPreset === "string" ? acceptPresets[acceptPreset] : acceptPreset} />
  ),
  argTypes: {
    name: { control: false, type: { name: "string", required: true }, table: { type: { summary: "string" }, defaultValue: { summary: "—" } } },
    label: { control: "text", type: "string", table: { type: { summary: "string" }, defaultValue: { summary: "undefined" } } },
    required: { control: "boolean", type: "boolean", table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } } },
    multiple: { control: "boolean", type: "boolean", table: { type: { summary: "boolean" }, defaultValue: { summary: "maxFiles > 1 (quando omitido)" } } },
    maxFiles: { control: { type: "number", min: 0, step: 1 }, type: "number", table: { type: { summary: "number" }, defaultValue: { summary: "0" } } },
    maxSizeMB: { control: { type: "number", min: 0.001 }, type: "number", table: { type: { summary: "number" }, defaultValue: { summary: "5" } } },
    accept: { table: { disable: true } },
    acceptPreset: {
      name: "accept",
      control: { type: "select", labels: { images: "Imagens (JPEG, PNG, WebP)", pdf: "Somente PDF", xml: "XML", csv: "CSV", all: "Sem restrição de formato" } },
      options: Object.keys(acceptPresets),
      mapping: acceptPresets,
      description: "Preset da story convertido por mapping no objeto Accept real. Não é uma nova prop de produção.",
      table: { type: { summary: "Record<string, string[]> | undefined" }, defaultValue: { summary: "undefined (sem restrição)" } },
    },
    cropShape: { control: false, description: "Sem efeito no InputFile base; usado pelas apresentações de imagem.", table: { type: { summary: '"circle" | "square" | "landscape"' }, defaultValue: { summary: "undefined" } } },
    className: { control: "text", type: "string", table: { type: { summary: "string" }, defaultValue: { summary: "undefined" } } },
    isFallback: { control: "boolean", type: "boolean", table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } } },
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
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vazio: Story = { args: { isFallback: true } };

export const SelecionarERemover: Story = {
  args: { acceptPreset: "pdf", isFallback: true },
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
  args: { acceptPreset: "pdf", maxSizeMB: 1, isFallback: true },
  parameters: { docs: { description: { story: "Somente PDF, até 1 MiB. Selecione um PDF pequeno; arraste PNG, XML ou CSV para provocar rejeição de formato, ou um PDF maior que 1 MiB para a rejeição de tamanho. O teste usa o dropzone real." } } },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvasElement.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("Input de arquivo ausente.");
    await userEvent.upload(input, new File(["%PDF-1.4 Exemplo"], "valido.pdf", { type: "application/pdf" }));
    await expect(await canvas.findByText("valido.pdf")).toBeVisible();
    const uploader = userEventTools.setup({ applyAccept: false });
    for (const [name, type] of [["imagem.png", "image/png"], ["dados.xml", "application/xml"], ["dados.csv", "text/csv"]]) {
      await uploader.upload(input, new File(["Exemplo"], name, { type }));
      await expect(await canvas.findByText("Formato de arquivo não suportado.")).toBeVisible();
      await expect(canvas.queryByText(name)).not.toBeInTheDocument();
    }
    await userEvent.upload(input, new File([new Uint8Array(1024 * 1024 + 1)], "grande.pdf", { type: "application/pdf" }));
    await expect(await canvas.findByText("O arquivo excedeu o limite de 1MB.")).toBeVisible();
    await expect(canvas.getByText("valido.pdf")).toBeVisible();
  },
};
