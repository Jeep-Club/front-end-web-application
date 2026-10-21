import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import type { Page, TestInfo } from "@playwright/test";
import { expect } from "./fixtures";

export async function auditAccessibility(page: Page, testInfo: TestInfo, state: string) {
  await page.evaluate(async () => {
    await document.fonts.ready;
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
  // Keep scanning other states while preserving every violation as a test failure.
  expect.soft(results.violations, `${state}: ${JSON.stringify(summary, null, 2)}`).toEqual([]);
}
