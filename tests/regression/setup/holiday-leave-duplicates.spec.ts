import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Candidate negative tests for the intended Excel SET_219 (duplicate Holiday)
 * and SET_227 (duplicate Leave Type) requirements.
 *
 * Both rows contain copied/ambiguous wording in the source workbook. These
 * Holiday duplicates currently trigger a visible, overridable confirmation:
 * these tests verify the warning and the CANCEL path, not hard rejection.
 * Whether an override violates SET_219 requires product-owner confirmation.
 * Leave label uniqueness remains a separate candidate issue.
 *
 * Each uses its own unique fictional QA value. Browser-local data was observed
 * in the prototype, but backend sharing is not ruled out. Use an approved
 * isolated QA environment and an authorized cleanup process.
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

  async function addHoliday(page: Page, name: string, date: string, duplicateAttempt = false) {
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
    const save = page.getByRole('button', { name: 'Add Holiday', exact: true });
    if (!duplicateAttempt) {
      await expect(save).toBeEnabled();
      await save.click();
    } else if (await save.isEnabled()) {
      await save.click();
    } else {
      await expect(save, 'Disabling duplicate creation is a valid rejection').toBeDisabled();
    }
  }

  test('SET-HOLIDAY-DUP | SET_219 | Cancelling duplicate Holiday confirmation keeps one record', async ({ page, loginAs }) => {
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
    await addHoliday(page, name, date, true);

    // HR PRO intentionally displays a confirmation that offers "Add it anyway".
    // Cancel explicitly: simply navigating away would not prove this path.
    const duplicatePrompt = page.getByRole('dialog', {
      name: /already a declared holiday on this date/i,
    });
    await expect(duplicatePrompt).toBeVisible();
    await duplicatePrompt.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(duplicatePrompt).toBeHidden();

    await openTab(page, 'Holidays');
    await expect(
      sameHolidayRow(page, name),
      'Cancelling the duplicate Holiday confirmation should keep only the original record',
    ).toHaveCount(1);
  });


  test('SET-HOLIDAY-DUP-FEEDBACK | SET_219 | Duplicate Holiday confirmation can be cancelled', async ({ page, loginAs }) => {
    test.skip(
      process.env.E2E_APPROVED_MUTATIONS !== '1',
      'Use only an explicitly approved, disposable QA environment for Holiday writes.',
    );
    await loginAs('systemAdmin');
    await openTab(page, 'Holidays');

    // Separate fictional test record: never touch a seeded company holiday.
    const name = 'QA Warning Holiday ' + id();
    const dateOffset = Math.floor(Date.now() / 1000) % 700;
    const date = new Date(Date.UTC(2028, 0, 1) + dateOffset * 86_400_000)
      .toISOString().slice(0, 10);

    await addHoliday(page, name, date);
    await expect(sameHolidayRow(page, name)).toHaveCount(1);
    await openTab(page, 'Holidays');

    // Reproduce the same date/name/type/location. The UI inventory and
    // screenshot show an in-page dialog, NOT an alert or native browser popup.
    await page.getByRole('button', { name: '+ Add Holiday', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add Holiday', exact: true })).toBeVisible();
    await page.getByLabel('Date*', { exact: true }).fill(date);
    await page.getByLabel('Holiday name*', { exact: true }).fill(name);

    const type = page.getByRole('combobox', { name: 'Type', exact: true });
    expect(await type.locator('option').count(), 'Holiday types must be available')
      .toBeGreaterThan(1);
    await type.selectOption({ index: 1 });
    const location = page.getByRole('combobox', { name: 'Work Location', exact: true });
    if (await location.locator('option').count() > 1) {
      await location.selectOption({ index: 1 });
    }
    const save = page.getByRole('button', { name: 'Add Holiday', exact: true });
    await expect(save).toBeEnabled();
    await save.click();

    const warning = page.getByRole('dialog', {
      name: /already a declared holiday on this date/i,
    });
    await expect(warning, 'A duplicate date must produce a visible confirmation').toBeVisible();
    await expect(warning).toContainText(/already|both declarations/i);
    await expect(warning.getByRole('button', { name: 'Add it anyway', exact: true }))
      .toBeVisible();

    // Never click "Add it anyway": the product permits a manual override.
    // This checks that the user can cancel rather than creating a duplicate.
    await warning.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(warning).toBeHidden();

    // Persistence assertion independent from the warning assertion.
    await openTab(page, 'Holidays');
    await expect(
      sameHolidayRow(page, name),
      'Cancelling duplicate confirmation must leave exactly one QA Holiday',
    ).toHaveCount(1);
  });

  test('SET-LEAVE-DUP | SET_227 | An identical Leave Type should not be saved twice', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Leave');

    const name = 'QA Dup Leave ' + id();
    const add = async (duplicateAttempt = false) => {
      await page.getByRole('button', { name: '+ Add Leave Type', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Add leave type', exact: true })).toBeVisible();
      await page.getByPlaceholder('e.g. Bereavement Leave', { exact: true }).fill(name);
      const save = page.getByRole('button', { name: 'Add leave type', exact: true });
      if (!duplicateAttempt) {
        await expect(save).toBeEnabled();
        await save.click();
      } else if (await save.isEnabled()) {
        await save.click();
      } else {
        await expect(save, 'Disabling duplicate creation is a valid rejection').toBeDisabled();
      }
    };

    await add();
    await expect(page.getByRole('button', { name: new RegExp(name) })).toHaveCount(1);

    await openTab(page, 'Leave');
    await add(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openTab(page, 'Leave');

    await expect(
      page.getByRole('button', { name: new RegExp(name) }),
      'The Leave Type list must not contain two entries with the same name',
    ).toHaveCount(1);
  });
});
