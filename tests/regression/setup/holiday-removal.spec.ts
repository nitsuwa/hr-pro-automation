import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

/**
 * SET_218–221 (PARTIAL): Holiday removal.
 *
 * The workbook text for this group contains copied Work Location/Position
 * wording, so this test covers only independently observable HR PRO Holiday
 * deletion. It is not full acceptance of those ambiguous Excel steps.
 *
 * Creates and deletes only one uniquely named QA holiday in a non-production
 * test context; pre-existing company holidays are never removed.
 */
test('SET-HOLIDAY-REMOVE | SET_218–221 | Remove only a newly created QA holiday', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Holiday deletions must not run in production',
  );

  await loginAs('systemAdmin');
  const openHolidays = async () => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Holidays', exact: true }).first().click();
  };

  const name = 'QA Remove Holiday ' + Date.now().toString(36);
  const dateOffset = Math.floor(Date.now() / 1000) % 700;
  const date = new Date(Date.UTC(2028, 0, 1) + dateOffset * 86_400_000).toISOString().slice(0, 10);

  await openHolidays();
  await page.getByRole('button', { name: '+ Add Holiday', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add Holiday', exact: true })).toBeVisible();
  await page.getByLabel('Date*', { exact: true }).fill(date);
  await page.getByLabel('Holiday name*', { exact: true }).fill(name);

  const holidayType = page.getByRole('combobox', { name: 'Type', exact: true });
  await expect(holidayType).toBeVisible();
  if (await holidayType.locator('option').count() > 1) {
    await holidayType.selectOption({ index: 1 });
  }
  await page.getByRole('button', { name: 'Add Holiday', exact: true }).click();

  const holidayRow = () => page.getByRole('row').filter({
    has: page.getByText(name, { exact: true }),
  });
  await expect(holidayRow(), 'Only our unique newly created QA holiday can be targeted').toHaveCount(1);

  // Interact with the Remove control inside the QA row; do not use
  // unscoped Remove buttons that could affect pre-existing holidays.
  const handleNativeDialog = async (dialog: import('@playwright/test').Dialog) => {
    if (dialog.type() === 'confirm' && /remov|delet/i.test(dialog.message())) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  };
  page.on('dialog', handleNativeDialog);
  try {
    await holidayRow().getByRole('button', { name: 'Remove', exact: true }).click();

    const confirmation = page.getByRole('dialog').or(page.getByRole('alertdialog'))
      .filter({ hasText: /remove|delete|sure/i }).first();
    if (await confirmation.isVisible()) {
      const approve = confirmation.getByRole('button', {
        name: /^(Remove|Delete|Confirm|Yes.*|OK)$/i,
      }).first();
      await expect(approve, 'A removal confirmation should provide an explicit action').toBeVisible();
      await approve.click();
    }

    await expect(holidayRow(), 'QA holiday should disappear after removal').toHaveCount(0);
    await openHolidays();
    await expect(holidayRow(), 'Removed QA holiday must remain absent after reopening').toHaveCount(0);
  } finally {
    page.off('dialog', handleNativeDialog);
  }
});
