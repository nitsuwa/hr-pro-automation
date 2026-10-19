import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { SettingsPage } from '../../../playwright/pages/settings.page';
import { EmployeesPage } from '../../../playwright/pages/employees.page';

/**
 * Excel SET_266–268 (partial): update an employee's core profile and verify
 * that the change persists in the Employees list and after a reload.
 *
 * This test only edits the QA employee it creates; it must run in a
 * non-production/test environment. It does not touch real employee records.
 */
test('SET-EMP-EDIT | SET_266–268 | Edit QA employee name and verify it persists', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Employee mutation tests require an approved non-production environment.',
  );

  await loginAs('systemAdmin');
  const settings = new SettingsPage(page);
  await settings.openGeneral();
  await settings.employeeIdMode.selectOption('auto');

  const employees = new EmployeesPage(page);
  const suffix = Date.now().toString(36);
  const original = 'QA Employee Edit ' + suffix;
  const updated = original + ' Updated';

  await employees.enrollMinimalEmployee({
    name: original,
    monthlyRate: '22000',
    hireDate: '2026-10-01',
  });

  // Employee records open directly into editable details; the V8 UI
  // inventory found Full Name*, Cancel and Save on this screen.
  await employees.open();
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(original);
  const resultRow = page.getByRole('row').filter({ hasText: original });
  await expect(resultRow, 'Only our newly created QA employee should match').toHaveCount(1);
  await resultRow.getByRole('link', { name: original, exact: true }).click();

  const nameField = page.getByRole('textbox', { name: 'Full Name *', exact: true });
  await expect(nameField, 'Employee detail editor must expose the name field').toHaveValue(original);
  await nameField.fill(updated);
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();

  // Check actual employee storage and the searchable UI; a successful Save
  // button click alone is not sufficient evidence of persistence.
  await expect.poll(async () => {
    const saved = await employees.getEmployeeByName(updated);
    return saved !== null;
  }, { message: 'Employee name update should be saved' }).toBe(true);

  await employees.open();
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(updated);
  await expect(page.getByRole('row').filter({ hasText: updated })).toHaveCount(1);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(updated);
  await expect(page.getByRole('row').filter({ hasText: updated }),
    'Updated name should persist after a full reload').toHaveCount(1);
});
