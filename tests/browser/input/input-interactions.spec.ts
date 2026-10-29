import { readLocalUrl } from "../../../config/local-urls.cjs";
import { expect, test } from "../fixtures";

const storybookUrl = readLocalUrl("PLAYWRIGHT_STORYBOOK_URL");
function storyUrl(id: string) {
  return new URL(`/iframe.html?id=${id}&viewMode=story&embed=true`, storybookUrl).href;
}

test("Input: aparência padrão, edição, foco e limite do viewport", async ({ page }) => {
  await page.goto(storyUrl("componentes-input-input--padrao"));
  const input = page.getByRole("textbox", { name: "Nome" });
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await input.fill("Nome completo com conteúdo longo para testar o campo em telas pequenas");
  await input.focus();
  await expect(input).toBeFocused();
  await expect(input).toHaveCSS("outline-style", "solid");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Input: gray explícito preserva fundo cinza e texto legível", async ({ page }) => {
  await page.goto(storyUrl("componentes-input-input--gray"));
  const input = page.getByRole("textbox", { name: "Nome" });
  await expect(input).toHaveCSS("background-color", "rgb(89, 89, 89)");
  await expect(input).toHaveCSS("color", "rgb(255, 255, 255)");
});

for (const field of [
  { id: "inputcpf", label: "CPF", value: "12345678909", expected: "123.456.789-09" },
  { id: "inputphonenumber", label: "Telefone", value: "12987654321", expected: "(12) 98765-4321" },
  { id: "inputemail", label: "E-mail", value: "ana@example.com", expected: "ana@example.com" },
  { id: "inputdate", label: "Data de nascimento", value: "2000-02-29", expected: "2000-02-29" },
]) {
  test(`Campos registrados: ${field.label}, máscara/valor e recuperação da validação`, async ({ page }) => {
    await page.goto(storyUrl(`componentes-input-${field.id}--padrao`));
    const input = page.getByLabel(field.label, { exact: true });
    await page.getByRole("button", { name: "Validar campo" }).click();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription("Preencha o campo.");
    await input.fill(field.value);
    await expect(input).toHaveValue(field.expected);
    await page.getByRole("button", { name: "Validar campo" }).click();
    await expect(input).toHaveAttribute("aria-invalid", "false");
  });
}

test("Senha: visibilidade por teclado preserva o valor", async ({ page }) => {
  await page.goto(storyUrl("componentes-input-inputpassword--padrao"));
  const input = page.getByLabel("Senha", { exact: true });
  await input.fill("Senha-1#");
  await input.press("Tab");
  const show = page.getByRole("button", { name: "Mostrar senha" });
  await expect(show).toBeFocused();
  await show.press("Space");
  await expect(input).toHaveAttribute("type", "text");
  await expect(input).toHaveValue("Senha-1#");
  await page.getByRole("button", { name: "Ocultar senha" }).press("Space");
  await expect(input).toHaveAttribute("type", "password");
});

for (const presentation of ["avatar", "compacta"]) {
  test(`Imagem ${presentation}: cancelar, recortar e remover uma foto`, async ({ page }) => {
    await page.goto(storyUrl(`componentes-input-inputfile-imagens--${presentation}`));
    const bytes = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 80;
      canvas.height = 80;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas indisponível");
      context.fillStyle = "#061e50";
      context.fillRect(0, 0, 80, 80);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG indisponível")), "image/png"));
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    });
    const file = { name: "foto.png", mimeType: "image/png", buffer: Buffer.from(bytes) };
    const input = page.locator('input[type="file"]');
    await input.setInputFiles(file);
    const dialog = page.getByRole("dialog", { name: "Ajustar foto" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(page.getByAltText("Visualização do arquivo: foto.png")).toBeHidden();
    await input.setInputFiles(file);
    await expect(dialog.getByRole("button", { name: "Usar foto" })).toBeEnabled();
    await dialog.getByRole("button", { name: "Usar foto" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByAltText("Visualização do arquivo: foto.png")).toBeVisible();
    await page.getByRole("button", { name: "Remover imagem foto.png", exact: true }).click();
    await expect(page.getByAltText("Visualização do arquivo: foto.png")).toBeHidden();
    await expect(page.getByRole("button", { name: "Foto de perfil", exact: true })).toBeVisible();
  });
}

test("Senha e data desabilitadas: ações auxiliares indisponíveis", async ({ page }) => {
  await page.goto(storyUrl("componentes-input-inputpassword--desabilitado"));
  await expect(page.getByLabel("Senha", { exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Mostrar senha" })).toBeHidden();
  await page.goto(storyUrl("componentes-input-inputdate--desabilitado"));
  await expect(page.getByLabel("Data de nascimento", { exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Abrir calendário/ })).toBeHidden();
});

test("Escolhas: checkbox e radio enviam valores RHF e respondem ao teclado", async ({ page }) => {
  await page.goto(storyUrl("componentes-input-checkbox-e-radio--registrados"));
  const checkbox = page.getByRole("checkbox", { name: "Aceito receber avisos" });
  await checkbox.focus();
  await checkbox.press("Space");
  await expect(checkbox).toBeChecked();
  const radio = page.getByRole("radio", { name: "E-mail" });
  await radio.focus();
  await radio.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Telefone" })).toBeChecked();
  await page.getByRole("button", { name: "Confirmar preferências" }).click();
  await expect(page.getByRole("status", { name: "Preferências confirmadas" })).toHaveText('{"accepted":true,"contact":"phone"}');
});

test("Busca: campo branco com limpeza e envio por Enter", async ({ page }) => {
  await page.goto(storyUrl("componentes-input-inputsearch--ao-confirmar"));
  const input = page.getByRole("searchbox", { name: "Buscar associados" });
  await expect(input).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await input.fill("Ana");
  await input.press("Enter");
  await expect(input).toHaveValue("Ana");
  await page.getByRole("button", { name: "Limpar busca" }).click();
  await expect(input).toHaveValue("");
  await expect(page.getByRole("button", { name: "Limpar busca" })).toBeHidden();
});

test("Arquivo: seleção, rejeição e remoção preservam feedback na superfície branca", async ({ page }) => {
  await page.goto(storyUrl("componentes-input-inputfile--rejeicoes"));
  const input = page.locator('input[type="file"]');
  const dropzone = page.getByRole("button", { name: "Anexos", exact: true });
  await expect(dropzone).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await dropzone.focus();
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), dropzone.press("Enter")]);
  await chooser.setFiles({ name: "comprovante.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF exemplo") });
  await expect(page.getByText("comprovante.pdf")).toBeVisible();
  await input.setInputFiles({ name: "invalido.txt", mimeType: "text/plain", buffer: Buffer.from("exemplo") });
  await expect(page.getByText("Formato de arquivo não suportado.")).toBeVisible();
  await expect(page.getByText("comprovante.pdf")).toBeVisible();
  await page.getByRole("button", { name: "Remover arquivo" }).click();
  await expect(page.getByText("Nenhum arquivo enviado.")).toBeVisible();
});
