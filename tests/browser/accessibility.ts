import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import type { Page, TestInfo } from "@playwright/test";
import { expect } from "./fixtures";

/**
 * Analisa um estado renderizado com as regras WCAG A/AA disponíveis até 2.2.
 * @param page Página já posicionada no estado que será avaliado, sem alterar a UI para ocultar problemas.
 * @param testInfo Contexto usado para gravar o JSON no diretório do cenário e anexá-lo ao relatório.
 * @param state Identificador distinto por estado, válido para compor o nome do arquivo e do anexo.
 * @returns Conclui a coleta; violações registradas por assertion soft ainda reprovam o teste.
 * @throws Propaga falhas do scanner, do navegador ou da gravação dos artefatos.
 */
export async function auditAccessibility(page: Page, testInfo: TestInfo, state: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Aguarda estilos finitos sem bloquear em spinners; cancelamentos encerram a espera da animação.
    await Promise.all(document.getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => undefined)));
  });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const path = testInfo.outputPath(`axe-${state}.json`);
  await writeFile(path, JSON.stringify(results, null, 2));
  await testInfo.attach(`axe-${state}`, {
    path,
    contentType: "application/json",
  });
  const summary = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.helpUrl,
    nodes: violation.nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
  }));
  // A assertion soft permite coletar os demais estados, mas preserva cada violação como falha.
  expect.soft(results.violations, `${state}: ${JSON.stringify(summary, null, 2)}`).toEqual([]);
}
