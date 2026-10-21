import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { SettingsPage } from '../../../playwright/pages/settings.page';
import { EmployeesPage } from '../../../playwright/pages/employees.page';

/**
 * Excel SET_271–274: create an employee and associated user account.
 * Uses an example.com address; no real person or invitation is involved.
 * The UI describes the invitation as simulated.
 */
test('SET-USER-001 | SET_271–274 | Enrolling an employee with account option also creates a user', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');

  const settings = new SettingsPage(page);
  await settings.openGeneral();
  await settings.employeeIdMode.selectOption('auto');

  const employees = new EmployeesPage(page);
  await employees.open();
  await employees.openEnrollment();

  const suffix = Date.now().toString(36);
  const employeeName = `QA User Enroll ${suffix}`;
  const email = `qa.user.${suffix}@example.com`;

  await page.getByLabel('Full Name*', { exact: true }).fill(employeeName);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Monthly Rate*', { exact: true }).fill('22000');
  await page.getByLabel('Date of Hiring*', { exact: true }).fill('2026-10-01');

  const createUser = page.getByRole('checkbox', {
    name: /Create a user account for this employee/i,
  });
  await createUser.check();
  await expect(createUser).toBeChecked();
  await page.getByRole('button', { name: 'Enroll', exact: true }).click();

  await expect.poll(async () => (await employees.getEmployeeByName(employeeName)) !== null, {
    message: 'Employee record should be created',
  }).toBe(true);

  await page.goto('/settings', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Users & Access', exact: true }).click();
  await expect(
    page.getByText(email, { exact: false }),
    'The associated user should be listed under Users & Access',
  ).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Users & Access', exact: true }).click();
  await expect(
    page.getByText(email, { exact: false }),
    'Created user should still exist after reload',
  ).toBeVisible();
});
