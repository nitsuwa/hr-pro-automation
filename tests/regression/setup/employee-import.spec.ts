import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { readFile } from 'node:fs/promises';

/**
 * Excel SET_260–262: complete an official employee CSV template, upload it,
 * perform the import and verify that the new employee persists.
 *
 * Uses the template DOWNLOADED FROM THE APP in this same test run. The CSV
 * header is never hardcoded, so the candidate follows the real template.
 * Only one fictional QA employee is created; no existing records are edited.
 *
 * This is an unverified integration test until its Playwright UI run.
 */
test('SET-IMPORT-001 | SET_260–262 | Upload filled CSV template and import a QA employee', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Importing employees must run only against an approved test environment',
  );
  test.setTimeout(90_000);
  await loginAs('systemAdmin');
  await page.goto('/employees', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Employees', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Import records/i }).click();
  await expect(page.getByRole('heading', { name: 'Import Employee Records' })).toBeVisible();

  // Download the current official import template to preserve its actual
  // 39-column order and any comment/header lines.
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download template/i }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/\.csv$/i);

  const templatePath = await download.path();
  expect(templatePath, 'CSV template download should be complete').not.toBeNull();
  const rawTemplate = (await readFile(templatePath!, 'utf8')).replace(/^\uFEFF/, '');
  const lines = rawTemplate.trimEnd().split(/\r?\n/);

  const header = lines.find((line) => line.startsWith('Employee ID,'));
  expect(header, 'Downloaded template must have the official Employee ID header').toBeTruthy();
  const columns = header!.split(',');
  expect(columns, 'The imported CSV should preserve the expected 39 columns').toHaveLength(39);

  const suffix = Date.now().toString(36);
  const employeeName = 'QA CSV Import ' + suffix;
  const values: Record<string, string> = {
    'Name *': employeeName,
    Email: 'qa.import.' + suffix + '@example.com',
    Department: 'Operations',
    'Job Position': 'Operations Associate',
    'Work Location': 'Main Office',
    'Salary Type': 'Monthly',
    'Rate *': '22000',
    'Pay Schedule': 'Semi-Monthly',
    'Date of Hiring *': '2026-10-01',
    'Employment Type': 'Regular',
    'Employment Status': 'Active',
  };

  const escapeCsv = (value: string) => '"' + value.replace(/"/g, '""') + '"';
  const record = columns.map((column) => escapeCsv(values[column] ?? '')).join(',');
  const filledTemplate = lines.join('\n') + '\n' + record + '\n';

  const chooser = page.locator('input[type="file"]');
  await expect(chooser, 'Import wizard should offer a CSV file input').toHaveCount(1);
  await chooser.setInputFiles({
    name: 'hr-pro-qa-import-' + suffix + '.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(filledTemplate, 'utf8'),
  });

  // The wizard labels its submit button with the count, e.g. "Import 1".
  // Assert the intended QA employee is marked Ready before submitting.
  const preview = page.getByRole('row').filter({ hasText: employeeName });
  await expect(preview, 'The QA employee must appear in the import preview').toHaveCount(1);
  await expect(preview, 'The generated CSV row must pass the import validator').toContainText('Ready');
  const importButton = page.getByRole('button', { name: 'Import 1', exact: true });
  await expect(importButton, 'Valid CSV data should enable the one-employee import action').toBeEnabled();

  // Do not automatically approve unrelated confirmations. If the app presents
  // a native import confirmation, only accept one that identifies the action.
  const confirmImport = async (dialog: import('@playwright/test').Dialog) => {
    if (dialog.type() === 'confirm' && /import/i.test(dialog.message())) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  };
  page.on('dialog', confirmImport);
  try {
    await importButton.click();
  } finally {
    page.off('dialog', confirmImport);
  }

  // Check the actual employee list, not just the file chooser or preview.
  await page.goto('/employees', { waitUntil: 'domcontentloaded' });
  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await search.fill(employeeName);
  await expect(
    page.getByRole('row').filter({ hasText: employeeName }),
    'The newly imported QA employee should be listed once',
  ).toHaveCount(1);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(employeeName);
  await expect(
    page.getByRole('row').filter({ hasText: employeeName }),
    'The imported employee should remain after a full reload',
  ).toHaveCount(1);
});
