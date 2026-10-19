import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Positive creation cases from the HR PRO Setup workbook.
 * These tests ONLY validate create + persistence, not duplicate/edit/remove.
 * They add unique QA-only records in an isolated Playwright browser context.
 */
test.describe('HR PRO Setup — Holidays, Leave Types, and Allowances', () => {
  async function openSetupTab(page: Page, tab: 'Holidays' | 'Leave') {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: tab, exact: true }).first().click();
  }

  async function openAllowances(page: Page) {
    await page.goto('/payroll-value', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Structures', exact: true }).click();
    await page.getByRole('button', { name: 'Allowances', exact: true }).click();
  }

  test('SET-HOLIDAY-001 | SET_214–218 | Holiday can be added and survives reload', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openSetupTab(page, 'Holidays');

    const name = `QA Holiday ${Date.now().toString(36)}`;
    // A future non-production test date which changes between runs.
    const dayOffset = Math.floor(Date.now() / 1000) % 700;
    const date = new Date(Date.UTC(2028, 0, 1) + dayOffset * 86_400_000)
      .toISOString().slice(0, 10);

    await page.getByRole('button', { name: '+ Add Holiday', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add Holiday' })).toBeVisible();
    await page.getByLabel('Date*', { exact: true }).fill(date);
    await page.getByLabel('Holiday name*', { exact: true }).fill(name);

    const type = page.getByLabel('Type', { exact: true });
    await expect(type).toBeVisible();
    expect(await type.locator('option').count(), 'A holiday type should be selectable').toBeGreaterThan(1);
    await type.selectOption({ index: 1 });

    const location = page.getByLabel('Work Location', { exact: true });
    await expect(location).toBeVisible();
    // Location is optional; select a concrete one when the test fixture provides it.
    if (await location.locator('option').count() > 1) {
      await location.selectOption({ index: 1 });
    }

    await page.getByRole('button', { name: 'Add Holiday', exact: true }).click();
    await expect(page.getByText(name, { exact: false })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await openSetupTab(page, 'Holidays');
    await expect(page.getByText(name, { exact: false })).toBeVisible();
  });

  test('SET-LEAVE-001 | SET_222–226 | Leave type can be added and survives reload', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openSetupTab(page, 'Leave');

    const name = `QA Leave ${Date.now().toString(36)}`;
    await page.getByRole('button', { name: '+ Add Leave Type', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add leave type' })).toBeVisible();

    // The actual blank form exposes only one text input (new leave label).
    await page.getByPlaceholder('e.g. Bereavement Leave', { exact: true }).fill(name);
    await page.getByRole('button', { name: 'Add leave type', exact: true }).click();

    await expect(
      page.getByRole('button', { name: new RegExp(name) }),
      'Added leave type should appear in the list',
    ).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await openSetupTab(page, 'Leave');
    await expect(page.getByRole('button', { name: new RegExp(name) })).toBeVisible();
  });

  test('SET-ALLOW-001 | SET_244–249 | Allowance can be added and survives reload', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openAllowances(page);

    const name = `QA Allowance ${Date.now().toString(36)}`;
    await page.getByRole('button', { name: '+ Add Allowance', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add Allowance' })).toBeVisible();

    await page.getByLabel('Allowance name*', { exact: true }).fill(name);

    for (const label of ['Tax treatment', 'Frequency'] as const) {
      const select = page.getByLabel(label, { exact: true });
      await expect(select).toBeVisible();
      // Retain an explicit default if the form has no alternate choice.
      const count = await select.locator('option').count();
      if (count > 1) await select.selectOption({ index: 1 });
    }

    await page.getByRole('button', { name: 'Add Allowance', exact: true }).click();
    await expect(page.getByText(name, { exact: false })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await openAllowances(page);
    await expect(page.getByText(name, { exact: false })).toBeVisible();
  });
});
