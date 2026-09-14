import { test, expect } from '@playwright/test';

test.describe('HR PRO Browser Storage Isolation', () => {
  test('INFRA-001 | Test can write browser-local data', async ({ page }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
    });

    await page.evaluate(() => {
      localStorage.setItem(
        '__HR_PRO_PLAYWRIGHT_ISOLATION_TEST__',
        'created-by-first-test'
      );
    });

    const value = await page.evaluate(() => {
      return localStorage.getItem(
        '__HR_PRO_PLAYWRIGHT_ISOLATION_TEST__'
      );
    });

    expect(value).toBe('created-by-first-test');
  });

  test('INFRA-002 | Next test receives clean browser storage', async ({
    page,
  }) => {
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
    });

    const value = await page.evaluate(() => {
      return localStorage.getItem(
        '__HR_PRO_PLAYWRIGHT_ISOLATION_TEST__'
      );
    });

    expect(value).toBeNull();
  });
});