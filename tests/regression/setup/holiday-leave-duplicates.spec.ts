import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Candidate negative tests for the intended Excel SET_219 (duplicate Holiday)
 * and SET_227 (duplicate Leave Type) requirements.
 *
 * Both rows contain copied/ambiguous wording in the source workbook. These
 * tests deliberately implement the business interpretation "duplicate
 * entries must not be accepted"; QA/product-owner confirmation is required
 * before declaring these full workbook acceptance coverage.
 *
 * Each uses its own unique fictional QA value. These records are persistent
 * server-side; use the approved sandbox, and clean up by an authorized process.
 */
test.describe('HR PRO Setup — Holiday and Leave duplicate prevention', () => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Catalog validation that creates QA records must not run on production',
  );

  async function openTab(page: Page, tab: 'Holidays' | 'Leave') {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: tab, exact: true }).first().click();
  }

  const id = () => Date.now().toString(36);
  const sameHolidayRow = (page: Page, name: string) => page.getByRole('row')
    .filter({ has: page.getByText(name, { exact: true }) });

  async function addHoliday(page: Page, name: string, date: string) {
    await page.getByRole('button', { name: '+ Add Holiday', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add Holiday', exact: true })).toBeVisible();

    await page.getByLabel('Date*', { exact: true }).fill(date);
    await page.getByLabel('Holiday name*', { exact: true }).fill(name);

    const type = page.getByRole('combobox', { name: 'Type', exact: true });
    await expect(type).toBeVisible();
    expect(await type.locator('option').count()).toBeGreaterThan(1);
    await type.selectOption({ index: 1 });

    const location = page.getByRole('combobox', { name: 'Work Location', exact: true });
    await expect(location).toBeVisible();
    // Choose precisely the same location for both attempts.
    if ((await location.locator('option').count()) > 1) {
      await location.selectOption({ index: 1 });
    }
    await page.getByRole('button', { name: 'Add Holiday', exact: true }).click();
  }

  test('SET-HOLIDAY-DUP | SET_219 | An identical Holiday should not be saved twice', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Holidays');

    const name = 'QA Dup Holiday ' + id();
    // A stable future day within each run; unique QA name avoids seeded data.
    const dateOffset = Math.floor(Date.now() / 1000) % 700;
    const date = new Date(Date.UTC(2028, 0, 1) + dateOffset * 86_400_000)
      .toISOString().slice(0, 10);

    await addHoliday(page, name, date);
    await expect(sameHolidayRow(page, name), 'First Holiday creation should succeed').toHaveCount(1);

    // Reload before the second attempt to avoid stale dialog state.
    await openTab(page, 'Holidays');
    await addHoliday(page, name, date);

    // Reload dismisses any duplicate warning and proves persistence outcome.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openTab(page, 'Holidays');

    await expect(
      sameHolidayRow(page, name),
      'HR PRO must not persist two Holidays with the same date/name/type/location',
    ).toHaveCount(1);
  });

  test('SET-LEAVE-DUP | SET_227 | An identical Leave Type should not be saved twice', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Leave');

    const name = 'QA Dup Leave ' + id();
    const add = async () => {
      await page.getByRole('button', { name: '+ Add Leave Type', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Add leave type', exact: true })).toBeVisible();
      await page.getByPlaceholder('e.g. Bereavement Leave', { exact: true }).fill(name);
      await page.getByRole('button', { name: 'Add leave type', exact: true }).click();
    };

    await add();
    await expect(page.getByRole('button', { name: new RegExp(name) })).toHaveCount(1);

    await openTab(page, 'Leave');
    await add();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openTab(page, 'Leave');

    await expect(
      page.getByRole('button', { name: new RegExp(name) }),
      'The Leave Type list must not contain two entries with the same name',
    ).toHaveCount(1);
  });
});
