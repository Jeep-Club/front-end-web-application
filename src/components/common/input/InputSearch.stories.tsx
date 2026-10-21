import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, waitFor } from "storybook/test";
import { InputSearch } from "./input-search";

const meta = {
  title: "Componentes/Input/InputSearch",
  component: InputSearch,
  tags: ["!autodocs"],
  args: {
    value: "",
    label: "Buscar associados",
    placeholder: "Nome do associado",
    onSubmit: fn(),
  },
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
    placeholder: { control: "text" },
    submitOnChange: { control: "boolean" },
    isLoading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  parameters: {
    controls: { include: ["value", "label", "placeholder", "submitOnChange", "isLoading", "disabled"] },
  },
  decorators: [
    (Story) => <div className="max-w-md rounded-lg bg-j-blue-950 p-4"><Story /></div>,
  ],
} satisfies Meta<typeof InputSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole("searchbox", { name: "Buscar associados" });
    await userEvent.type(input, "Ana");
    await waitFor(() => expect(args.onSubmit).toHaveBeenLastCalledWith("Ana"));
    await userEvent.click(canvas.getByRole("button", { name: "Limpar busca" }));
    await expect(input).toHaveValue("");
    await waitFor(() => expect(args.onSubmit).toHaveBeenLastCalledWith(""));
  },
};

export const Carregando: Story = {
  args: { value: "Ana", isLoading: true },
};

export const AoConfirmar: Story = {
  args: { submitOnChange: false },
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole("searchbox", { name: "Buscar associados" });
    await userEvent.type(input, "Ana");
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(args.onSubmit).toHaveBeenLastCalledWith("Ana"));
  },
};
