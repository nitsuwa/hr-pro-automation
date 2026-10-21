import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Excel SET_250–252 and SET_253–255.
 * Both tests create their own QA-only Allowance, never alter seeded entries.
 * They require an approved non-production HR PRO test environment.
 *
 * The Edit Allowance overlay is verified by the Playwright accessibility
 * snapshot; remove behavior has a verified passing UI Mode run.
 */
test.describe('HR PRO Setup — Allowance maintenance', () => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Changes to allowance catalog are only permitted on a disposable test environment.',
  );

  async function openAllowances(page: Page) {
    await page.goto('/payroll-value', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Structures', exact: true }).first().click();
    await page.getByRole('button', { name: 'Allowances', exact: true }).click();
  }

  async function createAllowance(page: Page, name: string) {
    await openAllowances(page);
    await page.getByRole('button', { name: '+ Add Allowance', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add Allowance' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Allowance name *' }).fill(name);
    await page.getByRole('button', { name: 'Add Allowance', exact: true }).click();
    const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) });
    await expect(row, 'A uniquely named QA allowance should have been created').toHaveCount(1);
    return row;
  }

  const allowanceRow = (page: Page, name: string) =>
    page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) });

  test('SET-ALLOW-EDIT | SET_250–252 | Modify allowance and save changes', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    const original = `QA Edit Allowance ${Date.now().toString(36)}`;
    const updated = `${original} Updated`;

    const row = await createAllowance(page, original);
    await row.getByRole('button', { name: 'Edit', exact: true }).click();

    // The Edit Allowance overlay is a plain modal container, not an
    // accessible role="dialog" or an inline table editor. Its controls
    // are exposed directly in the accessibility tree.
    await expect(page.getByRole('heading', { name: 'Edit Allowance', exact: true })).toBeVisible();
    const nameInput = page.getByRole('textbox', { name: 'Allowance name *', exact: true });
    await expect(nameInput).toHaveValue(original);
    await nameInput.fill(updated);
    await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Edit Allowance', exact: true })).toBeHidden();

    await expect(allowanceRow(page, updated), 'Updated allowance should replace original').toHaveCount(1);
    await expect(allowanceRow(page, original)).toHaveCount(0);
    await openAllowances(page);
    await expect(allowanceRow(page, updated), 'Updated allowance must persist after reopen').toHaveCount(1);
  });

  test('SET-ALLOW-REMOVE | SET_253–255 | Cancel deletion then confirm allowance removal', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    const name = `QA Remove Allowance ${Date.now().toString(36)}`;
    await createAllowance(page, name);

    // First deletion is CANCELLED, as required by the workbook.
    const row = allowanceRow(page, name);
    const deleteButton = row.getByRole('button', { name: /^(remove|delete)$/i });
    await expect(deleteButton, 'Allowance row must expose a deletion action').toBeVisible();

    let nativePrompt = '';
    const cancelNative = async (dialog: import('@playwright/test').Dialog) => {
      nativePrompt = dialog.message();
      await dialog.dismiss();
    };
    page.on('dialog', cancelNative);
    await deleteButton.click();
    page.off('dialog', cancelNative);

    const confirmation = page.getByRole('alertdialog').or(page.getByRole('dialog'))
      .filter({ hasText: /remov|delet|sure/i }).first();

    if (await confirmation.isVisible()) {
      await confirmation.getByRole('button', { name: /cancel|no|keep/i }).click();
    } else {
      expect(nativePrompt, 'Removing an allowance should prompt confirmation').toMatch(/remov|delet|sure/i);
    }

    await expect(allowanceRow(page, name), 'Cancelling removal should keep allowance').toHaveCount(1);

    // Next deletion is CONFIRMED.
    const confirmNative = async (dialog: import('@playwright/test').Dialog) => {
      if (dialog.type() === 'confirm' && /remov|delet|sure/i.test(dialog.message())) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    };
    page.on('dialog', confirmNative);
    try {
      await allowanceRow(page, name).getByRole('button', { name: /^(remove|delete)$/i }).click();
      const confirm = page.getByRole('alertdialog').or(page.getByRole('dialog'))
        .filter({ hasText: /remov|delet|sure/i }).first();
      if (await confirm.isVisible()) {
        await confirm.getByRole('button', { name: /^(remove|delete|yes.*|confirm.*|ok)$/i }).click();
      }
      await expect(allowanceRow(page, name), 'Confirmed removal should remove QA record').toHaveCount(0);
    } finally {
      page.off('dialog', confirmNative);
    }

    await openAllowances(page);
    await expect(allowanceRow(page, name), 'Removed allowance should stay removed').toHaveCount(0);
  });
});
