import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page, Locator } from '@playwright/test';

/**
 * Workbook SET_170, SET_183, SET_196, SET_212.
 *
 * Each test CREATES a unique QA-only catalog record, edits that record, and
 * verifies persistence after reopening the Setup section. Seeded company
 * entries are NEVER edited. These tests require an approved test environment.
 *
 * Source of selectors: setup-edit-inventory.json captured 19 October 2026.
 */
test.describe('HR PRO Setup — Edit catalog records', () => {
  test.skip(
    process.env.E2E_ENV?.toLowerCase() === 'production',
    'Catalog mutations are for approved test environments only',
  );

  const uniqueName = (label: string) => `QA ${label} ${Date.now().toString(36)}`;

  async function openTab(page: Page, tab: 'General' | 'Departments' | 'Job Positions' | 'Work Locations') {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: tab, exact: true }).click();
  }

  const namedRow = (page: Page, name: string) =>
    page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) });

  async function beginEdit(page: Page, originalName: string): Promise<Locator> {
    const row = namedRow(page, originalName);
    await expect(row, `Exactly one QA record "${originalName}" must exist before editing`).toHaveCount(1);
    await row.getByRole('button', { name: 'Edit', exact: true }).click();

    // Inline edit fields are rendered inside the row. Other Add forms may
    // have IDENTICAL placeholders; always scope the locator to the row.
    const editing = page.getByRole('row').filter({
      has: page.getByRole('button', { name: 'Save', exact: true }),
    });
    await expect(editing, 'An inline editing row should expose Save').toHaveCount(1);
    return editing;
  }

  async function verifyEditedAndPersisted(
    page: Page,
    tab: 'General' | 'Departments' | 'Job Positions' | 'Work Locations',
    before: string,
    after: string,
  ) {
    await expect(namedRow(page, after), 'Edited name should appear once').toHaveCount(1);
    await expect(namedRow(page, before), 'Original name should no longer appear').toHaveCount(0);

    await openTab(page, tab);
    await expect(namedRow(page, after), 'Edited name must remain saved after reopening').toHaveCount(1);
    await expect(namedRow(page, before)).toHaveCount(0);
  }

  test('SET-LOANS-EDIT | SET_170 | Loan source can be renamed and saved', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'General');

    const original = uniqueName('Edit Loan');
    const updated = `${original} Updated`;

    await page.getByPlaceholder('New loan source (required)', { exact: true }).fill(original);
    await page.getByRole('button', { name: '+ Add Loan', exact: true }).click();

    const editRow = await beginEdit(page, original);
    const input = editRow.locator('input:not([type="checkbox"])').first();
    await expect(input).toHaveValue(original);
    await input.fill(updated);
    await editRow.getByRole('button', { name: 'Save', exact: true }).click();

    await verifyEditedAndPersisted(page, 'General', original, updated);
  });

  test('SET-DEPT-EDIT | SET_183 | Department can be renamed and saved', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Departments');

    const original = uniqueName('Edit Dept');
    const updated = `${original} Updated`;

    await page.getByRole('button', { name: '+ Add Department', exact: true }).click();
    const addInput = page.getByRole('textbox', { name: 'Department name', exact: true });
    await expect(addInput).toBeVisible();
    await addInput.fill(original);
    await addInput.press('Enter');

    // Successful department creation displays a blocking confirmation popup.
    const added = page.getByRole('alertdialog', { name: /^Added / });
    await expect(added).toBeVisible();
    await added.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(added).toBeHidden();

    const editRow = await beginEdit(page, original);
    const input = editRow.getByPlaceholder('Department name (required)', { exact: true });
    await expect(input).toHaveValue(original);
    await input.fill(updated);
    await editRow.getByRole('button', { name: 'Save', exact: true }).click();

    await verifyEditedAndPersisted(page, 'Departments', original, updated);
  });

  test('SET-JOBPOS-EDIT | SET_196 | Job position can be renamed and saved', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Job Positions');

    const original = uniqueName('Edit Position');
    const updated = `${original} Updated`;

    await page.getByPlaceholder('Position title (required)', { exact: true }).first().fill(original);
    await page.getByRole('button', { name: '+ Add Position', exact: true }).click();

    const editRow = await beginEdit(page, original);
    const input = editRow.getByPlaceholder('Position title (required)', { exact: true });
    await expect(input).toHaveValue(original);
    await input.fill(updated);
    await editRow.getByRole('button', { name: 'Save', exact: true }).click();

    await verifyEditedAndPersisted(page, 'Job Positions', original, updated);
  });

  test('SET-LOCATION-EDIT | SET_212 | Work location can be renamed and saved', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Work Locations');

    const original = uniqueName('Edit Location');
    const updated = `${original} Updated`;

    await page.getByPlaceholder('Location name (required)', { exact: true }).first().fill(original);
    await page.getByRole('button', { name: '+ Add Location', exact: true }).click();

    const editRow = await beginEdit(page, original);
    const input = editRow.getByPlaceholder('Location name (required)', { exact: true });
    await expect(input).toHaveValue(original);
    await input.fill(updated);
    await editRow.getByRole('button', { name: 'Save', exact: true }).click();

    await verifyEditedAndPersisted(page, 'Work Locations', original, updated);
  });
});
