import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { SettingsPage } from '../../../playwright/pages/settings.page';

/**
 * These are one positive create + persistence case per catalog.
 * Duplicate/edit/remove cases are separate Excel scenarios and NOT covered here.
 * Use an authorized disposable QA environment: these tests create catalog entries.
 */
test.describe('HR PRO Setup — Catalog creation', () => {
  async function openTab(page: import('@playwright/test').Page, name: string) {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name, exact: true }).first().click();
  }

  test('SET-LOANS-001 | SET_163–168 | A loan source can be added and persists', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await new SettingsPage(page).openGeneral();

    const name = `QA Loan ${Date.now().toString(36)}`;
    const field = page.getByPlaceholder('New loan source (required)', { exact: true });
    await expect(field).toBeVisible();
    await field.fill(name);
    await page.getByRole('button', { name: '+ Add Loan', exact: true }).click();
    await expect(page.getByText(name, { exact: true })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await new SettingsPage(page).openGeneral();
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });

  test('SET-JOBPOS-001 | SET_190–194 | A job position can be added and persists', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Job Positions');

    const name = `QA Position ${Date.now().toString(36)}`;
    const field = page.getByPlaceholder('Position title (required)', { exact: true });
    await expect(field).toBeVisible();
    await field.fill(name);
    await page.getByRole('button', { name: '+ Add Position', exact: true }).click();
    await expect(page.getByText(name, { exact: true })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await openTab(page, 'Job Positions');
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });

  test('SET-LOCATION-001 | SET_206–210 | Work location can be added and persists', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Work Locations');

    const name = `QA Location ${Date.now().toString(36)}`;
    const field = page.getByPlaceholder('Location name (required)', { exact: true });
    await expect(field).toBeVisible();
    await field.fill(name);
    await page.getByPlaceholder('Address', { exact: true }).fill('QA Office - Test Data');
    await page.getByPlaceholder('Contact number', { exact: true }).fill('09170000000');
    await page.getByRole('button', { name: '+ Add Location', exact: true }).click();
    await expect(page.getByText(name, { exact: true })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await openTab(page, 'Work Locations');
    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });
});
