import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 4173);
const environment = process.env.PLAYWRIGHT_ENV ?? 'demo';
const environments = {
  demo: {
    baseURL: `http://127.0.0.1:${port}`,
    testDir: './tests',
    webServer: true,
  },
  saucedemo: {
    baseURL: 'https://www.saucedemo.com',
    testDir: './tests/saucedemo',
    webServer: false,
  },
};
const selectedEnvironment = environments[environment as keyof typeof environments];
if (!selectedEnvironment) {
  throw new Error(`Unknown PLAYWRIGHT_ENV "${environment}". Use "demo" or "saucedemo".`);
}
const baseURL = process.env.BASE_URL ?? selectedEnvironment.baseURL;
const isCI = process.env.CI === 'true' || process.env.CI === '1';
const applicationUrl = new URL(baseURL).origin;

export default defineConfig({
  testDir: selectedEnvironment.testDir,
  testIgnore: environment === 'demo' ? ['**/saucedemo/**'] : [],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        environmentInfo: {
          Browser: 'Chromium',
          TargetEnvironment: environment,
          ApplicationURL: applicationUrl,
          ...(process.env.GITHUB_ACTIONS ? { CI: 'GitHub Actions' } : {}),
        },
      },
    ],
  ],
  outputDir: 'test-results',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: selectedEnvironment.webServer && !process.env.BASE_URL
    ? {
        command: 'node examples/demo-app/server.mjs',
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 30_000,
      }
    : undefined,
});
