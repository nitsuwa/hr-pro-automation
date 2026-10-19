import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Excel SET_185–189 (PARTIAL): department approval routing.
 *
 * Creates a unique QA-only Department; assigns an available approver to the
 * first dropdown of its approver editor, saves, and reopens to verify.
 * All seeded departments remain unchanged. Covers setting persistence, not
 * the downstream filing/approval behavior across all six routing fields.
 *
 * Source: approved local UI inventory V9 (listbox/option DOM semantics).
 */
test('SET-DEPT-APPROVER | SET_185–189 | New QA department approver assignment persists', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Department approvals may only be altered in an approved QA environment',
  );

  await loginAs('systemAdmin');
  async function openDepartments() {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Departments', exact: true }).click();
  }

  const department = 'QA Approver Dept ' + Date.now().toString(36);
  const rowForDepartment = () => page.getByRole('row').filter({
    has: page.getByRole('cell', { name: department, exact: true }),
  });

  await openDepartments();
  await page.getByRole('button', { name: '+ Add Department', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Department name', exact: true });
  await expect(input).toBeVisible();
  await input.fill(department);
  await input.press('Enter');

  const added = page.getByRole('alertdialog', { name: /^Added / });
  await expect(added).toBeVisible();
  await added.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(added).toBeHidden();

  await expect(rowForDepartment(), 'Only our unique QA department should be selected').toHaveCount(1);
  await rowForDepartment().getByRole('button', { name: 'Approvers', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Approvers —/ })).toBeVisible();

  // V9 confirms the approver pickers are buttons with aria-haspopup=listbox,
  // while their choices use role=option. Avoid name guesses or nth-based option
  // selection of a specific existing employee.
  const firstApprover = page.locator('button[aria-haspopup="listbox"]').first();
  await expect(firstApprover).toBeVisible();
  await firstApprover.click();

  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  const candidate = listbox.getByRole('option')
    .filter({ hasNotText: /^(?:\s*—?\s*None|.*Company default)/i }).first();
  await expect(candidate, 'A selectable approver must be available in the QA fixture').toBeVisible();
  const chosen = (await candidate.innerText()).trim();
  expect(chosen, 'Approver display name should not be blank').not.toBe('');
  await candidate.click();
  await expect(firstApprover, 'Selection must be shown in the edit form').toContainText(chosen);

  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  const saved = page.getByRole('alertdialog');
  if (await saved.isVisible()) {
    await saved.getByRole('button', { name: 'OK', exact: true }).click();
  }

  await openDepartments();
  await expect(rowForDepartment()).toHaveCount(1);
  await rowForDepartment().getByRole('button', { name: 'Approvers', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Approvers —/ })).toBeVisible();
  await expect(page.locator('button[aria-haspopup="listbox"]').first(),
    'The chosen approver must remain assigned after reopening').toContainText(chosen);
});
