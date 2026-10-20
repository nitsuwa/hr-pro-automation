import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Excel SET_185–189 (PARTIAL): department approval routing.
 *
 * Creates a unique QA-only Department; assigns an available approver to the
 * first and second Overtime approvers, saves, and reopens to verify both.
 * All seeded departments remain unchanged. Covers setting persistence, not
 * downstream filing/approval behavior or the other routing fields.
 *
 * Source: approved local UI inventory V9 (listbox/option DOM semantics).
 */
test('SET-DEPT-APPROVER | SET_185–189 | New QA department two-level approvers persist', async ({ page, loginAs }) => {
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
  // The approved approver editor UI shows Overtime 1st and 2nd pickers
  // together, followed by Timekeeping, Leave and Payroll routing pickers.
  const approvalPickers = page.locator('button[aria-haspopup="listbox"]');
  expect(await approvalPickers.count(), 'Expected at least first and second approver pickers')
    .toBeGreaterThanOrEqual(2);
  const firstApprover = approvalPickers.nth(0);
  const secondApprover = approvalPickers.nth(1);
  await expect(firstApprover).toBeVisible();
  await expect(secondApprover).toBeVisible();
  await firstApprover.click();

  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  const candidate = listbox.getByRole('option')
    .filter({ hasNotText: /^(?:\s*—?\s*None|.*Company default)/i }).first();
  await expect(candidate, 'A selectable approver must be available in the QA fixture').toBeVisible();
  // The expanded option includes the employee name PLUS job/department
  // metadata; the collapsed picker only renders the employee name.
  const chosen = (await candidate.innerText()).split(/\r?\n/)[0].trim();
  expect(chosen, 'Approver display name should not be blank').not.toBe('');
  await candidate.click();
  await expect(firstApprover, 'First approver must be shown in the edit form').toContainText(chosen);

  // Pick a *different* second Overtime approver from the actual available
  // list. Never assume a particular seeded employee is present.
  await secondApprover.click();
  await expect(listbox).toBeVisible();
  const alternatives = listbox.getByRole('option')
    .filter({ hasNotText: /^(?:\s*—?\s*None|.*Company default)/i });
  // innerText matches the visible first line; textContent can concatenate
  // job metadata and fail to match the collapsed picker display.
  const optionCount = await alternatives.count();
  let secondIndex = -1;
  let secondChosen = '';
  for (let index = 0; index < optionCount; index += 1) {
    const visibleName = (await alternatives.nth(index).innerText()).split(/\r?\n/)[0].trim();
    if (visibleName && visibleName !== chosen) {
      secondIndex = index;
      secondChosen = visibleName;
      break;
    }
  }
  expect(secondIndex, 'A second distinct QA approver must be available').toBeGreaterThanOrEqual(0);
  await alternatives.nth(secondIndex).click();
  await expect(secondApprover, 'Second approver must be shown in the edit form')
    .toContainText(secondChosen);
  await expect(firstApprover, 'Selecting the second approver must not replace the first')
    .toContainText(chosen);

  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  const saved = page.getByRole('alertdialog');
  if (await saved.isVisible()) {
    await saved.getByRole('button', { name: 'OK', exact: true }).click();
  }

  await openDepartments();
  await expect(rowForDepartment()).toHaveCount(1);
  await rowForDepartment().getByRole('button', { name: 'Approvers', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Approvers —/ })).toBeVisible();
  const savedPickers = page.locator('button[aria-haspopup="listbox"]');
  await expect(savedPickers.nth(0),
    'First approver must remain assigned after reopening').toContainText(chosen);
  await expect(savedPickers.nth(1),
    'Second approver must remain assigned after reopening').toContainText(secondChosen);
});
