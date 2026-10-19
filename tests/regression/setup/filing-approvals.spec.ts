import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { SettingsPage } from '../../../playwright/pages/settings.page';

/**
 * Excel: SET_083–SET_087.
 * Verifies filing approval settings and the leave filing branch.
 * Overtime/timekeeping end-to-end approval still need separate coverage.
 */
test.describe('HR PRO Setup — Filing & Approvals', () => {
  const permissions = {
    overtime: /Overtime — Outlier OT/i,
    timekeeping: /Timekeeping Adjustments — A missing-punch fix/i,
    leave: /Leave — Reclassifying an absence as leave/i,
  };

  async function requireFilingApprovals(page: import('@playwright/test').Page) {
    const settings = new SettingsPage(page);
    await settings.openGeneral();

    for (const [key, label] of Object.entries(permissions)) {
      const checkbox = page.getByRole('checkbox', { name: label });
      await expect(checkbox, `${key} filing approval option should be visible`).toBeVisible();
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    }
  }

  test('SET-FILING-001 | SET_083–087 | Filing approval options persist after reload', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await requireFilingApprovals(page);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await new SettingsPage(page).openGeneral();

    for (const [key, label] of Object.entries(permissions)) {
      await expect(
        page.getByRole('checkbox', { name: label }),
        `${key} filing approval option must remain enabled after reload`,
      ).toBeChecked();
    }
  });

  test('SET-FILING-002 | SET_087 | Leave status change creates an approval request, not direct DTR edit', async ({ page, loginAs }) => {
    test.setTimeout(120_000);
    await loginAs('systemAdmin');
    await requireFilingApprovals(page);

    // Uses the seeded demo employee/date from the earlier inspection script.
    await page.goto('/timesheet', { waitUntil: 'domcontentloaded' });
    await page.getByLabel('Payroll date', { exact: true }).fill('2026-09-20');
    await page.getByLabel(/^Batch name/).fill(`QA_SET087_${Date.now()}`);
    await page.getByLabel('Search', { exact: true }).fill('Juan Dela Cruz');

    const employeeRow = page.locator('tr').filter({ hasText: 'Juan Dela Cruz' });
    await expect(employeeRow).toBeVisible();
    await employeeRow.locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Review attendance →', exact: true }).click();
    await page.getByRole('button', { name: 'Submit to Review', exact: true }).click();

    const reviewRow = page.locator('tr').filter({ hasText: 'Juan Dela Cruz' });
    await expect(reviewRow).toBeVisible();
    await reviewRow.click();

    const dateRow = page.getByRole('row', { name: /^Sep 16 Wed/ });
    await expect(dateRow).toBeVisible();
    const statusSelect = dateRow.getByRole('combobox');
    const options = await statusSelect.locator('option').allTextContents();
    const leaveName = options.find((option) => /SIL leave/i.test(option));
    expect(leaveName, 'Seeded employee should offer SIL leave for Sep 16').toBeTruthy();

    const getApprovalState = () => page.evaluate(() => ({
      requests: localStorage.getItem('hrpro:leaveRequests'),
      overrides: localStorage.getItem('hrpro:leaveOverrides'),
      taken: localStorage.getItem('hrpro:leaveTaken'),
    }));
    const before = await getApprovalState();
    await statusSelect.selectOption({ label: leaveName! });

    // Assert the business outcome; this is not another console-only probe.
    await expect.poll(async () => (await getApprovalState()).requests, {
      message: 'Changing a DTR leave status must create an approval/filing request',
      timeout: 10_000,
    }).not.toBe(before.requests);

    const after = await getApprovalState();
    expect(after.overrides, 'DTR leave overrides must remain unchanged before approval').toBe(before.overrides);
    expect(after.taken, 'Leave usage must remain unchanged before approval').toBe(before.taken);

    const filedDialog = page.getByRole('alertdialog', { name: 'Filed for approval' });
    if (await filedDialog.isVisible()) {
      await filedDialog.getByRole('button', { name: 'OK', exact: true }).click();
    }
  });
});
