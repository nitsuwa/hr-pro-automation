import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Excel SET_185–189 (PARTIAL): Timekeeping and Leave routing persistence.
 *
 * Uses a unique QA-only Department. The existing
 * department-approver.spec.ts covers two-level Overtime approvers.
 * This complements it by verifying first/second Timekeeping and Leave
 * approvers, WITHOUT touching seeded departments.
 *
 * Based on the observed HR PRO editor structure: 8 picker buttons, in order
 * Overtime [0,1], Timekeeping Adjustments [2,3], Leave [4,5], Payroll [6,7].
 * Does NOT prove downstream filing / approval decisions.
 */
test('SET-DEPT-OTHER-ROUTING | SET_185–189 | Timekeeping and Leave approvers persist', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Do not change approval settings on production.',
  );

  await loginAs('systemAdmin');

  async function openDepartments() {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Departments', exact: true }).click();
  }

  const name = 'QA Routing Dept ' + Date.now().toString(36);
  const row = () => page.getByRole('row').filter({
    has: page.getByRole('cell', { name, exact: true }),
  });

  await openDepartments();
  await page.getByRole('button', { name: '+ Add Department', exact: true }).click();
  const input = page.getByRole('textbox', { name: 'Department name', exact: true });
  await expect(input).toBeVisible();
  await input.fill(name);
  await input.press('Enter');

  const added = page.getByRole('alertdialog', { name: /^Added / });
  await expect(added).toBeVisible();
  await added.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(added).toBeHidden();

  await expect(row()).toHaveCount(1);
  await row().getByRole('button', { name: 'Approvers', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Approvers —/ })).toBeVisible();

  const pickers = page.locator('button[aria-haspopup="listbox"]');
  await expect(pickers, 'The editor must expose Overtime, Timekeeping, Leave and Payroll pickers')
    .toHaveCount(8);

  // The expanded option includes the person name plus job metadata.
  // The collapsed picker displays only the first (name) line.
  async function selectApprover(index: number, exceptName?: string) {
    const picker = pickers.nth(index);
    await expect(picker).toBeVisible();
    await picker.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const candidates = listbox.getByRole('option')
      .filter({ hasNotText: /^(?:\s*—?\s*None|.*Company default)/i });

    let chosenIndex = -1;
    let chosenName = '';
    const count = await candidates.count();
    for (let i = 0; i < count; i += 1) {
      const firstLine = (await candidates.nth(i).innerText()).split(/\r?\n/)[0].trim();
      if (firstLine && firstLine !== exceptName) {
        chosenIndex = i;
        chosenName = firstLine;
        break;
      }
    }

    expect(chosenIndex, 'At least one eligible approver must be available').toBeGreaterThanOrEqual(0);
    await candidates.nth(chosenIndex).click();
    await expect(picker, 'The chosen approver must display in the editor').toContainText(chosenName);
    return chosenName;
  }

  const timekeepingFirst = await selectApprover(2);
  const timekeepingSecond = await selectApprover(3, timekeepingFirst);
  const leaveFirst = await selectApprover(4);
  const leaveSecond = await selectApprover(5, leaveFirst);

  // Verify all four selections together, before saving.
  const expected = [
    { index: 2, category: 'Timekeeping first', value: timekeepingFirst },
    { index: 3, category: 'Timekeeping second', value: timekeepingSecond },
    { index: 4, category: 'Leave first', value: leaveFirst },
    { index: 5, category: 'Leave second', value: leaveSecond },
  ];
  for (const item of expected) {
    await expect(pickers.nth(item.index), item.category + ' selection must remain visible')
      .toContainText(item.value);
  }

  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  const savedAlert = page.getByRole('alertdialog');
  if (await savedAlert.isVisible()) {
    await savedAlert.getByRole('button', { name: 'OK', exact: true }).click();
  }

  await openDepartments();
  await expect(row(), 'Created QA department must persist').toHaveCount(1);
  await row().getByRole('button', { name: 'Approvers', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Approvers —/ })).toBeVisible();

  const persisted = page.locator('button[aria-haspopup="listbox"]');
  await expect(persisted).toHaveCount(8);
  for (const item of expected) {
    await expect(persisted.nth(item.index),
      item.category + ' approver should persist after reopening').toContainText(item.value);
  }
});
