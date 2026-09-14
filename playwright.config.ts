import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env.E2E_BASE_URL ??
  'https://hrproprototype.netlify.app';

const environment =
  process.env.E2E_ENV ??
  'staging';

console.log(`\nHR PRO E2E Environment: ${environment}`);
console.log(`HR PRO E2E URL: ${baseURL}\n`);

export default defineConfig({
  testDir: './tests',

  timeout: 45_000,

  expect: {
    timeout: 10_000,
  },

  fullyParallel: false,
  workers: 1,

  retries: 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL,

    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    viewport: {
      width: 1440,
      height: 900,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});