import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Controls, Description, Primary, Stories, Title } from "@storybook/addon-docs/blocks";
import { expect, waitFor, within } from "storybook/test";
import { z } from "zod";
import { Form } from "@/components/common/form";
import { InputFile } from "./index";

const meta = {
  title: "Componentes/Input/InputFile/Imagens",
  component: InputFile.Image,
  args: { name: "attachments", label: "Foto de perfil", maxFiles: 1, cropShape: "circle", isFallback: true },
  argTypes: {
    name: { control: false, type: { name: "string", required: true }, table: { type: { summary: "string" }, defaultValue: { summary: "—" } } },
    label: { control: "text", type: "string", table: { type: { summary: "string" }, defaultValue: { summary: "undefined" } } },
    cropShape: { control: "select", options: ["circle", "square", "landscape"], table: { type: { summary: '"circle" | "square" | "landscape"' }, defaultValue: { summary: '"square"' } } },
    maxFiles: { control: { type: "number", min: 0, step: 1 }, type: "number", table: { type: { summary: "number" }, defaultValue: { summary: "0" } } },
    maxSizeMB: { control: { type: "number", min: 0.001 }, type: "number", table: { type: { summary: "number" }, defaultValue: { summary: "5" } } },
    multiple: { control: "boolean", type: "boolean", table: { type: { summary: "boolean" }, defaultValue: { summary: "maxFiles > 1 (quando omitido)" } } },
    required: { control: "boolean", type: "boolean", table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } } },
    isFallback: { control: "boolean", type: "boolean", description: "Não disponível em Image2.", table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } } },
    className: { control: "text", type: "string", table: { type: { summary: "string" }, defaultValue: { summary: "undefined" } } },
  },
  parameters: {
    docs: {
      description: { component: "InputFile.Image aceita JPEG, PNG e WebP e abre o recorte antes de guardar File[] no formulário. Avatar usa circle; fotos de veículos usam landscape. Form/RHF, recorte em dialog/canvas e previews locais são reais; não há upload HTTP. A apresentação Image2 usa miniaturas compactas e não aceita isFallback. Consulte o [guia de InputFile](?path=/docs/componentes-input-inputfile--docs) para composição e limites." },
      page: () => (
        <>
          <Title /><Description /><Primary />
          <div role="region" aria-label="Propriedades das imagens" tabIndex={0} style={{ maxWidth: "100%", overflowX: "auto" }}><Controls /></div>
          <Stories />
        </>
      ),
    },
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
} satisfies Meta<typeof InputFile.Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Avatar: Story = {
  play: async ({ canvasElement, userEvent }) => {
    const input = canvasElement.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("Input de imagem ausente.");
    const source = document.createElement("canvas");
    source.width = 80;
    source.height = 80;
    const context = source.getContext("2d");
    if (!context) throw new Error("Canvas indisponível.");
    context.fillStyle = "#061e50";
    context.fillRect(0, 0, 80, 80);
    const blob = await new Promise<Blob>((resolve, reject) => source.toBlob((value) => value ? resolve(value) : reject(new Error("PNG indisponível.")), "image/png"));
    await userEvent.upload(input, new File([blob], "avatar.png", { type: "image/png" }));
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: "Ajustar foto" });
    await waitFor(() => expect(within(dialog).getByRole("button", { name: "Usar foto" })).toBeEnabled());
    await userEvent.click(within(dialog).getByRole("button", { name: "Usar foto" }));
    await waitFor(() => expect(body.queryByRole("dialog", { name: "Ajustar foto" })).not.toBeInTheDocument());
    await expect(await body.findByAltText("Visualização do arquivo: avatar.png")).toBeVisible();
  },
};

export const Veiculo: Story = {
  args: { label: "Foto do veículo", cropShape: "landscape", maxFiles: 3 },
};

export const Compacta: Story = {
  args: { cropShape: "square", isFallback: undefined },
  parameters: { controls: { exclude: ["isFallback"] }, docs: { description: { story: "Renderiza InputFile.Image2. Em modo único, a área de seleção desaparece após o recorte; remover a miniatura permite selecionar novamente." } } },
  render: (args) => <InputFile.Image2 name={args.name} label={args.label} required={args.required} multiple={args.multiple} maxFiles={args.maxFiles} maxSizeMB={args.maxSizeMB} cropShape={args.cropShape} className={args.className} />,
};
