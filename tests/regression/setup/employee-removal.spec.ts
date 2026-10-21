import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { SettingsPage } from '../../../playwright/pages/settings.page';
import { EmployeesPage } from '../../../playwright/pages/employees.page';

/**
 * Excel SET_269–270: remove a freshly enrolled QA employee.
 *
 * Safeguard: NEVER select, delete, archive, or otherwise modify a seeded
 * employee. Requires a uniquely named QA record made within the same test.
 * Local Playwright UI Mode is the first verification of confirmation behavior.
 */
test('SET-EMP-REMOVE | SET_269–270 | Remove a new QA employee and verify absence', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Never run employee deletion checks against production',
  );
  test.setTimeout(90_000);

  await loginAs('systemAdmin');
  const settings = new SettingsPage(page);
  await settings.openGeneral();
  await settings.employeeIdMode.selectOption('auto');

  const employees = new EmployeesPage(page);
  const name = 'QA Employee Remove ' + Date.now().toString(36);
  await employees.enrollMinimalEmployee({
    name,
    monthlyRate: '22000',
    hireDate: '2026-10-01',
  });

  // Narrow both selection and deletion to exactly the new QA employee.
  await employees.open();
  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await search.fill(name);
  const result = page.getByRole('row').filter({
    has: page.getByRole('cell', { name, exact: true }),
  });
  await expect(result, 'Only the fresh QA employee must be selected').toHaveCount(1);
  await result.getByRole('checkbox', { name: 'Select ' + name, exact: true }).check();
  await expect(result.getByRole('checkbox')).toBeChecked();

  const deleteButton = page.getByRole('button', { name: /Delete/i }).first();
  await expect(deleteButton, 'Selecting the QA employee should expose a Delete action').toBeEnabled();

  // The app may use window.confirm or an in-app confirmation dialog.
  // Only accept a native confirmation explicitly mentioning deletion/removal.
  const onDialog = async (dialog: import('@playwright/test').Dialog) => {
    if (dialog.type() === 'confirm' && /delet|remov/i.test(dialog.message())) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  };
  page.on('dialog', onDialog);
  try {
    await deleteButton.click();

    const confirmation = page.getByRole('alertdialog').or(page.getByRole('dialog'))
      .filter({ hasText: /delet|remov|sure/i }).first();
    if (await confirmation.isVisible()) {
      const confirmButton = confirmation.getByRole('button', {
        name: /^(?:Delete.*|Remove.*|Confirm.*|Yes.*|OK)$/i,
      }).first();
      await expect(confirmButton).toBeVisible();
      await confirmButton.click();
    }

    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) }),
      'The QA employee should no longer appear in the Employees list',
    ).toHaveCount(0);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('textbox', { name: 'Search', exact: true }).fill(name);
    await expect(
      page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) }),
      'The removed employee must remain absent after a full reload',
    ).toHaveCount(0);
  } finally {
    page.off('dialog', onDialog);
  }
});
