import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page, Dialog } from '@playwright/test';

/**
 * SET_228 and SET_229 — Leave Type Edit and Remove.
 *
 * From read-only V11 inventory: one unlabelled text field, plus number and
 * checkbox controls; actions "Save changes", "Cancel", "Remove leave type".
 *
 * Each test creates its own unique QA-only Leave Type, never changing seeded
 * SIL, VL or SL. Excel steps have copied wording; product-owner confirmation
 * of complete scenario acceptance remains outstanding.
 *
 * Run only in an approved non-production test environment.
 */
test.describe('HR PRO Setup — Leave Type edit and remove', () => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Leave Type maintenance changes test data and must not run in production',
  );

  const escapeRx = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '\\$&');

  async function openLeave(page: Page) {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Leave', exact: true }).click();
  }

  function leaveButton(page: Page, name: string) {
    return page.getByRole('button', { name: new RegExp(escapeRx(name)) });
  }

  async function addOwnLeave(page: Page, name: string) {
    await openLeave(page);
    await page.getByRole('button', { name: '+ Add Leave Type', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Add leave type', exact: true })).toBeVisible();
    await page.getByPlaceholder('e.g. Bereavement Leave', { exact: true }).fill(name);
    await page.getByRole('button', { name: 'Add leave type', exact: true }).click();
    await expect(leaveButton(page, name), 'The new QA Leave Type must exist once').toHaveCount(1);
  }

  async function openOwnEditor(page: Page, name: string) {
    const matching = leaveButton(page, name);
    await expect(matching, 'Only the uniquely created QA Leave Type may be edited').toHaveCount(1);
    await matching.click();

    // V11 showed exactly one unlabelled text input on the edit form.
    // Assert uniqueness instead of guessing a label or using an index.
    const nameInput = page.getByRole('main').getByRole('textbox');
    await expect(nameInput, 'The Leave Type editor should expose one text field').toHaveCount(1);
    await expect(nameInput).toHaveValue(name);
    await expect(page.getByRole('button', { name: 'Save changes', exact: true })).toBeVisible();
    return nameInput;
  }

  test('SET-LEAVE-EDIT | SET_228 | Rename a QA Leave Type and verify persistence', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    const initialName = 'QA Edit Leave ' + Date.now().toString(36);
    const newName = initialName + ' Updated';

    await addOwnLeave(page, initialName);
    const field = await openOwnEditor(page, initialName);
    await field.fill(newName);
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();

    await expect(leaveButton(page, newName), 'Updated Leave Type should appear once').toHaveCount(1);
    await expect(page.getByRole('cell', { name: initialName, exact: true }),
      'Original label should no longer appear').toHaveCount(0);

    await openLeave(page);
    await expect(leaveButton(page, newName), 'Renamed Leave Type must persist after reopen').toHaveCount(1);
    await expect(page.getByRole('cell', { name: initialName, exact: true })).toHaveCount(0);
  });

  test('SET-LEAVE-REMOVE | SET_229 | Remove a QA Leave Type and verify absence', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    const name = 'QA Remove Leave ' + Date.now().toString(36);
    await addOwnLeave(page, name);
    await openOwnEditor(page, name);

    const remove = page.getByRole('button', { name: 'Remove leave type', exact: true });
    await expect(remove, 'The QA leave editor should allow removal').toBeEnabled();

    // Only accept native deletion confirmation, never unrelated dialogs.
    const onDialog = async (dialog: Dialog) => {
      if (dialog.type() === 'confirm' && /remov|delet/i.test(dialog.message())) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    };
    page.on('dialog', onDialog);
    try {
      await remove.click();

      // Alternate versions may use an in-page confirmation modal.
      const confirmation = page.getByRole('dialog').or(page.getByRole('alertdialog'))
        .filter({ hasText: /remov|delet|sure/i }).first();
      if (await confirmation.isVisible()) {
        const approve = confirmation.getByRole('button', {
          name: /^(?:Remove.*|Delete.*|Confirm.*|Yes.*|OK)$/i,
        }).first();
        await expect(approve).toBeVisible();
        await approve.click();
      }

      await expect(leaveButton(page, name), 'Deleted QA Leave Type must disappear').toHaveCount(0);
      await openLeave(page);
      await expect(leaveButton(page, name), 'Deleted QA Leave Type must remain absent after reopen').toHaveCount(0);
    } finally {
      page.off('dialog', onDialog);
    }
  });
});
