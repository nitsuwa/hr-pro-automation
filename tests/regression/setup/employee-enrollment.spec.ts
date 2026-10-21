import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { SettingsPage } from '../../../playwright/pages/settings.page';
import { EmployeesPage } from '../../../playwright/pages/employees.page';

/**
 * Excel SET_263–265: enroll an employee and verify persistence.
 * Uses generated QA-only employee data and the existing reusable EmployeesPage.
 */
test('SET-ENROLL-001 | SET_263–265 | Employee enrollment appears in records after reload', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');

  const settings = new SettingsPage(page);
  await settings.openGeneral();
  await settings.employeeIdMode.selectOption('auto');

  const employees = new EmployeesPage(page);
  const employeeName = `QA Enroll ${Date.now().toString(36)}`;

  await employees.enrollMinimalEmployee({
    name: employeeName,
    monthlyRate: '22000',
    hireDate: '2026-10-01',
  });

  const created = await employees.getEmployeeByName(employeeName);
  expect(created, 'New employee must be persisted after clicking Enroll').not.toBeNull();
  expect(created?.id, 'New employee must have a generated employee ID').toBeTruthy();

  await employees.open();
  await page.getByLabel('Search', { exact: true }).fill(employeeName);
  await expect(
    page.getByRole('row').filter({ hasText: employeeName }),
    'New employee should be findable in Employees list',
  ).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await employees.open();
  await page.getByLabel('Search', { exact: true }).fill(employeeName);
  await expect(
    page.getByRole('row').filter({ hasText: employeeName }),
    'Employee must remain listed after reload',
  ).toBeVisible();
});
