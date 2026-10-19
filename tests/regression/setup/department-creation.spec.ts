import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

/**
 * Excel SET_177–181: positive Department creation.
 * The department head is optional in the workbook.
 * Other department scenarios (duplicate, edit, remove, approvers)
 * require their own tests and remain pending.
 */
test('SET-DEPT-001 | SET_177–181 | Create a department and verify it persists', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  const openDepartments = async () => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Departments', exact: true }).click();
  };

  await openDepartments();
  const name = `QA Department ${Date.now().toString(36)}`;
  await page.getByRole('button', { name: '+ Add Department', exact: true }).click();

  const field = page.getByRole('textbox', { name: 'Department name', exact: true });
  await expect(field).toBeVisible();
  await field.fill(name);

  // The Excel workbook permits pressing Enter to save. This also avoids
  // guessing the text of a button that was absent from the blank-form survey.
  await field.press('Enter');

  await expect(
    page.getByText(name, { exact: true }),
    'New department should appear in the list after saving',
  ).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await openDepartments();
  await expect(
    page.getByText(name, { exact: true }),
    'Saved department must still be listed after reload',
  ).toBeVisible();
});
