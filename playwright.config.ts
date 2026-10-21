import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    locale: "pt-BR",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [...[
    { browser: "chromium", device: "Desktop Chrome" },
    { browser: "firefox", device: "Desktop Firefox" },
    { browser: "webkit", device: "Desktop Safari" },
  ].flatMap(({ browser, device }) => [
    { name: "mobile", viewport: { width: 375, height: 812 } },
    { name: "tablet", viewport: { width: 768, height: 1024 } },
    { name: "desktop", viewport: { width: 1440, height: 900 } },
  ].map(({ name, viewport }) => ({
    name: `${browser}-${name}`,
    testIgnore: "**/*.a11y.spec.ts",
    use: { ...devices[device], viewport },
  }))), ...[
    { name: "desktop", viewport: { width: 1440, height: 900 } },
    { name: "mobile", viewport: { width: 375, height: 812 } },
  ].map(({ name, viewport }) => ({
    name: `a11y-chromium-${name}`,
    testMatch: "**/*.a11y.spec.ts",
    use: { ...devices["Desktop Chrome"], viewport },
  }))],
  webServer: [
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100/login",
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        API_URL: "http://127.0.0.1:1",
        API_FRONTEND_KEY: "playwright-local-only",
        ACCESS: "playwright-local-session-not-for-production",
        NODE_SECURE: "HTTP",
      },
    },
    {
      command: "npm run storybook -- --port 6106 --host 127.0.0.1 --ci --no-open",
      url: "http://127.0.0.1:6106/index.json",
      timeout: 180_000,
      reuseExistingServer: false,
    },
  ],
});
