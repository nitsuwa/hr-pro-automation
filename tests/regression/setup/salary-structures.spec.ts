import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Excel SET_230–240: salary structure creation + rule assignment and editing.
 * These tests create their OWN QA-only structures and never change the
 * company default salary structure, payroll values, or seeded records.
 *
 * The Create UI controls are grounded in setup-structure-controls.json.
 * Editing controls still require Playwright UI Mode verification.
 */
test.describe('HR PRO Setup — Salary Structures', () => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'QA salary-structure changes must run only in an approved non-production environment',
  );

  async function openStructures(page: Page) {
    await page.goto('/payroll-value', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Structures', exact: true }).first().click();
    // First Structures button is the Smart Pay section; last is catalog tab.
    await page.getByRole('button', { name: 'Structures', exact: true }).last().click();
  }

  async function addBasicSalary(page: Page) {
    const rule = page.getByRole('button', { name: /^Basic Salary\s+BASIC\s+EARNING\b/ });
    await expect(rule, 'Basic Salary must be an available salary rule').toBeVisible();
    await rule.click();

    await expect(
      page.getByRole('heading', { name: /Available salary rules.*1 of \d+ added/ }),
      'The Salary Structure should contain one selected rule',
    ).toBeVisible();
    await expect(rule, 'Selected Basic Salary rule should show an added state')
      .toContainText(/added/i);
  }

  async function createStructure(page: Page, name: string) {
    await openStructures(page);
    await page.getByRole('button', { name: '+ Add Structure', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add Structure', exact: true })).toBeVisible();
    await page.getByPlaceholder('e.g. Standard Structure', { exact: true }).fill(name);
    await addBasicSalary(page);
    await page.getByRole('button', { name: 'Add Structure', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Add Structure', exact: true })).toBeHidden();
    await expect(page.getByText(name, { exact: true }), 'New structure should appear in the catalog').toBeVisible();
  }

  test('SET-STRUCT-CREATE | SET_230–237 | Add salary structure with selected Basic Salary rule', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    const name = 'QA Structure ' + Date.now().toString(36);
    await createStructure(page, name);

    await openStructures(page);
    await expect(page.getByText(name, { exact: true }), 'Structure should survive reopening the catalog').toBeVisible();
  });

  test('SET-STRUCT-EDIT | SET_238–240 | Edit QA structure name and add another rule', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    const name = 'QA Edit Structure ' + Date.now().toString(36);
    const renamed = name + ' Updated';
    await createStructure(page, name);

    const row = page.getByRole('row').filter({
      has: page.getByRole('cell', { name, exact: true }),
    });
    await expect(row, 'Created structure should have its own editable catalog row').toHaveCount(1);
    await row.getByRole('button', { name: 'Edit', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Edit Structure', exact: true })).toBeVisible();
    const nameInput = page.getByPlaceholder('e.g. Standard Structure', { exact: true });
    await expect(nameInput).toHaveValue(name);
    await nameInput.fill(renamed);

    const newRule = page.getByRole('button', { name: /^Rice Subsidy\s+RICE\s+EARNING\b/ });
    await expect(newRule).toBeVisible();
    await newRule.click();
    await expect(
      page.getByRole('heading', { name: /Available salary rules.*2 of \d+ added/ }),
      'The edited structure should now have two selected rules',
    ).toBeVisible();

    await page.getByRole('button', { name: /^(Save Changes|Save Structure|Update Structure)$/i }).click();
    await expect(page.getByText(renamed, { exact: true })).toBeVisible();

    await openStructures(page);
    await expect(page.getByText(renamed, { exact: true }), 'Edited structure should persist').toBeVisible();
    await expect(page.getByText(name, { exact: true }), 'Original structure name should disappear').toHaveCount(0);
  });
});
