import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Dialog, Page } from '@playwright/test';

/**
 * SET_171, SET_184, SET_197, SET_213 — removal checks.
 *
 * IMPORTANT: Each case FIRST creates its OWN uniquely named QA record.
 * Only the record matching that exact name may be removed. No seeded
 * business entries are altered. Run against an approved test environment.
 *
 * Confirms deletion by checking that the row disappears AND remains absent
 * after navigating back to the catalog.
 */
test.describe('HR PRO Setup — Remove QA-created catalog records', () => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'This test deletes records and must not run against production',
  );

  const newName = (kind: string) => `QA Remove ${kind} ${Date.now().toString(36)}`;

  async function openTab(page: Page, tab: 'General' | 'Departments' | 'Job Positions' | 'Work Locations') {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: tab, exact: true }).click();
  }

  const recordRow = (page: Page, name: string) =>
    page.getByRole('row').filter({
      has: page.getByRole('cell', { name, exact: true }),
    });

  async function deleteOnlyOurRecord(page: Page, name: string) {
    const row = recordRow(page, name);
    await expect(row, 'Only the new uniquely named QA record may be removed').toHaveCount(1);

    // Accept a native confirmation only when it is clearly a removal dialog.
    // A native alert with a different purpose is not confirmation of deletion.
    const handleNativeDialog = async (dialog: Dialog) => {
      if (dialog.type() === 'confirm' && /remov|delet|sure/i.test(dialog.message())) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    };
    page.on('dialog', handleNativeDialog);
    try {
      await row.getByRole('button', { name: 'Remove', exact: true }).click();

      // The app may instead show an in-page confirmation dialog.
      // Use its own buttons, never force-click behind a blocking overlay.
      const confirmation = page.getByRole('alertdialog')
        .or(page.getByRole('dialog'))
        .filter({ hasText: /remov|delet|sure/i })
        .first();
      if (await confirmation.isVisible()) {
        const confirm = confirmation.getByRole('button', {
          name: /^(?:Yes.*|Remove.*|Delete.*|Confirm.*|OK)$/i,
        }).first();
        await expect(confirm, 'Removal confirmation should offer an explicit confirm action').toBeVisible();
        await confirm.click();
      }

      await expect(
        recordRow(page, name),
        'Removing the QA record should remove it from the visible catalog',
      ).toHaveCount(0);
    } finally {
      page.off('dialog', handleNativeDialog);
    }
  }

  async function verifyDeletedAfterReopen(
    page: Page,
    tab: 'General' | 'Departments' | 'Job Positions' | 'Work Locations',
    name: string,
  ) {
    await openTab(page, tab);
    await expect(
      recordRow(page, name),
      'Deleted QA record must remain absent after reopening its Setup section',
    ).toHaveCount(0);
  }

  test('SET-LOANS-REMOVE | SET_171 | Remove a newly created loan source', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'General');

    const name = newName('Loan');
    await page.getByPlaceholder('New loan source (required)', { exact: true }).fill(name);
    await page.getByRole('button', { name: '+ Add Loan', exact: true }).click();
    await expect(recordRow(page, name)).toHaveCount(1);

    await deleteOnlyOurRecord(page, name);
    await verifyDeletedAfterReopen(page, 'General', name);
  });

  test('SET-DEPT-REMOVE | SET_184 | Remove a newly created department', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Departments');

    const name = newName('Dept');
    await page.getByRole('button', { name: '+ Add Department', exact: true }).click();
    const field = page.getByRole('textbox', { name: 'Department name', exact: true });
    await expect(field).toBeVisible();
    await field.fill(name);
    await field.press('Enter');

    // Department creation displays a success popup. Dismiss it before removal.
    const added = page.getByRole('alertdialog', { name: /^Added / });
    await expect(added).toBeVisible();
    await added.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(added).toBeHidden();
    await expect(recordRow(page, name)).toHaveCount(1);

    await deleteOnlyOurRecord(page, name);
    await verifyDeletedAfterReopen(page, 'Departments', name);
  });

  test('SET-JOBPOS-REMOVE | SET_197 | Remove a newly created job position', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Job Positions');

    const name = newName('Position');
    await page.getByPlaceholder('Position title (required)', { exact: true }).first().fill(name);
    await page.getByRole('button', { name: '+ Add Position', exact: true }).click();
    await expect(recordRow(page, name)).toHaveCount(1);

    await deleteOnlyOurRecord(page, name);
    await verifyDeletedAfterReopen(page, 'Job Positions', name);
  });

  test('SET-LOCATION-REMOVE | SET_213 | Remove a newly created work location', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openTab(page, 'Work Locations');

    const name = newName('Location');
    await page.getByPlaceholder('Location name (required)', { exact: true }).first().fill(name);
    await page.getByRole('button', { name: '+ Add Location', exact: true }).click();
    await expect(recordRow(page, name)).toHaveCount(1);

    await deleteOnlyOurRecord(page, name);
    await verifyDeletedAfterReopen(page, 'Work Locations', name);
  });
});
